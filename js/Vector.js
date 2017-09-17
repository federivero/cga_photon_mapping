// https://evanw.github.io/lightgl.js/docs/vector.html

// Provides a simple 3D vector class. Vector operations can be done using member functions, which return new vectors, or static functions, which reuse existing vectors to avoid generating garbage.

function Vector(x, y, z) {
	this.x = x || 0;
	this.y = y || 0;
	this.z = z || 0;
}

// ***Instance Methods***
// The methods add(), subtract(), multiply(), and divide() can all take either a vector or a number as an argument.

Vector.prototype = {
	negative: function() {
	return new Vector(-this.x, -this.y, -this.z);
	},
	add: function(v) {
	if (v instanceof Vector) return new Vector(this.x + v.x, this.y + v.y, this.z + v.z);
	else return new Vector(this.x + v, this.y + v, this.z + v);
	},
	subtract: function(v) {
	if (v instanceof Vector) return new Vector(this.x - v.x, this.y - v.y, this.z - v.z);
	else return new Vector(this.x - v, this.y - v, this.z - v);
	},
	multiply: function(v) {
	if (v instanceof Vector) return new Vector(this.x * v.x, this.y * v.y, this.z * v.z);
	else return new Vector(this.x * v, this.y * v, this.z * v);
	},
	divide: function(v) {
	if (v instanceof Vector) return new Vector(this.x / v.x, this.y / v.y, this.z / v.z);
	else return new Vector(this.x / v, this.y / v, this.z / v);
	},
	equals: function(v) {
	return this.x == v.x && this.y == v.y && this.z == v.z;
	},
	dot: function(v) {
	return this.x * v.x + this.y * v.y + this.z * v.z;
	},
	cross: function(v) {
	return new Vector(
		this.y * v.z - this.z * v.y,
		this.z * v.x - this.x * v.z,
		this.x * v.y - this.y * v.x
	);
	},
	length: function() {
	return Math.sqrt(this.dot(this));
	},
	unit: function() {
	return this.divide(this.length());
	},
	min: function() {
	return Math.min(Math.min(this.x, this.y), this.z);
	},
	max: function() {
	return Math.max(Math.max(this.x, this.y), this.z);
	},
	toAngles: function() {
	return {
		theta: Math.atan2(this.z, this.x),
		phi: Math.asin(this.y / this.length())
	};
	},
	angleTo: function(a) {
	return Math.acos(this.dot(a) / (this.length() * a.length()));
	},
	toArray: function(n) {
	return [this.x, this.y, this.z].slice(0, n || 3);
	},
	clone: function() {
	return new Vector(this.x, this.y, this.z);
	},
	init: function(x, y, z) {
	this.x = x; this.y = y; this.z = z;
	return this;
	},
	rotate: function(axis, angle) {
		// https://en.wikipedia.org/wiki/Rotation_matrix
		let axis_n = axis.unit();
		let cos0 = Math.cos(angle);
		let sin0 = Math.sin(angle);
		let rotation_matrix = [
			[
				cos0 + sqr(axis_n.x) * (1 - cos0),
				axis_n.x * axis_n.y * (1 - cos0) - axis_n.z * sin0,
				axis_n.x * axis_n.z * (1 - cos0) + axis_n.y * sin0
			],
			[
				axis_n.y * axis_n.x * (1 - cos0) + axis_n.z * sin0,
				cos0 + sqr(axis_n.y) * (1 - cos0),
				axis_n.y * axis_n.z * (1 - cos0) - axis_n.x * sin0
			],
			[
				axis_n.z * axis_n.x * (1 - cos0) - axis_n.y * sin0,
				axis_n.z * axis_n.y * (1 - cos0) + axis_n.x * sin0,
				cos0 + sqr(axis_n.z) * (1 - cos0)
			]
		];
		// save allocations
		axis_n.x = this.x * rotation_matrix[0][0] + this.y * rotation_matrix[0][1] + this.z * rotation_matrix[0][2];
		axis_n.y = this.x * rotation_matrix[1][0] + this.y * rotation_matrix[1][1] + this.z * rotation_matrix[1][2]
		axis_n.z = this.x * rotation_matrix[2][0] + this.y * rotation_matrix[2][1] + this.z * rotation_matrix[2][2]

		return axis_n;
	}
};

// ***Static Methods***

Vector.negative = function(a, b) {
	b.x = -a.x; b.y = -a.y; b.z = -a.z;
	return b;
};
Vector.add = function(a, b, c) {
	if (b instanceof Vector) { c.x = a.x + b.x; c.y = a.y + b.y; c.z = a.z + b.z; }
	else { c.x = a.x + b; c.y = a.y + b; c.z = a.z + b; }
	return c;
};
Vector.subtract = function(a, b, c) {
	if (b instanceof Vector) { c.x = a.x - b.x; c.y = a.y - b.y; c.z = a.z - b.z; }
	else { c.x = a.x - b; c.y = a.y - b; c.z = a.z - b; }
	return c;
};
Vector.multiply = function(a, b, c) {
	if (b instanceof Vector) { c.x = a.x * b.x; c.y = a.y * b.y; c.z = a.z * b.z; }
	else { c.x = a.x * b; c.y = a.y * b; c.z = a.z * b; }
	return c;
};
Vector.divide = function(a, b, c) {
	if (b instanceof Vector) { c.x = a.x / b.x; c.y = a.y / b.y; c.z = a.z / b.z; }
	else { c.x = a.x / b; c.y = a.y / b; c.z = a.z / b; }
	return c;
};
Vector.cross = function(a, b, c) {
	c.x = a.y * b.z - a.z * b.y;
	c.y = a.z * b.x - a.x * b.z;
	c.z = a.x * b.y - a.y * b.x;
	return c;
};
Vector.unit = function(a, b) {
	var length = a.length();
	b.x = a.x / length;
	b.y = a.y / length;
	b.z = a.z / length;
	return b;
};
Vector.rotate = function(a, axis, angle, b) {
	// https://en.wikipedia.org/wiki/Rotation_matrix
	Vector.unit(axis, b);
	let cos0 = Math.cos(angle);
	let sin0 = Math.sin(angle);
	let rotation_matrix = [
		[
			cos0 + sqr(b.x) * (1 - cos0),
			b.x * b.y * (1 - cos0) - b.z * sin0,
			b.x * b.z * (1 - cos0) + b.y * sin0
		],
		[
			b.y * b.x * (1 - cos0) + b.z * sin0,
			cos0 + sqr(b.y) * (1 - cos0),
			b.y * b.z * (1 - cos0) - b.x * sin0
		],
		[
			b.z * b.x * (1 - cos0) - b.y * sin0,
			b.z * b.y * (1 - cos0) + b.x * sin0,
			cos0 + sqr(b.z) * (1 - cos0)
		]
	];
	// save allocations
	b.x = a.x * rotation_matrix[0][0] + a.y * rotation_matrix[0][1] + a.z * rotation_matrix[0][2];
	b.y = a.x * rotation_matrix[1][0] + a.y * rotation_matrix[1][1] + a.z * rotation_matrix[1][2]
	b.z = a.x * rotation_matrix[2][0] + a.y * rotation_matrix[2][1] + a.z * rotation_matrix[2][2]

	return b;
}

// Vector.randomDirection() returns a vector with a length of 1 and a statistically uniform direction.
// Vector.lerp() performs linear interpolation between two vectors.

Vector.fromAngles = function(theta, phi) {
	return new Vector(Math.cos(theta) * Math.cos(phi), Math.sin(phi), Math.sin(theta) * Math.cos(phi));
};
Vector.randomDirection = function() {
	return Vector.fromAngles(Math.random() * Math.PI * 2, Math.asin(Math.random() * 2 - 1));
};
Vector.min = function(a, b) {
	return new Vector(Math.min(a.x, b.x), Math.min(a.y, b.y), Math.min(a.z, b.z));
};
Vector.max = function(a, b) {
	return new Vector(Math.max(a.x, b.x), Math.max(a.y, b.y), Math.max(a.z, b.z));
};
Vector.lerp = function(a, b, fraction) {
	return b.subtract(a).multiply(fraction).add(a);
};
Vector.fromArray = function(a) {
	return new Vector(a[0], a[1], a[2]);
};
Vector.angleBetween = function(a, b) {
	return a.angleTo(b);
};
