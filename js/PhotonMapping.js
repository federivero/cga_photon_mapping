
// HACK: do this because I don't know how to use browserify
let createKDTree = window.kdtree;

const PhotonMapEnum = {
	GLOBAL : 0,
	CAUSTIC : 1
}

PhotonMapping = function(globalPhotonCount, causticPhotonCount){
	this.globalPhotonMap = {
		photonCount: globalPhotonCount || 0,
		photons: [],
		kdtree: null
	};

	this.causticPhotonMap = {
		photonCount: causticPhotonCount || 0,
		photons: [],
		kdtree: null
	}
}

PhotonMapping.MAX_PHOTON_BOUNCE = 4; // overriden by config
PhotonMapping.PHOTON_PROPORTION = 0.001; // overriden by config
PhotonMapping.NEARBY_PHOTON_PER_POINT_TYPE = "fixed"; // overriden by config. Options: "fixed", "proportional"
PhotonMapping.NEARBY_PHOTON_FIXED_QUANTITY = 1000; // overriden by config

PhotonMapping.prototype.generatePhotons = function(map_type, scene){
	let photonMap = this.get_map(map_type);
	let photonsPerLight = this.calculatePhotonsPerLight(scene.lights, scene.scenePower, photonMap.photonCount);

	// shoot photons from each light
	for (let l = 0; l < photonsPerLight.length; l++){
		let light = photonsPerLight[l].light;
		emitted_photons = photonsPerLight[l].photonCount;
		// lifted straight from the book
		while (emitted_photons--) {
			let vector_end = Vector.randomDirection();
			// shoot from light in direction v
			let photonAbsorbed = false;
			// TODO: ask light for random point in case it's a non-punctual light
			let vector_start = light.transform.position;
			Vector.add(vector_start, vector_end, vector_end);
			let bounces = 0;
			let current_color = light.color;
			let refraction_coefficient = scene.air_refraction_coefficient;
			let shape = null;
			let trace_result = null;
			if (map_type == PhotonMapEnum.CAUSTIC) {
				// WARNING: IF THERE ARE NO REACHABLE CAUSTICS IN THE SCENE FOR THIS LIGHT THIS WILL BREAK
				// TODO: add an error if there aren't caustics in the scene
				// TODO: currently the trace_result is calculated again at the start of the loop, maybe fix this?
				// let x = 0;
				while (true) {
					trace_result = scene.trace(vector_start, vector_end);
					if (trace_result.found && ((trace_result.nearest_shape.is_mirror && trace_result.nearest_shape.specular_coefficient > 0) || trace_result.nearest_shape.transparency > 0)) {
						break;
					}
					vector_end = Vector.randomDirectionCartesian(vector_end);
					Vector.add(vector_start, vector_end, vector_end);
				}
			}
			// TODO: move depth to an external parameter
			let max_bounce = PhotonMapping.MAX_PHOTON_BOUNCE;
			if (map_type === PhotonMapEnum.CAUSTIC) {
				max_bounce = 3
			}
			while (!photonAbsorbed && bounces < max_bounce){
				trace_result = scene.trace(vector_start, vector_end, shape);
				if (!trace_result.found){
					photonAbsorbed = true; // photon lost in the darkness, for real
				} else {
					// I'll use the monochromatic implementation but with colors for each photon
					shape = trace_result.nearest_shape;
					let collision = trace_result.nearest_collision;
					let roulette = Math.random();

					if (roulette < shape.diffuse_reflection_coefficient) {
						// diffuse reflection
						// don't save the first step
						if (bounces !== 0) {
							let photon = new Photon(
								current_color, collision,
								light.power / photonsPerLight[l].photonCount,
								vector_start, shape
							);
							photonMap.photons.push(photon);
						}
						// set vector_start, vector_end, current_color for the next step
						vector_start = collision;
						vector_end = shape.diffuse_reflection_direction(collision, refraction_coefficient, vector_end);
						current_color = shape.calculate_diffuse_photon_color(current_color, collision);

					} else if (roulette < shape.specular_coefficient + shape.diffuse_reflection_coefficient) {
						//specular reflection
						if (map_type === PhotonMapEnum.CAUSTIC) {
							let reflection_direction = shape.specular_reflection_direction(collision, vector_start, refraction_coefficient, vector_end);
							Vector.add(collision, reflection_direction, vector_end);
							vector_start = collision;
							// TODO: allow for colored mirrors
							current_color = current_color;
						} else if (map_type === PhotonMapEnum.GLOBAL) {
							photonAbsorbed = true;
						}
					} else if (roulette < shape.transparency + shape.specular_coefficient + shape.diffuse_reflection_coefficient){
						//transmission
						if (map_type === PhotonMapEnum.CAUSTIC) {
							let refraction_result =  shape.refraction_direction(collision, vector_start, refraction_coefficient, vector_end);
							refraction_coefficient = refraction_result.opposite_refraction_coefficient;
							// same as in calculate_refraction_color
							// I know it's a mess, sorry

							// don't collide with the exit surface
							let exit_vector = refraction_result.exit_vector;
							let collision_no_error = exit_vector.multiply(0.0001);
							Vector.add(collision, collision_no_error, collision_no_error);
							Vector.add(exit_vector, collision_no_error, vector_end);
							vector_start = collision_no_error;
							// shape to ignore is null so it can collide with itself
							shape = null;
							// TODO: allow for colored glass
							current_color = current_color;
						} else if (map_type === PhotonMapEnum.GLOBAL) {
							photonAbsorbed = true;
						}
					} else {
						// absorption
						// don't save the first step
						if (bounces !== 0) {
							let photon = new Photon(
								current_color, collision,
								light.power / photonsPerLight[l].photonCount,
								vector_start, shape
							);
							photonMap.photons.push(photon);
						}
						photonAbsorbed = true;
					}
					++bounces;
				}
			}
		}
	}
	photonMap.kdtree = this.generateKDTree(photonMap.photons);
}

// given a list of photons returns the kdtree for those photons
PhotonMapping.prototype.generateKDTree = function(photons) {
	let points = photons.map(photon => {
		return photon.position.toArray();
	});
	return createKDTree(points);
}

PhotonMapping.prototype.calculatePhotonsPerLight = function(lights, scenePower, photonCount){
	let photonsPerLight = [];
	for (let i = 0; i < lights.length; i++){
		let lightPhotonCount = Math.round(photonCount * lights[i].power / scenePower);
		photonsPerLight.push({
			light : lights[i],
			photonCount : lightPhotonCount
		});
	}
	return photonsPerLight;
}

// Draws the photons into the canvas.
// type: the photon map to draw (global, caustic, etc)
// clear_canvas (boolean): if true, tints the canvs width black
PhotonMapping.prototype.drawPhotonMap = function(type, scene, clear_canvas){
	let photon_map = this.get_map(type).photons;

	let xPixelDensity = scene.viewport.width / canvas.width;
	let yPixelDensity = scene.viewport.height / canvas.height;

	if (clear_canvas){
		context.fillStyle = "black";
		context.fillRect(0, 0, canvas.width, canvas.height);
	}

	let imageData = context.getImageData(0, 0, canvas.width, canvas.height);

	for (let i = 0; i < photon_map.length; i++){

		let vectorStart = photon_map[i].position;
		if (scene.inFrontOfCamera(vectorStart)) {
			let vectorEnd = scene.camera;

			let collision = scene.viewport.collidesWithRay([vectorStart, vectorEnd]);

			if (collision.length > 0){
				let x = Math.round((collision[0].x - (scene.viewport.center.x - scene.viewport.width / 2) ) / xPixelDensity);
				let y = Math.round((collision[0].y - (scene.viewport.center.y - scene.viewport.height / 2) ) / yPixelDensity);
				let pixelIndex = 4 * ( canvas.width * (canvas.height - y) + x);
				imageData.data[pixelIndex] = photon_map[i].color.r;
				imageData.data[pixelIndex + 1] = photon_map[i].color.g;
				imageData.data[pixelIndex + 2] = photon_map[i].color.b;
			}
		}
	}

	context.putImageData(imageData, 0, 0);

}

PhotonMapping.prototype.get_map = function(map_type){
	let photon_map = null;
	switch(map_type){
		case PhotonMapEnum.GLOBAL:
			photon_map = this.globalPhotonMap;
			break;
		case PhotonMapEnum.CAUSTIC:
			photon_map = this.causticPhotonMap;
			break;
	}
	return photon_map;
}

/*
	Returns photons near desired position. Option: limit to photons in a given shape
*/
PhotonMapping.prototype.get_photons = function(map_type, position, shape=null, max_distance=Infinity){
	let photon_map = this.get_map(map_type);
	let nearest_indexes = photon_map.kdtree.knn(position.toArray(), this.photon_count_per_point(map_type), max_distance);
	return nearest_indexes.filter(i => (shape == null) || (photon_map.photons[i].shape == shape)).map(i => photon_map.photons[i]);
}

PhotonMapping.prototype.photon_count_per_point = function(map_type){
	let photon_map = this.get_map(map_type);
	let photon_count = 0;
	if (PhotonMapping.NEARBY_PHOTON_PER_POINT_TYPE === "fixed" || map_type === PhotonMapEnum.CAUSTIC){
		// photons as fixed quantity
		photon_count = PhotonMapping.NEARBY_PHOTON_FIXED_QUANTITY;
	}else if (PhotonMapping.NEARBY_PHOTON_PER_POINT_TYPE == "proportional"){
		photon_count = Math.floor(PhotonMapping.PHOTON_PROPORTION * photon_map.photons.length);
	}
	return photon_count;
}
