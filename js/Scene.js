

Scene = function(shapes, lights, camera, viewport){
	this.shapes = shapes;
	this.lights = lights;
	this.camera = camera;
	this.viewport = viewport;
}

Scene.prototype.calculateScenePower = function(){
	this.scenePower = 0;
	for (var i = 0; i < this.lights.length; i++){
		this.scenePower += this.lights[i].power;
	}
}

Scene.prototype.getCameraDirection = function(){
	if (this.cameraDirection == undefined){
		this.cameraDirection = this.viewport.center.subtract(this.camera);
	}
	return this.cameraDirection;
}

Scene.prototype.inFrontOfCamera = function(point){
	return (point.dot(this.getCameraDirection()) >= 0);
}