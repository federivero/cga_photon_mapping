// Inherits from Shape
// Triangle (all points in the same plane)
function Triangle(points,
				transform,
				diffuse_color, diffuse_reflection_coefficient,
				specular_color, specular_coefficient,
				is_mirror, transparency, refraction_coefficient, light) {
	this.points = points;
	this.plane = new Plane(points,
				transform,
				diffuse_color, diffuse_reflection_coefficient,
				specular_color, specular_coefficient,
				is_mirror, transparency, refraction_coefficient);
	Shape.call(this,
				transform,
				diffuse_color, diffuse_reflection_coefficient,
				specular_color, specular_coefficient,
				is_mirror, transparency, refraction_coefficient);

	this.has_texture = false;
	this.texture_coordinates = null;	

	this.sides = [];
	for (var i = 0; i < this.points.length; i++){
		this.sides.push(this.points[(i+1) % Triangle.sides].subtract(this.points[i]));
	}

	this.light = light;

	this.normals = [];

	// used in phong shading
	this.helper_v = new Vector(0,0,0);
}

Triangle.sides = 3;
Triangle.prototype = Object.create(Shape.prototype);
Triangle.prototype.constructor = Sphere;

Triangle.prototype.collide = function (ray) {
	/*
	var collisionResult = [];
	var planeCollisionResult = this.plane.collide(ray);
	if (planeCollisionResult.length == 1){
		// ray collides with plane in just 1 point
		var p = planeCollisionResult[0];
		var collision = true;
		for (var i = 0; i < Triangle.sides; i++){
			// test if the point is to the 'right' of each side.
			// If true for each sides, then the ray collides
			var side = this.points[(i+1) % Triangle.sides].subtract(this.points[i]);
			// to-do: precalculate sides of the triangle
			var c = p.subtract(this.points[i]);
			if (this.plane.normal.dot( side.cross(c) ) > 0){ // p is to the 'left' of the side
				collision = false;
				break;
			}
		}
		if (collision){
			collisionResult.push(p);
		}
	}
	return collisionResult;
	*/
	var collisionResult = [];
	var planeCollisionResult = this.plane.collide(ray);
	if (planeCollisionResult.length == 1){
		// ray collides with plane in just 1 point
		var p = planeCollisionResult[0];

	    var a = this.points[0];
	    var b = this.points[1];
    	var c = this.points[2];

    	if (this.same_side(p,a,b,c) && this.same_side(p,b,a,c)
        	&& this.same_side(p,c,a,b)){
			collisionResult.push(p);
		}
	}
	return collisionResult;
	/*
	// Crear la matriz de cálculo
	var ray_dif = (ray[1].subtract(ray[0])).normalize();
	var filas = [];
	filas[0] = new Vector(this.points[1].x - this.points[0].x, this.points[2].x - this.points[0].x, -ray_dif.x;
	filas[1] = new Vector(this.points[1].y - this.points[0].y, this.points[2].y - this.points[0].y, -ray_dif.y;
	filas[2] = new Vector(this.points[1].z - this.points[0].z, this.points[2].z - this.points[0].z, -ray_dif.z;

	// Calcular coeficientes
	var coeficientes = [];
	coeficientes[0] = ray[0].x - this.points[0].x;
	coeficientes[1] = ray[0].y - this.points[0].y;
	coeficientes[2] = ray[0].z - this.points[0].z;

	// Resolver sistema
	float* res = NULL;
	bool terminado; //= true;
	//res = new float[3];
	//res[0] = res[1] = res[2] = 0;
	terminado = matriz.resolverSistema(coeficientes, res);
	delete[] coeficientes;
	if ((!terminado) || (res[0] < 0) || (res[1] < 0) || (res[0] + res[1] >= 1)){
		if (terminado)
			delete[] res;
		return 0;
	}
	resultado = new Punto[1];
	delete[] res;
	float denominador = normal * (p2 - p1);
	if (denominador == 0.0)
		return 0;
	// Denominador no es cero, puedo continuar
	float t = (-(normal * p1 + d)) / denominador;
	resultado[0] = p1 + (p2 - p1).productoEscalar(t);
	return 1;
	*/
}

Triangle.prototype.set_normals = function(normals){
	this.normals = normals;
}

Triangle.prototype.calculate_normal = function(p, normal=null) {
	//if (this.normals.length == 3){
		// use phong shading
		return this.phong_shading(p);
	//}else{
	//	return this.plane.calculate_normal(p, normal);
	//}
}

Triangle.prototype.same_side = function(p1,p2,a,b){
	var ba = b.subtract(a);
    var cp1 = ba.cross(p1.subtract(a)); //CrossProduct(b-a, p1-a)
    var cp2 = ba.cross(p2.subtract(a)); //CrossProduct(b-a, p2-a)
    return (cp1.dot(cp2) >= 0);
}

Triangle.prototype.get_diffuse_color = function(p){
	if (this.has_texture){
		return this.get_texture_color(p);
	}else{
		return this.diffuse_color;
	}
}

// returns the normal of the triangle at point p, using phong shading to interpolate
Triangle.prototype.phong_shading = function(p){
	var bc = this.baricentric_coordinates(p);
	var normal = new Vector(0,0,0);
	normal = Vector.multiply(this.normals[0], bc.u, normal);
	this.helper_v = Vector.multiply(this.normals[1], bc.v, this.helper_v);
	normal = Vector.add(this.helper_v, normal, normal);
	this.helper_v = Vector.multiply(this.normals[2], bc.w, this.helper_v);
	normal = Vector.add(this.helper_v, normal, normal);
	return normal;
}

// returns the baricentric coordinates of point p in the triangle
Triangle.prototype.baricentric_coordinates = function(p){
	var v0 = this.points[1].subtract(this.points[0]);
	var v1 = this.points[2].subtract(this.points[0]);
	var v2 = p.subtract(this.points[0]);
    var d00 = v0.dot(v0);
    var d01 = v0.dot(v1);
    var d11 = v1.dot(v1);
    var d20 = v2.dot(v0);
    var d21 = v2.dot(v1);
    var denom = d00 * d11 - d01 * d01;
    var v = (d11 * d20 - d01 * d21) / denom;
    var w = (d00 * d21 - d01 * d20) / denom;
    var u = 1 - v - w;
    return { u : u, v : v, w : w};
}

Triangle.prototype.get_texture_color = function(p){
	var texture_info = Control.textures[this.texture_name];

	var bc = this.baricentric_coordinates(p);
	var v = bc.v;
	var w = bc.w;
	var u = bc.u;
	
    var texture_x = v * this.texture_coordinates[1][0] 
    			  + w * this.texture_coordinates[2][0] 
    			  + u * this.texture_coordinates[0][0];

    var texture_y = v * this.texture_coordinates[1][1] 
    			  + w * this.texture_coordinates[2][1] 
    			  + u * this.texture_coordinates[0][1];

  	var pixel_x = Math.round(texture_info.width * texture_x);
	var pixel_y = Math.round(texture_info.height * texture_y);

	var pixel_index = 4 * (pixel_x + texture_info.width * pixel_y);

	var texture_r = texture_info.pixels[pixel_index];
	var texture_g = texture_info.pixels[pixel_index + 1];
	var texture_b = texture_info.pixels[pixel_index + 2];

	return new Color(texture_r, texture_g, texture_b);
}

Triangle.prototype.should_filter_photons_by_shape = function() {
	// avoid the super illumination of some triangles in models
	return false;
};

Triangle.prototype.is_light = function(){
	return (this.light != undefined);
}

Triangle.prototype.get_light_color = function(){
	return (this.light.color);
}
