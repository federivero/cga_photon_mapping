// Inherits from Shape
// A sphere of center 0,0,0 and radius 1. size and position works via the transform
function Sphere(transform, color) {
	Shape.call(this, transform, color);
	if (transform.scale.x !== transform.scale.y || transform.scale.x !== transform.scale.z || transform.scale.y !== transform.scale.z) {
		throw new Error('You tried to create a non-spherical sphere');
	};
	this.center = transform.position;
	this.radius = transform.scale.x;
};

Sphere.prototype = Object.create(Shape.prototype);
Sphere.prototype.constructor = Sphere;

Sphere.prototype.collide = function (ray) {
	let dif = ray[1].subtract(ray[0]);
	let a = Math.pow(dif.x, 2) + Math.pow(dif.y, 2) + Math.pow(dif.z, 2);
	let b = (2 *
			(dif.x * (ray[0].x - this.center.x)
			+ dif.y * (ray[0].y - this.center.y)
			+ dif.z * (ray[0].z - this.center.z)));
	let c = (Math.pow(ray[0].x - this.center.x, 2)
			+ Math.pow(ray[0].y - this.center.y, 2)
			+ Math.pow(ray[0].z - this.center.z, 2)
			- Math.pow(this.radius, 2));
	// 2nd grade equation
	let roots = []
	if (b*b - 4*a*c === 0) {
		roots = [(-b / (2*a))]
	} else if ((b*b - 4 * a*c < 0.0) || (a == 0.0)) {
		// no roots
	} else {
		roots = [
			(-b + Math.sqrt(b*b - 4 * a*c)) / (2 * a),
			(-b - Math.sqrt(b*b - 4 * a*c)) / (2 * a)
		]
	}
	if (roots.length === 0) {
		return [];
	} else if (roots.length === 1) {
		temp0 = dif.multiply(roots[0]);
		Vector.add(ray[0], temp0, temp0);
		return [
			temp0
		]
	} else if (roots.length === 2) {
		temp0 = dif.multiply(roots[0]);
		Vector.add(ray[0], temp0, temp0);
		temp1 = dif.multiply(roots[1]);
		Vector.add(ray[0], temp1, temp1);
		return [
			temp0,
			temp1
		]
	}
};

Sphere.prototype.calculate_normal = function(p, normal=null) {
	if (normal === null) {
		normal = new Vector();
	};
	normal.x = (p.x - this.center.x) / this.radius;
	normal.y = (p.y - this.center.y) / this.radius;
	normal.z = (p.z - this.center.z) / this.radius;
	return normal;
};
