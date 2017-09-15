const nPhong = 5

function Shape(transform, diffuse_color, specular_constant, specular_color, is_mirror) {
	this.transform = transform;
	this.diffuse_color = diffuse_color;
	this.specular_constant = specular_constant;
	this.specular_color = specular_color;
	// is_mirror distinguishes between a reflective surface and one that is merely shiny
	this.is_mirror = is_mirror;
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
	let specular_component, refraction_component;
	if (depth > 0) {
		// is_mirror distinguishes between a reflective surface and one that is merely shiny
		if ((this.specular_constant > 0) && (this.is_mirror === true)) {
			specular_component = this.calculate_specular_color(
				collision, v1, v2, depth-1, refraction_coefficient
			);
		} else{
			specular_component = new Color();
		}
	}
	// here call calculate_specular_color and calculate_refraction_color with depth-1
	return new Color(
		light_component.r + this.specular_constant * specular_component.r,
		light_component.g + this.specular_constant * specular_component.g,
		light_component.b + this.specular_constant * specular_component.b
	);
};

// Calculate the color in 'collision' from the lights
Shape.prototype.calculate_light_color = function(collision, v1, v2) {
	let light_direction = new Vector();
	let normal = this.calculate_normal(collision);
	ret_color = new Color();
	for(let i = 0, len = Control.scene.lights.length; i < len; ++i) {
		light = Control.scene.lights[i];
		light_direction = Vector.subtract(light.transform.position, collision, light_direction);
		// if the current light is on the visible side
		// and the point isn't shadowed by another one
		if ((light_direction.dot(normal) > 0) && (!light.is_shadow(collision, this))) {
			// Angle factor
			light_direction = Vector.unit(light_direction, light_direction);
			let dif_factor = light_direction.dot(normal);
			// Specular highlights
			// esto esta levantado directo de unas diapositivas
			let vect_V = v1.subtract(collision).unit();
			let vect_R = normal.multiply(2 * normal.dot(light_direction)).subtract(light_direction);
			let spec_RVnK_factor = this.specular_constant * Math.pow(vect_V.dot(vect_R), nPhong);

			ret_color.r += Math.max(0, dif_factor * this.diffuse_color.r + spec_RVnK_factor * this.specular_color.r);
			ret_color.g += Math.max(0, dif_factor * this.diffuse_color.g + spec_RVnK_factor * this.specular_color.g);
			ret_color.b += Math.max(0, dif_factor * this.diffuse_color.b + spec_RVnK_factor * this.specular_color.b);
		}
	}
	return ret_color;
}

// Calculate the reflection component of the color in 'collision'
Shape.prototype.calculate_specular_color = function(collision, v1, v2, depth, refraction_coefficient) {
	let normal = this.calculate_normal(collision);
	// TODO: when adding refraction
	// if (this->refraccion == material) {
	// 	normal = normal.negado();
	// }
	let source_direction = v1.subtract(collision);
	Vector.unit(source_direction, source_direction);
	// Simetrizar source_direction respecto a la normal
	let reflection_direction = normal.multiply(2 * (normal.dot(source_direction)));
	// Un punto en la direccion de reflection_direction
	let reflection_v2 = reflection_direction.add(collision);
	let trace_result = Control.scene.trace(collision, reflection_v2, this);
	if (trace_result.found === true) {
		return x = trace_result.nearest_shape.calculate_color(
			trace_result.nearest_collision,
			collision,
			reflection_v2,
			depth, refraction_coefficient
		)
	} else {
		return Control.scene.background_color.clone()
	}
}

// Calculate the refraction component of the color in 'collision'
Shape.prototype.calculate_refraction_color = function(collision, v1, v2, depth, refraction_coefficient) {
	return new Color();
}
