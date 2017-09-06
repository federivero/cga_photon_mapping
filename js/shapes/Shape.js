function Shape(transform, color) {
	this.transform = transform;
	this.color = color;
};

Shape.prototype = {};

Shape.prototype.collide = function(ray) {
	// Abstract
	// ray is an array of two points, ray[0] the first and ray[1] the second
	throw new Error('Shape does not implement this!');
};

Shape.prototype.calculate_normal = function(p, normal=null) {
	// Abstract
	// Determines the normal in point p
	// If normal is provided, no memory is allocated
	throw new Error('Shape does not implement this!');
};

// Determines the color in the point 'collision' for the ray v1->v2
// 'depth' determines how many recursive steps will be done (for reflection and refraction)
// 'refraction_coefficient' is the refraction coefficient of the material from where the ray is coming from
// by default it's the air
Shape.prototype.calculate_color = function(collision, v1, v2, depth, refraction_coefficient=1) {
	// Calculate light color
	let light_direction = new Vector();
	let normal = new Vector();
	for(let i = 0, len = Control.scene.lights.length; i < len; ++i) {
		light = Control.scene.lights[i];
		light_direction = Vector.subtract(light.transform.position, collision, light_direction);
		normal = this.calculate_normal(collision, normal);
		// if the current light is on the visible side
		// and the point isn't shadowed by another one
		if ((light_direction.dot(normal) > 0) && (!light.is_shadow(collision, this))) {
			light_direction = Vector.unit(light_direction, light_direction);
			// TODO complete this
			return this.color
		} else {
			return new Color (0, 0, 0);
		}
	}
};
