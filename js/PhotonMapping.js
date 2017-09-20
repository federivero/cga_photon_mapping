
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

PhotonMapping.PHOTON_TOLERANCE = 1;

PhotonMapping.prototype.generatePhotons = function(scene){

	scene.calculateScenePower();

	this.calculatePhotonsPerLight(scene.lights, scene.scenePower);

	// shoot photons from each light
	for (var l = 0; l < this.photonsPerLight.length; l++){
		var light = this.photonsPerLight[l].light;
		for (var p = 0; p < this.photonsPerLight[l].photonCount; p++){
			var v = Vector.randomDirection();
			// shoot from light in direction v
			var photonAbsorbed = false;
			// to do: ask light for random point in case it's a non-punctual light
			var vectorStart = light.transform.position;
			var vectorEnd = v;
			Vector.add(vectorStart, vectorEnd, vectorEnd);

			var photon = new Photon(light.intensity, light.power / this.photonsPerLight[l].photonCount);

			while (!photonAbsorbed){
				let trace_result = scene.trace(vectorStart, vectorEnd);

				if (!trace_result.found){
					photonAbsorbed = true; // photon lost in the darkness, for real
				}else{
					// store photon

					// todo: russian roulette + handle reflection/refraction

					photon.position = trace_result.nearest_collision;
					photon.shape = trace_result.nearest_shape;
					this.storePhoton(photon);
					photonAbsorbed = true;
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
PhotonMapping.prototype.get_photons = function(map_type, position, tolerance = PhotonMapping.PHOTON_TOLERANCE, shape = null){
	let photon_map = this.get_map(map_type);
	let nearest_indexes = photon_map.kdtree.knn(position.toArray(), 5);
	let result = nearest_indexes.map(i => photon_map.photons[i]);
	// console.log(nearest_indexes)

	// for (let i = 0, leni = photon_map.length; i < leni; ++i){
	// 	if ((photon_map[i].shape == shape || shape == null) &&
	// 			photon_map[i].position.distanceTo(position) <= tolerance){
	// 		result.push(photon_map[i])
	// 	}
	// }
	return result;
}
