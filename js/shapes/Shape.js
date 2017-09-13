const nPhong = 5

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
	let light_component = this.calculate_light_color(collision, v1, v2);
	// here call calculate_reflection_color and calculate_refraction_color with depth-1
	return light_component;
};

// Calculate the color in 'collision' from the lights
Shape.prototype.calculate_light_color = function(collision, v1, v2) {
	let light_direction = new Vector();
	let normal = new Vector();
	ret_color = new Color();
	for(let i = 0, len = Control.scene.lights.length; i < len; ++i) {
		light = Control.scene.lights[i];
		light_direction = Vector.subtract(light.transform.position, collision, light_direction);
		normal = this.calculate_normal(collision, normal);
		// if the current light is on the visible side
		// and the point isn't shadowed by another one
		if ((light_direction.dot(normal) > 0) && (!light.is_shadow(collision, this))) {
			light_direction = Vector.unit(light_direction, light_direction);
			let dif_factor = light_direction.dot(normal);
			ret_color.r += Math.max(0, dif_factor * this.color.r);
			ret_color.g += Math.max(0, dif_factor * this.color.g);
			ret_color.b += Math.max(0, dif_factor * this.color.b);
		}
	}
	return ret_color;
}

// Calculate the color in 'collision' from the reflection
shape.prototype.calculate_reflection_color = function(collision, p1, p2, depth, refraction_coefficient) {
	return new Color();
}

// Calculate the color in 'collision' from the refraction
shape.prototype.calculate_refraction_color = function(collision, p1, p2, depth, refraction_coefficient) {
	return new Color();
}