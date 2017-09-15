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
