function Color(r, g, b) {
	this.r = r || 0;
	this.g = g || 0;
	this.b = b || 0;
};

Color.prototype = {

};

Color.prototype.clone = function() {
	return new Color(
		this.r,
		this.g,
		this.b
	);
}

Color.prototype.add = function(color){
	this.r += Math.min(color.r, 255);
	this.g += Math.min(color.g, 255);
	this.b += Math.min(color.b, 255);
}