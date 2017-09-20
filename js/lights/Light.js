
function Light(transform, color, power) {
	this.transform = transform;
	this.color = color;
	this.power = power;
};

Light.prototype = {
};

// returns true if point p in shape 'shape' is shadowed
Light.prototype.is_shadow = function(p, shape) {

}
