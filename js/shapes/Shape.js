const nPhong = 5

function Shape(transform, diffuse_color, specular_constant,
			   specular_color, is_mirror, transparency=0, refraction_coefficient=0) {
	this.transform = transform;
	this.diffuse_color = diffuse_color;
	this.specular_constant = specular_constant;
	this.specular_color = specular_color;
	// is_mirror distinguishes between a reflective surface and one that is merely shiny
	this.is_mirror = is_mirror;
	this.transparency = transparency;
	this.refraction_coefficient = refraction_coefficient;
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
Shape.prototype.calculate_color = function(collision, v1, v2, depth, refraction_coefficient=Control.scene.air_refraction_coefficient) {
	// return this.calculate_diffuse_reflections(collision, v1, v2, depth-1, refraction_coefficient);
	// Calculate light color
	let light_component = this.calculate_light_color(collision, v1, v2);
	let specular_component, refraction_component;
	if (depth > 0) {
		// is_mirror distinguishes between a reflective surface and one that is merely shiny
		if ((this.specular_constant > 0) && (this.is_mirror === true)) {
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
	return new Color(
		(
			light_component.r
			+ this.specular_constant * specular_component.r
			+ this.transparency * refraction_component.r
		),
		(
			light_component.g
			+ this.specular_constant * specular_component.g
			+ this.transparency * refraction_component.g
		),
		(
			light_component.b
			+ this.specular_constant * specular_component.b
			+ this.transparency * refraction_component.b
		)
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
	if (this.refraction_coefficient == refraction_coefficient) {
		normal = Vector.negative(normal, normal);
	}
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
		);
	} else {
		return Control.scene.background_color.clone();
	}
}

// Calculate the refraction component of the color in 'collision'
// limitation: there can't be a transparent thing inside of another one
// to solve this refraction_coefficient should be a stack
Shape.prototype.calculate_refraction_color = function(collision, v1, v2, depth, refraction_coefficient) {
	//para calcular el vector de salida:
	//		-transformo el vector de incidencia en uno que sale del punto colision (direccionFuente)
	//		-calculo el cross product entre direccionFuente y la normal para hallar el vector perpendicular
	//		-calculo el angulo entre el direccionFuente y la normal
	//		-calculo el angulo de salida usando los materiales
	//		-roto usando la matriz de rotacion respecto a ese angulo y el eje es el del cross product
	//		-si todo sale bien me sale un vector para el lado correcto
	let normal = this.calculate_normal(collision);
	if (this.refraction_coefficient == refraction_coefficient) {
		normal = Vector.negative(normal, normal);
	}
	let source_direction = v1.subtract(collision);
	Vector.unit(source_direction, source_direction);

	let entry_angle = source_direction.angleTo(normal);

	let axis = normal.cross(source_direction);
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
		return new Color();
	}
	let exit_angle = Math.asin( (Math.sin(entry_angle) * (refraction_coefficient / opposite_refraction_coefficient)) );

	let exit_vector = normal.negative().rotate(axis, exit_angle);
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
var asdasd = true;
Shape.prototype.calculate_diffuse_reflections = function(collision, v1, v2, depth, refraction_coefficient) {
	// first get the nearby photons
	photons = Control.photonMapping.get_photons(PhotonMapEnum.GLOBAL, collision, 1, null);

	asdasd++;
	photons = photons.filter(photon => {
		return(collision.distanceTo(photon.position) < 1)
	});
	// if ((photons.length > 0) && asdasd) {
	// 	asdasd = false
	// 	console.log(photons)
	// }
	// then, integrate
	power = 0;
	for(let i = 0, leni = photons.length; i < leni; ++i) {
		photon = photons[i];
		power += photon.power*10;

	}
	return new Color(power*255, power*255, power*255);
}
