// photons farther away than this are filtered out
const max_caustic_photon_distance = 1;

function Shape (transform,
				diffuse_color, diffuse_reflection_coefficient,
				specular_color, specular_coefficient=0,
				is_mirror=false, transparency=0, refraction_coefficient=0) {
	if (diffuse_reflection_coefficient + specular_coefficient + transparency > 1) {
		throw new Error('diffuse_reflection_coefficient + specular_coefficient + transparency must be less than 1!');
	}

	this.transform = transform;

	this.diffuse_color = diffuse_color;
	this.diffuse_reflection_coefficient = diffuse_reflection_coefficient;

	this.specular_color = specular_color;
	this.specular_coefficient = specular_coefficient;
	// is_mirror distinguishes between a reflective surface and one that is merely shiny
	this.is_mirror = is_mirror;
	this.transparency = transparency;
	this.refraction_coefficient = refraction_coefficient;
};

Shape.DIFFUSE_PHOTON_SCALE_FACTOR = 1; // overriden by config
Shape.CAUSTIC_PHOTON_SCALE_FACTOR = 1; // overriden by config
Shape.NPHONG = 5; // overriden by config

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
Shape.prototype.calculate_color = function(collision, v1, v2, depth, refraction_coefficient=Control.scene.air_refraction_coefficient) {
	// Calculate light color
	let light_component = this.calculate_light_color(collision, v1, v2);
	let specular_component, refraction_component, diffuse_reflection_component, caustic_component;
	if (depth > 0) {
		// is_mirror distinguishes between a reflective surface and one that is merely shiny
		if ((this.specular_coefficient > 0) && (this.is_mirror === true)) {
			specular_component = this.calculate_specular_color(
				collision, v1, v2, depth-1, refraction_coefficient
			);
		} else {
			specular_component = new Color();
		}
		if (this.transparency > 0) {
			refraction_component = this.calculate_refraction_color(
				collision, v1, v2, depth-1, refraction_coefficient
			)
		} else {
			refraction_component = new Color();
		}
	}
	if (!this.is_mirror) {
		diffuse_reflection_component = this.calculate_photons_color(PhotonMapEnum.GLOBAL, collision, false);
	} else {
		diffuse_reflection_component = new Color();
	}
	caustic_component = this.calculate_photons_color(PhotonMapEnum.CAUSTIC, collision, true);
	// this is for seeing only the refraction component
	// return new Color(
	// 	(
	// 		caustic_component.r * Shape.CAUSTIC_PHOTON_SCALE_FACTOR
	// 	),
	// 	(
	// 		caustic_component.g * Shape.CAUSTIC_PHOTON_SCALE_FACTOR
	// 	),
	// 	(
	// 		caustic_component.b * Shape.CAUSTIC_PHOTON_SCALE_FACTOR
	// 	)
	// );
	return new Color(
		(
			this.diffuse_reflection_coefficient * light_component.r
			+ this.specular_coefficient * specular_component.r
			+ this.transparency * refraction_component.r
			+ diffuse_reflection_component.r * Shape.DIFFUSE_PHOTON_SCALE_FACTOR
			+ caustic_component.r * Shape.CAUSTIC_PHOTON_SCALE_FACTOR
		),
		(
			this.diffuse_reflection_coefficient * light_component.g
			+ this.specular_coefficient * specular_component.g
			+ this.transparency * refraction_component.g
			+ diffuse_reflection_component.g * Shape.DIFFUSE_PHOTON_SCALE_FACTOR
			+ caustic_component.g * Shape.CAUSTIC_PHOTON_SCALE_FACTOR
		),
		(
			this.diffuse_reflection_coefficient * light_component.b
			+ this.specular_coefficient * specular_component.b
			+ this.transparency * refraction_component.b
			+ diffuse_reflection_component.b * Shape.DIFFUSE_PHOTON_SCALE_FACTOR
			+ caustic_component.b * Shape.CAUSTIC_PHOTON_SCALE_FACTOR
		)
	);
};

// Calculate the color of a diffuse reflected photon
// If ret is provided then it is used for the return result
Shape.prototype.calculate_diffuse_photon_color = function(incoming_color, ret=null) {
	if (ret === null) {
		ret = new Color();
	}
	// Actually, divide both by 255 (to get a number between 0 and 1)
	// And then multiply by 255 (to get a color)
	ret.r = (this.diffuse_color.r) * (incoming_color.r / 255) / this.diffuse_reflection_coefficient;
	ret.g = (this.diffuse_color.g) * (incoming_color.g / 255) / this.diffuse_reflection_coefficient;
	ret.b = (this.diffuse_color.b) * (incoming_color.b / 255) / this.diffuse_reflection_coefficient;
	return ret;
};

// Calculate de direction of a photon bounce (always will be a random hemisphere direction)
// if ret is provided then it is used for the return result
Shape.prototype.diffuse_reflection_direction = function(collision, refraction_coefficient, ret=null) {
	if (ret == null) {
		ret = new Vector();
	}
	let normal = this.calculate_normal(collision);
	// random direction of bounce
	let x, y, z;
	do {
		do {
			// random number between -1 and 1
			x = Math.random() * 2 - 1;
			y = Math.random() * 2 - 1;
			z = Math.random() * 2 - 1;
			// use simple rejection sampling to find diffuse photon direction
		} while (x*x + y*y + z*z > 1);
		ret.x = x;
		ret.y = y;
		ret.z = z;
	} while (ret.dot(normal) < 0);
	Vector.add(collision, ret, ret);
	return ret;
}

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
			let light_intensity = light.intensity();
			// Angle factor
			light_direction = Vector.unit(light_direction, light_direction);
			let dif_factor = light_direction.dot(normal);
			// Specular highlights
			// esto esta levantado directo de unas diapositivas
			let vect_V = v1.subtract(collision).unit();
			let vect_R = normal.multiply(2 * normal.dot(light_direction)).subtract(light_direction);
			let spec_RVnK_factor = this.specular_coefficient * Math.pow(vect_V.dot(vect_R), Shape.NPHONG);

			let diffuse_color = this.get_diffuse_color(collision);

			ret_color.r += Math.max(0, light_intensity.r * dif_factor * diffuse_color.r + spec_RVnK_factor * this.specular_color.r);
			ret_color.g += Math.max(0, light_intensity.g * dif_factor * diffuse_color.g + spec_RVnK_factor * this.specular_color.g);
			ret_color.b += Math.max(0, light_intensity.b * dif_factor * diffuse_color.b + spec_RVnK_factor * this.specular_color.b);
		}
	}
	return ret_color;
}

/*
	Returns the diffuse_color of the shape at point p. Shapes with texture override
	this method and return the proper color for the point
*/
Shape.prototype.get_diffuse_color = function(p){
	return this.diffuse_color;
}

// Calculate de direction of a specular reflection
// if reflection_direction is provided then it is used for the return result
Shape.prototype.specular_reflection_direction = function(collision, v1, refraction_coefficient, reflection_direction=null) {
	if (reflection_direction == null) {
		reflection_direction = new Vector();
	}
	let normal = this.calculate_normal(collision);
	if (this.refraction_coefficient == refraction_coefficient) {
		Vector.negative(normal, normal);
	}
	let source_direction = reflection_direction;
	Vector.subtract(v1, collision, source_direction);
	Vector.unit(source_direction, source_direction);
	// Simetrizar source_direction respecto a la normal
	Vector.multiply(normal, 2*(normal.dot(source_direction)), reflection_direction)
	return reflection_direction;
}

// Calculate the reflection component of the color in 'collision'
Shape.prototype.calculate_specular_color = function(collision, v1, v2, depth, refraction_coefficient) {
	let reflection_direction = this.specular_reflection_direction(collision, v1, refraction_coefficient);
	// Un punto en la direccion de reflection_direction
	let reflection_v2 = reflection_direction.add(collision);

	let trace_result = Control.scene.trace(collision, reflection_v2, this);
	if (trace_result.found === true) {
		return x = trace_result.nearest_shape.calculate_color(
			trace_result.nearest_collision,
			collision,
			reflection_v2,
			depth, refraction_coefficient
		);
	} else {
		return Control.scene.background_color.clone();
	}
}

// Calculate de direction of a transmission
// if ret is provided then it is used for the return result
Shape.prototype.refraction_direction = function(collision, v1, refraction_coefficient, exit_vector=null) {
	if (exit_vector == null) {
		exit_vector = new Vector();
	}
	//para calcular el vector de salida:
	//		-transformo el vector de incidencia en uno que sale del punto colision (direccionFuente)
	//		-calculo el cross product entre direccionFuente y la normal para hallar el vector perpendicular
	//		-calculo el angulo entre el direccionFuente y la normal
	//		-calculo el angulo de salida usando los materiales
	//		-roto usando la matriz de rotacion respecto a ese angulo y el eje es el del cross product
	//		-si todo sale bien me sale un vector para el lado correcto

	// TODO: there are a lot of allocations here that could be avoided
	let normal = this.calculate_normal(collision);
	if (this.refraction_coefficient == refraction_coefficient) {
		Vector.negative(normal, normal);
	}
	let source_direction = v1.subtract(collision);
	Vector.unit(source_direction, source_direction);

	let entry_angle = source_direction.angleTo(normal);

	let axis = normal.cross(source_direction);
	// let axis = source_direction.cross(normal);
	Vector.unit(axis, axis);
	//logica de adentro/afuera: si el rayo viene con el mismo material es que estoy adentro y por lo tanto tengo que salir afuera
	//esto implica que no puede haber un objeto refractante dentro de otro
	let opposite_refraction_coefficient;
	if (this.refraction_coefficient !== refraction_coefficient) {
		opposite_refraction_coefficient = this.refraction_coefficient;
	} else {
		opposite_refraction_coefficient = Control.scene.air_refraction_coefficient;
	}
	// total internal reflection
	let critical_angle = Math.asin(opposite_refraction_coefficient / refraction_coefficient);
	if (entry_angle >= critical_angle) {
		// TODO: is this right??
		exit_vector = this.specular_reflection_direction(collision, v1, refraction_coefficient, exit_vector);
		opposite_refraction_coefficient = refraction_coefficient;
	} else {
		let exit_angle = Math.asin( (Math.sin(entry_angle) * (refraction_coefficient / opposite_refraction_coefficient)) );
		Vector.negative(normal, normal);
		Vector.rotate(normal, axis, exit_angle, exit_vector);
	}
	return {
		exit_vector: exit_vector,
		opposite_refraction_coefficient: opposite_refraction_coefficient
	};

}

// Calculate the refraction component of the color in 'collision'
// limitation: there can't be a transparent thing inside of another one
// to solve this refraction_coefficient should be a stack
Shape.prototype.calculate_refraction_color = function(collision, v1, v2, depth, refraction_coefficient) {
	let refraction_result = this.refraction_direction(collision, v1, refraction_coefficient);
	let exit_vector = refraction_result.exit_vector;
	let opposite_refraction_coefficient = refraction_result.opposite_refraction_coefficient;
	// don't collide with the exit surface
	let collision_no_error = exit_vector.multiply(0.0001);
	Vector.add(collision, collision_no_error, collision_no_error);
	// repurpose exit_vector into a new into v2
	Vector.add(exit_vector, collision_no_error, exit_vector);
	// shape to ignore is null so it can collide with itself
	trace_result = Control.scene.trace(collision_no_error, exit_vector);
	if (trace_result.found === true) {
		return trace_result.nearest_shape.calculate_color(
			trace_result.nearest_collision, collision, exit_vector,
			depth, opposite_refraction_coefficient
		)
	} else {
		return Control.scene.background_color.clone();
	}
}


Shape.prototype.gaussian_filter = function(distance, computed_max_distance) {
	// Page 33 of the book Siggraph 2002 - Course 43 - A Practical Guide To Global Illumination Using Photon Mapping
	// computed_max_distance is max_distance squared times 2
	return (
		0.918 * (1 - ((1 - Math.pow(Math.E, (-1.953 * (Math.pow(distance, 2) / computed_max_distance)))) / 0.8581521110346773))
	)
}

Shape.prototype.calculate_diffuse_photons_color = function(collision, v1, v2, depth, refraction_coefficient) {
	// first get the nearby photons
	let photons = Control.photonMapping.get_photons(PhotonMapEnum.GLOBAL, collision, this);
	// then, integrate
	let c = new Color();
	let photon_color = new Color();

	let power_compensation = Control.photonMapping.photon_count_per_point(PhotonMapEnum.GLOBAL) / photons.length;

	for (let i = 0, leni = photons.length; i < leni; ++i){
		let photon = photons[i];
		// TODO: maybe save the calculated color instead of the entry color?
		// do we use the entry color at all?
		photon_color = this.calculate_diffuse_photon_color(photon.color, photon_color);
		c.r += photon_color.r * photon.power * power_compensation;
		c.g += photon_color.g * photon.power * power_compensation;
		c.b += photon_color.b * photon.power * power_compensation;
	}
	c.r = Math.min(c.r, 255);
	c.g = Math.min(c.g, 255);
	c.b = Math.min(c.b, 255);
	return c;
}

Shape.prototype.calculate_photons_color = function(map_type, collision, distance_filter=false){
	// first get the nearby photons
	let photons = Control.photonMapping.get_photons(map_type, collision, this);
	// then, integrate
	let c = new Color();
	let photon_color = new Color();

	let power_compensation = Control.photonMapping.photon_count_per_point(map_type) / photons.length;

	photons = photons.map(photon => {
		return {
			photon: photon,
			distance: collision.distanceTo(photon.position)
		}
	});
	// filter by distance
	if (distance_filter === true) {
		photons = photons.filter(photon => photon.distance < max_caustic_photon_distance);
	}

	let computed_max_distance = (2 * Math.pow(Math.max.apply(null, photons.map(photon => photon.distance)), 2))

	for (let i = 0, leni = photons.length; i < leni; ++i){
		let photon = photons[i].photon;
		let distance = photons[i].distance;
		// TODO: maybe save the calculated color instead of the entry color?
		// do we use the entry color at all?
		photon_color = this.calculate_diffuse_photon_color(photon.color, photon_color);
		// photon_color = photon.color;
		let filter = this.gaussian_filter(distance, computed_max_distance);
		c.r += photon_color.r * photon.power * filter * power_compensation;
		c.g += photon_color.g * photon.power * filter * power_compensation;
		c.b += photon_color.b * photon.power * filter * power_compensation;
	}
	c.r = Math.min(c.r, 255);
	c.g = Math.min(c.g, 255);
	c.b = Math.min(c.b, 255);
	return c;

}
