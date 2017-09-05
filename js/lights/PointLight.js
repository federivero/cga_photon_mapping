// Inherits from Light
function PointLight(transform, color) {
	Light.call(this, transform, color);
};

PointLight.prototype = Object.create(Light.prototype);
PointLight.prototype.constructor = PointLight;

PointLight.prototype.collide = function (ray) {

};
