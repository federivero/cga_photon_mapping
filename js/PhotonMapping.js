
PhotonMapEnum = {
	GLOBAL : 0,
	CAUSTIC : 1
}

PhotonMapping = function(photonCount){

	this.photonCount = photonCount || 0;
	this.photonsPerLight = [];

	this.photonMap = [];
}

PhotonMapping.prototype.generatePhotons = function(scene){

	scene.calculateScenePower();

	this.calculatePhotonsPerLight(scene.lights, scene.scenePower);

	var segment = new Vector();

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
					photonAbsorbed = true; // photon lost in the darkness, actually
				}else{
					// store photon

					// todo: russian roulette + handle reflection/refraction

					photon.position = trace_result.nearest_collision;
					this.storePhoton(photon);
					photonAbsorbed = true;
				}

			}
		}

	}


}

PhotonMapping.prototype.storePhoton = function(photon){
	this.photonMap.push(photon);
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
	var map = null;
	switch(type){
		case PhotonMapEnum.GLOBAL:
			map = this.photonMap;
			break;
		case PhotonMapEnum.CAUSTIC:
			map = this.causticPhotonMap;
			break;
	}


	var ccount = 0;

	var xPixelDensity = scene.viewport.width / canvas.width;
	var yPixelDensity = scene.viewport.height / canvas.height;

	context.fillStyle = "black";
	context.fillRect(0, 0, canvas.width, canvas.height);
	var imageData = context.getImageData(0, 0, canvas.width, canvas.height);

	for (var i = 0; i < map.length; i++){

		var vectorStart = map[i].position;
		var vectorEnd = scene.camera;

		var collision = scene.viewport.collidesWithRay([vectorStart, vectorEnd]);

		if (collision.length > 0){
			ccount++;

			var x = Math.round((collision[0].x - (scene.viewport.center.x - scene.viewport.width / 2) ) / xPixelDensity);
			var y = Math.round((collision[0].y - (scene.viewport.center.y - scene.viewport.height / 2) ) / yPixelDensity);
			var pixelIndex = 4 * (y * canvas.width - x); // to-do: think!
			imageData.data[pixelIndex] = map[i].color.r;
			imageData.data[pixelIndex + 1] = map[i].color.g;
			imageData.data[pixelIndex + 2] = map[i].color.b;
		}
	}

	context.putImageData(imageData, 0, 0);

}
