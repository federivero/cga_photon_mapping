// Inherits from Light
function PointLight(transform, color, power) {
	Light.call(this, transform, color, power);
};

PointLight.prototype = Object.create(Light.prototype);
PointLight.prototype.constructor = PointLight;

PointLight.prototype.is_shadow = function(p, shape) {
	// TODO maybe join this with the trace function since it's copied from there
	let segment = new Vector();
	let direction = p.subtract(this.transform.position);
	let distance = direction.length();

	var asd = false;

	for (let i = 0, leni = Control.scene.shapes.length; i < leni; ++i) {
		let shape2 = Control.scene.shapes[i];
		// skip the target shape
		if (shape === shape2) {
			asd = true;
			continue;
		}
		let collisions = shape2.collide([this.transform.position, p]);
		for (let j = 0, lenj = collisions.length; j < lenj; ++j) {
			let current_collision = collisions[j];
			// for each collision, check if it's closer than our shape
			// check if the vector is on the right side
			segment = Vector.subtract(current_collision, this.transform.position, segment);
			if ((segment.dot(direction) >= 0) && (segment.length() < distance)) {
				return true;
			}
		}
	}
	if (asd) {
	}
	return false;
}
