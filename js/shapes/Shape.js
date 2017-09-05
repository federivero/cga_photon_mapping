function Shape(transform, color) {
	this.transform = transform;
	this.color = color;
};

Shape.prototype = {
	collide: function(ray) {
		// Abstract
		// ray is an array of two points, ray[0] the first and ray[1] the second
		throw new Error('Shape does not implement this!');
	},

};
