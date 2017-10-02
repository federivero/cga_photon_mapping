// Inherits from Shape
// Model
function Model(triangles,
				transform,
				diffuse_color, diffuse_reflection_coefficient,
				specular_color, specular_coefficient,
				is_mirror, transparency, refraction_coefficient) {
	this.triangles = triangles;
	Shape.call(this,
				transform,
				diffuse_color, diffuse_reflection_coefficient,
				specular_color, specular_coefficient,
				is_mirror, transparency, refraction_coefficient);

	this.calculate_bounding_box();
}

Model.prototype = Object.create(Shape.prototype);
Model.prototype.constructor = Sphere;

Model.prototype.calculate_bounding_box = function(){
	var min_x = Infinity, min_y = Infinity, min_z = Infinity;
	var max_x = -Infinity, max_y = -Infinity, max_z = -Infinity;
	for (var i = 0; i < this.triangles.length; i++){
		var triangle = this.triangles[i];
		for (var j = 0; j < triangle.points.length; j++){
			var point = triangle.points[j];
			min_x = point.x < min_x? point.x : min_x;
			min_y = point.y < min_y? point.y : min_y;
			min_z = point.z < min_z? point.z : min_z;
			max_x = point.x > max_x? point.x : max_x;
			max_y = point.y > max_y? point.y : max_y;
			max_z = point.z > max_z? point.z : max_z;				
		}
	}
	var p1 = new Vector(min_x, min_y, min_z);
	var p2 = new Vector(max_x, max_y, max_z);
	this.aabb = new AABB(p1,p2);
}

Model.prototype.collide = function (ray) {
	var collides_with_aabb = this.aabb.collide(ray);
	var collision_result = [];

	if (collides_with_aabb){
		let found = false;
	    let shortest_distance = -1;
	    let nearest_shape = null;
	    let nearest_collision = null;
	    let segment = new Vector();
		// The dot product of this vector with any point shouldn't be negative
		let direction = ray[1].subtract(ray[0]);
		
		// todo: implement octree for speedup?
		for (var i = 0; i < this.triangles.length; i++){
			let shape = this.triangles[i];
			let collisions = this.triangles[i].collide(ray);
	        for (let j = 0, len_j = collisions.length; j < len_j; ++j) {
	            let current_collision = collisions[j];
            	current_collision.shape = shape;
            	collision_result.push(current_collision);
	        };
		}
	}

	return collision_result;	
}

/*
	Collisions from models have a pointer to the triangle where the collision happened.
 */
Model.prototype.calculate_normal = function(p, normal=null) {
	return p.shape.calculate_normal(p, normal);
}

Model.prototype.get_diffuse_color = function(p) {
	if (p.shape == undefined){
		return this.diffuse_color;
	}else{
		return p.shape.get_diffuse_color(p);
	}
};

Model.prototype.should_filter_photons_by_shape = function() {
	// avoid the super illumination of some triangles in models
	return true;
};

