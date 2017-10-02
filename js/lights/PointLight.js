// Inherits from Light
function PointLight(transform, color, power) {
	Light.call(this, transform, color, power);
};

PointLight.prototype = Object.create(Light.prototype);
PointLight.prototype.constructor = PointLight;

// returns what percentage of point p is hidden from the light 
// (0 or 1 for point lights). Anywhere in between for square and directional lights
PointLight.prototype.shadow_coefficient = function(p, shape) {
	return (this.is_shadow(p,shape)? 1 : 0);
}

// Returns a random point within the light. It's used to either emit a photon or to meassure
// direct ilumination
PointLight.prototype.get_light_origin_point = function(){
	return (this.transform.position);
}

// Returns the main point of the light 
PointLight.prototype.get_light_main_point = function(){
	return (this.transform.position);
}

// Returns a direction for a new photon
PointLight.prototype.get_photon_direction = function(){
	return Vector.randomDirection();
}

PointLight.prototype.is_shadow = function(p, shape) {
	// TODO maybe join this with the trace function since it's copied from there
	let segment = new Vector();
	let direction = p.subtract(this.transform.position);
	let distance = direction.length();

	for (let i = 0, leni = Control.scene.shapes.length; i < leni; ++i) {
		let shape2 = Control.scene.shapes[i];
		// skip the target shape
		if (shape === shape2) {
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
	return false;
}
