// I know it will never inherit from shape cause we don't have time, 
// but in a perfect world it would.
function AABB(p1, p2) {
	// AABBs are defined by two opposite points.
	this.p1 = p1;
	this.p2 = p2;
}


AABB.prototype.collide = function (ray) {

	var ray_dir = ray[1].subtract(ray[0]);

	var tmin = (this.p1.x - ray[0].x) / ray_dir.x; 
    var tmax = (this.p2.x - ray[0].x) / ray_dir.x; 
 
    if (tmin > tmax){
    	let aux = tmin;
    	tmin = tmax;
    	tmax = aux;
    }  
 
    var tymin = (this.p1.y - ray[0].y) / ray_dir.y; 
    var tymax = (this.p2.y - ray[0].y) / ray_dir.y; 
 
    if (tymin > tymax){
    	let aux = tymin;
    	tymin = tymax;
    	tymax = aux;
    }  
 
    if ((tmin > tymax) || (tymin > tmax)) 
        return false;
 
    if (tymin > tmin) 
        tmin = tymin; 
 
    if (tymax < tmax) 
        tmax = tymax; 
 
    var tzmin = (this.p1.z - ray[0].z) / ray_dir.z; 
    var tzmax = (this.p2.z - ray[0].z) / ray_dir.z; 
 
    if (tzmin > tzmax){
	 	let aux = tzmin;
    	tzmin = tzmax;
    	tzmax = aux;
    } 
 
    if ((tmin > tzmax) || (tzmin > tmax)) 
        return false; 
 
 	/*
    if (tzmin > tmin) 
        tmin = tzmin; 
 
    if (tzmax < tmax) 
        tmax = tzmax; 
 	*/

    return true;
}

