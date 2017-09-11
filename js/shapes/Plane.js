// Inherits from Shape
// Planed defined by points a, b, and c.
function Plane(points, transform, color) {
	Shape.call(this, transform, color);
	if (points == null || points.length != 3) {
		throw new Error('Planes are defined by three points');
	}
	// check if points do not belong to the same plane
	this.normal = (points[1].subtract(points[0])).cross(points[2].subtract(points[1]));
	// 'd' is calculated by N . P = -d, with p any point in the plane.
	this.d = points[0].dot(this.normal);
	this.points = points;
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
	var denominator = this.normal.dot((ray[1].subtract(ray[0])));
	if (denominator == 0.0)
		return [];
	var numerator = -1 * (this.normal.dot(ray[0]) + this.d);
	var t = numerator / denominator;
	var intersection = ray[0].add( ray[1].subtract(ray[0]).multiply(t) );
	return [intersection];
};

Plane.prototype.calculate_normal = function(p, normal=null) {
	return this.normal.unit();
};
