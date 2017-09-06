// deberia tambien tener Power? ni idea de como funciona eso
function Light(transform, intensity) {
	this.transform = transform;
	this.intensity = intensity;
};

Light.prototype = {
};

// returns true if point p in shape 'shape' is shadowed
Light.prototype.is_shadow = function(p, shape) {
	
}
