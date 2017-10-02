
function Light(transform, color, power) {
	this.transform = transform;
	this.color = color;
	this.power = power;
};

Light.prototype = {
};

// returns what percentage of point p is hidden from the light 
// (0 or 1 for point lights). Anywhere in between for square and directional lights
Light.prototype.shadow_coefficient = function(p, shape) {

}

// Returns a random point within the light. It's used to either emit a photon or to meassure
// direct ilumination
Light.prototype.get_light_origin_point = function(){

}

// Returns the main point of the light 
Light.prototype.get_light_main_point = function(){

}

// Returns a valid direction for a new photon
Light.prototype.get_photon_direction = function(){

}

// returns the intensity of the light (numbers between 0 and 1 for each color)
Light.prototype.intensity = function() {
	return {
		r: this.color.r / 255,
		g: this.color.g / 255,
		b: this.color.b / 255
	}
}
