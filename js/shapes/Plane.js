// Inherits from Shape
// Planed defined by points a, b, and c.
function Plane (points,
				transform,
				diffuse_color, diffuse_reflection_coefficient,
				specular_color, specular_coefficient,
				is_mirror, transparency, refraction_coefficient) {
	Shape.call(this, transform,
				diffuse_color, diffuse_reflection_coefficient,
				specular_color, specular_coefficient,
				is_mirror, transparency, refraction_coefficient);
	if (points == null || points.length != 3) {
		throw new Error('Planes are defined by three points');
	}
	// check if points do not belong to the same plane
	// bruno's implementation:
	this.normal = (points[0].subtract(points[1])).cross(points[2].subtract(points[1]));
	// 'd' is calculated by N . P = -d, with p any point in the plane.
	//this.d = - points[0].dot(this.normal);
        // fede's implementation:
        //this.normal = (points[1].subtract(points[0])).cross(points[2].subtract(points[1]));
	// 'd' is calculated by N . P = -d, with p any point in the plane.
	//this.d = points[0].dot(this.normal);
	this.points = points;

	this.calculate_d();
	
	this.class_name = 'Plane';
};

Plane.prototype = Object.create(Shape.prototype);
Plane.prototype.constructor = Sphere;

Plane.prototype.collide = function (ray) {
	/*
	* Colisionar rayo con el plano
	* Considero ecuación paramétrica del rayo: p1 + t * (p2 - p1)
	* Entonces t = -(N . p1 + d) / (N . (p2 - p1)), donde N es la normal del plano
	*/
	// Calculo N . (p2 - p1) para ver si hay intersección
	let aux = ray[1].subtract(ray[0]);
	let denominator = this.normal.dot(aux);
	if (denominator == 0.0)
		return [];
	let numerator = -1 * (this.normal.dot(ray[0]) + this.d);
	let t = numerator / denominator;
        let intersection = aux;
        Vector.multiply(intersection, t, intersection);
        Vector.add(ray[0], intersection, intersection);
	return [intersection];
};

Plane.prototype.calculate_normal = function(p, normal=null) {
	return this.normal.unit();
};

Plane.prototype.calculate_d = function(){
	this.d = - this.points[0].dot(this.normal);
}

Plane.prototype.setNormal = function(n){
	this.normal = n;
	this.calculate_d();
}