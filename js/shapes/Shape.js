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

// Determines the color in the point 'collision' for the ray v1->v2
// 'depth' determines how many recursive steps will be done (for reflection and refraction)
// 'refraction_coefficient' is the refraction coefficient of the material from where the ray is coming from
// by default it's the air
Shape.prototype.calculate_color = function(collision, v1, v2, depth, refraction_coefficient=1) {
	
};
