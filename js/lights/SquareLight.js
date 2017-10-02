// Inherits from Light
// Rectangle light (yeah, I know it's called square)
function SquareLight(color, power, points) {
	Light.call(this, null, color, power);
	this.points = points;
	this.side_1 = points[1].subtract(points[0]);
	this.side_2 = points[2].subtract(points[0]);

	// auxiliars
	this.first_side_point = new Vector();
	this.second_side_point = new Vector();
	this.light_position = new Vector();

	this.main_direction = new Plane(points).normal;

	// calculate the center of the light
	this.main_point = new Vector(0,0,0);
	this.first_side_point = Vector.multiply(this.side_1, 0.5, this.main_point);
	this.second_side_point = Vector.multiply(this.side_2, 0.5, this.main_point);
	this.main_point = Vector.add(this.points[0], this.first_side_point, this.main_point);
	this.main_point = Vector.add(this.main_point, this.second_side_point, this.main_point);
};

SquareLight.prototype = Object.create(Light.prototype);
SquareLight.prototype.constructor = SquareLight;

// Yeah, subject to aliasing problems
SquareLight.dir_1_distribution_sample = 2;
SquareLight.dir_2_distribution_sample = 2;

// Returns a random point within the light. It's used to either emit a photon or to meassure
// direct ilumination
SquareLight.prototype.get_light_origin_point = function(first_side_fraction, second_side_fraction){

	if (first_side_fraction == undefined){
		first_side_fraction = Math.random();
		second_side_fraction = Math.random();
	}

	this.first_side_point = Vector.multiply(this.side_1, first_side_fraction, this.first_side_point);
	this.first_side_point = Vector.multiply(this.side_2, second_side_fraction, this.first_side_point);
	
	this.light_position = Vector.add(this.points[0], this.first_side_point, this.light_position);
	this.light_position = Vector.add(this.light_position, this.first_side_point, this.light_position);

	return this.light_position;
}

// Returns the main point of the light 
SquareLight.prototype.get_light_main_point = function(){
	return (this.main_point);
}

// Returns a direction for a new photon
SquareLight.prototype.get_photon_direction = function(){
	var direction = null; 
	while (direction == null){
		// todo: generate more photons towards 'direction'
		direction = Vector.randomDirection();
		if (direction.dot(this.main_direction) < 0){
			direction = null;
		}
	}
	return direction;
}

SquareLight.prototype.shadow_coefficient = function(p, shape_to_ignore) {
	var shadow_coefficient = 0;
	/* //PURELY RANDOM
	for (var q = 0; q < SquareLight.distribution_sample; q++){

		this.random_position = this.get_light_origin_point();		
		
		if (this.is_shadow(p, this.random_position, shape_to_ignore)){
			shadow_coefficient++;
		}
		
	}
	return shadow_coefficient / SquareLight.distribution_sample;
	*/
	// NON RANDOM
	for (var m = 1; m <= SquareLight.dir_1_distribution_sample; m++){
		for (var n = 1; n <= SquareLight.dir_2_distribution_sample; n++){

			var dir_1_fraction = m / (SquareLight.dir_1_distribution_sample + 1);
			var dir_2_fraction = n / (SquareLight.dir_2_distribution_sample + 1);

			this.light_position = this.get_light_origin_point(dir_1_fraction, dir_2_fraction);		
			
			if (this.is_shadow(p, this.light_position, shape_to_ignore)){
				shadow_coefficient++;
			}
		
		}
	}
	return shadow_coefficient / (SquareLight.dir_1_distribution_sample * SquareLight.dir_2_distribution_sample);
}

SquareLight.prototype.is_shadow = function(test_point, point_in_light, shape_to_ignore){

	let segment = new Vector();
	let direction = test_point.subtract(point_in_light);
	let distance = direction.length();

	for (let i = 0, leni = Control.scene.shapes.length; i < leni; ++i) {
		let shape2 = Control.scene.shapes[i];
		// skip the target shape
		if (shape_to_ignore === shape2) {
			continue;
		}
		let collisions = shape2.collide([point_in_light, test_point]);
		for (let j = 0, lenj = collisions.length; j < lenj; ++j) {
			let current_collision = collisions[j];
			// for each collision, check if it's closer than our shape
			// check if the vector is on the right side
			segment = Vector.subtract(current_collision, point_in_light, segment);
			if ((segment.dot(direction) >= 0) && (segment.length() < distance)) {
				return true;
			}
		}
	}
	return false;
}
