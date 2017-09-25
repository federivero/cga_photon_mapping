
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

// returns the intensity of the light (numbers between 0 and 1 for each color)
Light.prototype.intensity = function() {
	return {
		r: this.color.r / 255,
		g: this.color.g / 255,
		b: this.color.b / 255
	}
}
