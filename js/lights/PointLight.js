// Inherits from Light
function PointLight(transform, intensity) {
	Light.call(this, transform, intensity);
};

PointLight.prototype = Object.create(Light.prototype);
PointLight.prototype.constructor = PointLight;

PointLight.prototype.is_shadow = function(p, shape) {
	// TODO join this with the trace function since it's copied from there
	let found = false;
	let v2 = pixels[row*canvas.width + col];
	let shortest_distance = -1;
	let nearest_shape = null;
	let nearest_collision = null;
	let segment = new Vector();
	Control.scene.shapes.forEach(function(shape2){
		// skip the target shape
		if (shape === shape2) {
			return
		}
		collisions = shape.collide([this.transform.position, p]);
		collisions.forEach(function(current_collision) {
			// for each collision, keep the closest point found yet
			// check if the vector is on the right side of the camera
			segment = Vector.subtract(current_collision, v1, segment);
			if ((segment.dot(direction) >= 0) && (!found || (segment.length() < shortest_distance))) {
				found = true;
				shortest_distance = segment.length();
				nearest_shape = shape;
				nearest_collision = current_collision;
			}
		});
	})
}


