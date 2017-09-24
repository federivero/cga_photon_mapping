
// HACK: do this because I don't know how to use browserify
let createKDTree = window.kdtree;

const PhotonMapEnum = {
	GLOBAL : 0,
	CAUSTIC : 1
}

PhotonMapping = function(photonCount){

	this.photonCount = photonCount || 0;
	this.photonsPerLight = [];

	this.photonMap = {
		photons: [],
		kdtree: null
	};
}

PhotonMapping.MAX_PHOTON_BOUNCE = 4;
PhotonMapping.PHOTON_PROPORTION = 0.001;


PhotonMapping.prototype.generatePhotons = function(scene){

	scene.calculateScenePower();

	this.calculatePhotonsPerLight(scene.lights, scene.scenePower);

	// shoot photons from each light
	for (let l = 0; l < this.photonsPerLight.length; l++){
		let light = this.photonsPerLight[l].light;
		emitted_photons = this.photonsPerLight[l].photonCount;
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
			let shape = null;
			// TODO: move depth to an external parameter
			while (!photonAbsorbed && bounces < PhotonMapping.MAX_PHOTON_BOUNCE){
				let trace_result = scene.trace(vector_start, vector_end, shape);
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
								light.power / this.photonsPerLight[l].photonCount,
								vector_start, shape
							);
							this.storePhoton(photon);
						}
						// set vector_start, vector_end, current_color for the next step
						vector_start = collision
						vector_end = shape.diffuse_reflection_direction(collision, vector_end);
						current_color = shape.calculate_diffuse_photon_color(current_color);

					} else if (roulette < shape.specular_coefficient + shape.diffuse_reflection_coefficient) {
						//specular reflection
						// use specular_reflection_direction
						photonAbsorbed = true;
					} else if (roulette < shape.transparency + shape.specular_coefficient + shape.diffuse_reflection_coefficient){
						//transmission
						// use refraction_direction
						photonAbsorbed = true;
					} else {
						// absorption
						// don't save the first step
						if (bounces !== 0) {
							let photon = new Photon(
								current_color, collision,
								light.power / this.photonsPerLight[l].photonCount,
								vector_start, shape
							);
							this.storePhoton(photon);
						}
						photonAbsorbed = true;
					}
					++bounces;
				}
			}
		}
	}
	this.generateKDTree();
}

PhotonMapping.prototype.generateKDTree = function() {
	let points = this.photonMap.photons.map(photon => {
		return photon.position.toArray();
	});
	this.photonMap.kdtree = createKDTree(points);
}

PhotonMapping.prototype.storePhoton = function(photon){
	this.photonMap.photons.push(photon);
}

PhotonMapping.prototype.calculatePhotonsPerLight = function(lights, scenePower){
	for (var i = 0; i < lights.length; i++){
		var lightPhotonCount = Math.round(this.photonCount * lights[i].power / scenePower);
		this.photonsPerLight.push({light : lights[i], photonCount : lightPhotonCount});
	}
}

// Draws the photons into the canvas.
// type: the photon map to draw (global, caustic, etc)
PhotonMapping.prototype.drawPhotonMap = function(type, scene){
	let photon_map = this.get_map(type).photons;

	let ccount = 0;

	let xPixelDensity = scene.viewport.width / canvas.width;
	let yPixelDensity = scene.viewport.height / canvas.height;

	context.fillStyle = "black";
	context.fillRect(0, 0, canvas.width, canvas.height);
	let imageData = context.getImageData(0, 0, canvas.width, canvas.height);

	for (let i = 0; i < photon_map.length; i++){

		let vectorStart = photon_map[i].position;
		let vectorEnd = scene.camera;

		let collision = scene.viewport.collidesWithRay([vectorStart, vectorEnd]);

		if (collision.length > 0){// && scene.inFrontOfCamera(collision[0])){
			ccount++;

			let x = Math.round((collision[0].x - (scene.viewport.center.x - scene.viewport.width / 2) ) / xPixelDensity);
			let y = Math.round((collision[0].y - (scene.viewport.center.y - scene.viewport.height / 2) ) / yPixelDensity);
			let pixelIndex = 4 * ( canvas.width * (canvas.height - y) + x);
			imageData.data[pixelIndex] = photon_map[i].color.r;
			imageData.data[pixelIndex + 1] = photon_map[i].color.g;
			imageData.data[pixelIndex + 2] = photon_map[i].color.b;
		}
	}

	context.putImageData(imageData, 0, 0);

}

PhotonMapping.prototype.get_map = function(type){
	let photon_map = null;
	switch(type){
		case PhotonMapEnum.GLOBAL:
			photon_map = this.photonMap;
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
PhotonMapping.prototype.get_photons = function(map_type, position, quantity, shape=null){
	let photon_map = this.get_map(map_type);
	// photons as a proportion	
	// let nearest_indexes = photon_map.kdtree.knn(position.toArray(), this.photon_count_per_point(map_type));
	// photons as quantity
	let nearest_indexes = photon_map.kdtree.knn(position.toArray(), quantity);
	return nearest_indexes.filter(i => (shape == null) || (photon_map.photons[i].shape == shape)).map(i => photon_map.photons[i]);
}

PhotonMapping.prototype.photon_count_per_point = function(map_type){
	let photon_map = this.get_map(map_type);
	return Math.floor(PhotonMapping.PHOTON_PROPORTION * photon_map.photons.length);
	//return nearby_photon_qty;
}
