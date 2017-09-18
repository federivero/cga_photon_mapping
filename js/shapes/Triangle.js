// Inherits from Shape
// Triangle (all points in the same plane)
function Triangle(points, transform, diffuse_color, specular_constant, specular_color, is_mirror, transparency, refraction_coefficient) {
	this.points = points;
	this.plane = new Plane(points, transform, diffuse_color, specular_constant, specular_color, is_mirror, transparency, refraction_coefficient);
	Shape.call(this, transform, diffuse_color, specular_constant, specular_color, is_mirror, transparency, refraction_coefficient);
}

Triangle.sides = 3;
Triangle.prototype = Object.create(Shape.prototype);
Triangle.prototype.constructor = Sphere;

Triangle.prototype.collide = function (ray) {
	var collisionResult = [];
	var planeCollisionResult = this.plane.collide(ray);
	if (planeCollisionResult.length == 1){
		// ray collides with plane in just 1 point
		var p = planeCollisionResult[0];
		var collision = true;
		for (var i = 0; i < Triangle.sides; i++){
			// test if the point is to the 'right' of each side.
			// If true for each side, then the ray collides
			var side = this.points[(i+1) % Triangle.sides].subtract(this.points[i]);
			// to-do: precalculate sides of the triangle
			var c = p.subtract(this.points[i]);
			if (this.plane.normal.dot( side.cross(c) ) < 0){ // p is to the 'left' of the side
				collision = false;
				break;
			}
		}
		if (collision){
			collisionResult.push(p);
		}
	}
	return collisionResult;
}

Triangle.prototype.calculate_normal = function(p, normal=null) {
	return this.plane.calculate_normal(p, normal);
}
