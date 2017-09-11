
function Light(transform, intensity, power) {
	this.transform = transform;
	this.intensity = intensity;
	this.power = power;
};

Light.prototype = {
};

// returns true if point p in shape 'shape' is shadowed
Light.prototype.is_shadow = function(p, shape) {
	
}
