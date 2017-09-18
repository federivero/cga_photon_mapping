

Scene = function(shapes, lights, camera, viewport){
	this.shapes = shapes;
	this.lights = lights;
	this.camera = camera;
	this.viewport = viewport;
	// TODO: specify background_color in the constructor
	this.background_color = new Color();
	this.air_refraction_coefficient = 1;
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

// Traces a ray from v1 to v2 according to direction, and returns an object
// with found, nearest_shape and nearest_collision
Scene.prototype.trace = function(v1, v2, shape_to_ignore=null) {
    let found = false;
    let shortest_distance = -1;
    let nearest_shape = null;
    let nearest_collision = null;
    let segment = new Vector();
	// The dot product of this vector with any point shouldn't be negative
	let direction = v2.subtract(v1);
    for (let i = 0, len_i = this.shapes.length; i < len_i; ++i) {
        let shape = this.shapes[i];
		if ((shape_to_ignore !== null) && (shape_to_ignore === shape)) {
			continue;
		}
        let collisions = shape.collide([v1, v2]);
        for (let j = 0, len_j = collisions.length; j < len_j; ++j) {
            let current_collision = collisions[j];
            // for each collision, keep the closest point found yet
            // check if the vector is on the right side
            segment = Vector.subtract(current_collision, v1, segment);
            if ((segment.dot(direction) >= 0) && (!found || (segment.length() < shortest_distance))) {
                found = true;
                shortest_distance = segment.length();
                nearest_shape = shape;
                nearest_collision = current_collision;
            }
        };
    };
	// TODO: maybe use destructuring assignments?
	// https://stackoverflow.com/questions/2917175/return-multiple-values-in-javascript
    return {
        found: found,
        nearest_shape: nearest_shape,
        nearest_collision: nearest_collision
    };
}
