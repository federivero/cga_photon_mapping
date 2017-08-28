/* DATE FUNCTIONS */



/* Given a number of milisecond, returns how many complete days are in the period */
function numberOfDays(milis){
	return milis / (1000 * 60 * 60 * 24); 
}

/* Given a number of days, returns how many milliseconds are in the period */
function daysToMillis(days){
	return days * 24 * 60 * 60 * 1000;
}



/* STRING FUNCTIONS */

// TO DO add to String utils
function pad(str, padValue, before, toLength){
	var i;
	var returnStr = str;
	for (i = str.length; i < toLength; i++){
		if (before){
			returnStr = padValue + returnStr;
		}else{	
			returnStr = returnStr + padValue;
		}
	}
	return returnStr;
}

function randomChar(){
	var firstCharCode = 65; // A
	var lastCharCode = 90; // Z
	var charCode = randomInteger(firstCharCode, lastCharCode);
	return String.fromCharCode(charCode);
}

String.prototype.replaceAt = function(index, replacement) {
    return this.substr(0, index) + replacement + this.substr(index + replacement.length);
}

/* MATH FUNCTIONS */

function clamp(value, min, max){
	return Math.max(Math.min(value,max),min);
}

function formatTo2decimalPlaces(num){
	return parseFloat(Math.round(num * 100) / 100).toFixed(2);
}

function formatToSingleDecimalPlace(num){
	return parseFloat(Math.round(num * 10) / 10).toFixed(1);
}

// Given a rect defined by x1, y1, x2, y2, and an outside point x3, 
// returns the y value of the rect for x3.
function linearExtrapolation(x1, y1, x2, y2, x3){
	return (y1 + (x3 - x1) * (y2 - y1) / (x2 - x1));
}

// Given a rect defined by startX, startY, endX, endY, and an internal point interY, 
// returns the x value of the rect for interY
function linearInterpolation(startX, endX, interY, startY, endY){
	var yInterval = endY - startY;
	var fraction = (interY - startY) / yInterval;
	return (startX + (endX - startX) * fraction);
}

function reverseLinearInterpolation(startX, endX, interX, startY, endY){
	var xInterval = endX - startX;
	var fraction = (interX - startX) / xInterval;
	return (startY + (endY - startY) * fraction);	
}

function logarithmicInterpolation(startX, endX, interY, startY, endY){
	var a = (Math.log10(endY) - Math.log10(startY)) / (endX - startX);
	var b = Math.log10(startY) - a * startX;
	return (Math.log10(interY) - b) / a;
}

function reverseLogarithmicInterpolation(startX, endX, interX, startY, endY){
	var a = (Math.log10(endY) - Math.log10(startY)) / (endX - startX);
	var b = Math.log10(startY) - a * startX;
	return (Math.pow(10, a * interX + b));
}


/* COLOR FUNCTIONS */
function hightlightColor (color) {   
    var f = parseInt(color.slice(1),16), 
    	R = f >> 16, 
    	G = f >> 8 & 0x00FF,
    	B = f & 0x0000FF;
    	if (R > 200 || G > 200 || B > 200){
    		// Make color darker
    		ret = "#" + Math.round(((R * 0.8) << 16) + ((G * 0.8) << 8) + (B * 0.8)).toString(16);
    	}else{
    		// Make color brighter
    		ret = "#" + Math.round((clamp((R * 1.2),0,255) << 16) + (clamp((G * 1.2),0,255) << 8) + clamp((B * 1.2),0,255)).toString(16); 
    	}
    	return ret;
    //return "#"+(0x1000000 + (Math.round((t-R)*p)+R) * 0x10000 + (Math.round((t-G)*p)+G) * 0x100 + (Math.round((t-B)*p)+B)).toString(16).slice(1);
}


/*  MISCELANEOUS FUNCTIONS  */

// for debug
/*
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}*/

function shuffle(a) {
    var j, x, i;
    for (i = a.length; i; i--) {
        j = Math.floor(Math.random() * i);
        x = a[i - 1];
        a[i - 1] = a[j];
        a[j] = x;
    }
}

function sqr(x) { 
	return x * x 
}

 function base64Encode(inputStr) {
   var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
   var outputStr = "";
   var i = 0;
   
   while (i < inputStr.length)
   {
       //all three "& 0xff" added below are there to fix a known bug 
       //with bytes returned by xhr.responseText
       var byte1 = inputStr.charCodeAt(i++) & 0xff;
       var byte2 = inputStr.charCodeAt(i++) & 0xff;
       var byte3 = inputStr.charCodeAt(i++) & 0xff;

       var enc1 = byte1 >> 2;
       var enc2 = ((byte1 & 3) << 4) | (byte2 >> 4);
       
       var enc3, enc4;
       if (isNaN(byte2))
       {
           enc3 = enc4 = 64;
       }
       else
       {
           enc3 = ((byte2 & 15) << 2) | (byte3 >> 6);
           if (isNaN(byte3))
           {
               enc4 = 64;
           }
           else
           {
               enc4 = byte3 & 63;
           }
       }

       outputStr += b64.charAt(enc1) + b64.charAt(enc2) + b64.charAt(enc3) + b64.charAt(enc4);
    } 
   
    return outputStr;
}



/* COLLISION DETECTION FUNCTIONS  */

/*
*  Given a point (x,y) and a target rectangle (centerX, centerY, width, height), 
   returns true if the point collides with the rectangle. 
*/
function rect2dCollisionDetection(x, y, centerX, centerY, width, height){
	return ((x >= centerX - width / 2) && (x <= centerX + width / 2) 
		&& (y >= centerY - height / 2) && (y <= centerY + height / 2));
}


/*
*  Given a point (x,y) and a target circle (centerX, centerY, radius), 
   returns true if the point collides with the circle. 
*/
function pointCircleCollisionDetection(xp, yp, xc, yc, radius){
	return dist(xp, yp, xc, yc) < radius;
}

// aabb = {x1, x2, y1, y2}
// sets coordinates in order that x1 <= x2 and y1 <= y2
function normalizeAABB(aabb){
	var x1 = aabb.x1;
	var x2 = aabb.x2;
	var y1 = aabb.y1;
	var y2 = aabb.y2;
	aabb.x1 = Math.min(x1, x2);
	aabb.x2 = Math.max(x1, x2);
	aabb.y1 = Math.min(y1, y2);
	aabb.y2 = Math.max(y1, y2);
    return aabb;
}

// rotates an aabb around it's origin, reflecting both X and Y axis
function rotateAroundOriginAABB(aabb){
	aabb.x1 = aabb.x1 * -1;
	aabb.x2 = aabb.x2 * -1;
	aabb.y1 = aabb.y1 * -1;
	aabb.y2 = aabb.y2 * -1;
    return aabb;
}

function minkowskiSumAABB(aabb1, aabb2){
	var aabbSum = new AABB();
	aabbSum.x1 = aabb1.x1 + aabb2.x1;
	aabbSum.x2 = aabb1.x2 + aabb2.x2;
	aabbSum.y1 = aabb1.y1 + aabb2.y1;
	aabbSum.y2 = aabb1.y2 + aabb2.y2;
    return aabbSum;
}

// given a point, returns a line segment from it's origin
function getLineSegmentFromOrigin(p){
    return {x1: 0, y1: 0, x2: p.x, y2: p.y};
}

function copyAABB(aabb){
	return new AABB(aabb.x1, aabb.y1, aabb.x2, aabb.y2);
}

function vectorSubstract(v1, v2){
	return { x : v1.x - v2.x , y : v1.y - v2.y };
}


// intersects 2 moving aabbs
function aabbIntersection(aabb1, velocity1, aabb2, velocity2){
	var aabbCopy = copyAABB(aabb1);
    var rotatedAABB = normalizeAABB(rotateAroundOriginAABB(aabbCopy));
    var sumAABB = minkowskiSumAABB(rotatedAABB, aabb2);
    var relativeVelocity = vectorSubstract(velocity1, velocity2);
    var segment = getLineSegmentFromOrigin(relativeVelocity);
    return lineAABBCollisionDetection(segment, sumAABB);	
}

// given a two ilnes, returns the collision between them
function lineVsLineCollisionDetection(line1, line2){
    var s1_x = line1.x2 - line1.x1;     
    var s1_y = line1.y2 - line1.y1;
    var s2_x = line2.x2 - line2.x1;     
    var s2_y = line2.y2 - line2.y1;

    var denominator = (-s2_x * s1_y + s1_x * s2_y);
	var result = { collision : false};
    
    if (denominator == 0){
    	if (line1.x1 == line2.x1 && line1.y1 == line2.y1){
    		result.collisionX = line1.x1;
	        result.collisionY = line1.y1;
	        result.collision = true;
    	}else if (line1.x2 == line2.x2 && line1.y2 == line2.y2){
    		result.collisionX = line1.x2;
	        result.collisionY = line1.y2;
	        result.collision = true;    		
    	}
    }else{
	    var s = (-s1_y * (line1.x1 - line2.x1) + s1_x * (line1.y1 - line2.y1)) / denominator;
	    var t = ( s2_x * (line1.y1 - line2.y1) - s2_y * (line1.x1 - line2.x1)) / denominator;

	    if (s >= 0 && s <= 1 && t >= 0 && t <= 1){
	        // Collision detected	
	        result.collisionX = line1.x1 + (t * s1_x);
	        result.collisionY = line1.y1 + (t * s1_y);
	        result.collision = true;
	    }
    }
   	return result; 
}

// given a line and an AABB, returns the collision between them line and the AABB
function lineAABBCollisionDetection(line, aabb){
	var result = { collision : false, contained : false, collisionX : 0, collisionY : 0};
	for (var i = 0; i < 4; i++){
		var side = getSideAABB(aabb, i);
		var collision = lineVsLineCollisionDetection(line,side);
		if (collision.collision){
			if (result.collision){
				// second time getting a collision, keep the closest to the start of the line
				if (dist(line.x1, line.y1, collision.collisionX, collision.collisionY) <
					dist(line.x1, line.y1, result.collisionX, result.collisionY)){
					result.collisionX = collision.collisionX;
					result.collisionY = collision.collisionY;
					result.side = i;					
				}
			}else{
				// first time getting a collision
				result.collision = true;
				result.collisionX = collision.collisionX;
				result.collisionY = collision.collisionY;
				result.side = i; 
			}
		}
	}
	// if there wasn't a collision, test if the line is INSIDE the aabb
	if (!collision.collision){
		if (aabb.collidesWithPoint(line.x1, line.y1) && 
			aabb.collidesWithPoint(line.x2, line.y2)){
			result.collision = true;
			result.contained = true; 
			var startX = line.x1;
			var endX = line.x2;
			var startY = line.y1;
			var endY = line.y2;
			for (var i = 0; i < 4; i++){
				var side = getSideAABB(aabb, i);
				switch(i){
					case AABBSideEnum.TOP:
						line.y1 = aabb.y2;
						line.x1 = linearInterpolation(startX, endX, line.y1, startY, endY);
						break;
					case AABBSideEnum.BOTTOM:
						line.y1 = aabb.y1;
						line.x1 = linearInterpolation(startX, endX, line.y1, startY, endY);
						break;
					case AABBSideEnum.LEFT:
						line.x1 = aabb.x1;
						line.y1 = reverseLinearInterpolation(startX, endX, line.x1, startY, endY);
						break;
					case AABBSideEnum.RIGHT:
						line.x1 = aabb.x2;
						line.y1 = reverseLinearInterpolation(startX, endX, line.x1, startY, endY);
						break;
								
				}
				var collision = lineVsLineCollisionDetection(line,side);
				if (collision.collision)
					if ((result.collisionX == 0 && result.collisionY == 0) || 
						(dist(0, 0, collision.collisionX, collision.collisionY) < dist(0, 0, result.collisionX, result.collisionY))){
						result.side = i;
						result.collisionX = collision.collisionX;
						result.collisionY = collision.collisionY;
					}
			}	
		}
	}
	return result;
}


AABBSideEnum = {
	LEFT : 0,
	TOP : 1,
	RIGHT : 2,
	BOTTOM: 3 
}

AABB = function(x1, y1, x2, y2){
	this.x1 = x1;
	this.x2 = x2;
	this.y1 = y1;
	this.y2 = y2;
}

// pre: normalized aabb
AABB.prototype.getWidth = function(){
	return this.x2 - this.x1;
}

AABB.prototype.getHeight = function(){
	return this.y2 - this.y1;
}

AABB.prototype.getCenterX = function(){
	return this.x1 + this.getWidth() / 2;
}

AABB.prototype.getCenterY = function(){
	return this.y1 + this.getHeight() / 2;
}

AABB.prototype.draw = function(context){
	context.fillRect(this.x1, this.y1, this.getWidth(), this.getHeight());
}

AABB.prototype.collidesWithPoint = function(x, y){
	return rect2dCollisionDetection(x, y, this.getCenterX(), this.getCenterY(), this.getWidth(), this.getHeight());
}

AABB.prototype.collidesWithAABB = function(aabb){
	if (this.x < aabb.x + aabb.getWidth() &&
	   this.x + this.getWidth() > aabb.x &&
	   this.y < aabb.y + aabb.getHeight() &&
	   this.getHeight() + this.y > aabb.y) {
	    return true;
	}
	return false;
}
/* given a AABB and an index, returns a side from the aabb
	      1
	y2  - - -
	   |     |
	0  |     |  2
	   |     |
	y1  - - -
	  x1  3  x2
*/
function getSideAABB(aabb, sidenumber){
	var side = { x1 : 0, x2 : 0, y1 : 0, y2 : 0 };
	switch(sidenumber){
		case AABBSideEnum.LEFT:
			side.x1 = aabb.x1;
			side.y1 = aabb.y1;
			side.x2 = aabb.x1;
			side.y2 = aabb.y2;
			break;
		case AABBSideEnum.TOP:
			side.x1 = aabb.x1;
			side.y1 = aabb.y2;
			side.x2 = aabb.x2;
			side.y2 = aabb.y2;
			break;
		case AABBSideEnum.RIGHT:
			side.x1 = aabb.x2;
			side.y1 = aabb.y1;
			side.x2 = aabb.x2;
			side.y2 = aabb.y2;
			break;
		case AABBSideEnum.BOTTOM:
			side.x1 = aabb.x1;
			side.y1 = aabb.y1;
			side.x2 = aabb.x2;
			side.y2 = aabb.y1;
			break;
	}
	return side;
}

function scaleLine(line, factor){
	line.x1 *= factor;
	line.y1 *= factor;
	line.x2 *= factor;
	line.y2 *= factor;
	return line;
}

function scaleVector(v, factor){
	v.x *= factor;
	v.y *= factor;
	return v;
}

function drawAABB(context, aabb){
	context.fillRect(aabb.x1, aabb.y1, aabb.x2 - aabb.x1, aabb.y2 - aabb.y1);
}

/* DISTANCE FUNCTIONS */

/*
* Calculates the distance between a point and an infinite line. 
* x1, y1: Coordinates of the first point that defines the line
* x2, y2: Coordinates of the second point that defines the line
* xp, yp: Coordinates of the point to test
*/
function distanceLinePoint(x1, y1, x2, y2, xp, yp){
	var ydif = (y2-y1);
	var xdif = (x2-x1);
	var denominator = Math.sqrt(ydif * ydif + xdif * xdif);
	if (denominator != 0){
		return (Math.abs(ydif * xp - xdif * yp + x2*y1 - y2*x1) / denominator);
	}else{
		return 0;
	}
}

function distSqr(x1,y1, x2,y2) { 
	return sqr(x1 - x2) + sqr(y1 - y2); 
}

function dist(x1, y1, x2, y2){
	return Math.sqrt(distSqr(x1,y1,x2,y2));
}


/* DEBUG FUNCTIONS */
function drawMousePosition(context, mousePosition){
	context.save();
	context.beginPath();
	context.strokeStyle = "black";
	context.globalAlpha = 0.9;
	context.moveTo(mousePosition.x, 0);
	context.lineTo(mousePosition.x, context.canvas.height);

	context.moveTo(0, mousePosition.y);
	context.lineTo(context.canvas.width, mousePosition.y);

	context.fillStyle = "black";
	context.fillText("(" + formatTo2decimalPlaces(mousePosition.x) + "  ,  " + formatTo2decimalPlaces(mousePosition.y) + ")", mousePosition.x + 5, mousePosition.y - 5);

	context.stroke();
	context.closePath();
	context.restore();
}

/* IMAGE FUNCITONS */

function sharpenFilter(imageData, context){
	var weights = [0, -1,  0,
				  -1,  5, -1,
				   0, -1,  0];
	convoluteFilter(imageData, weights, true, context);
}

function blurFilter	(imageData, context){
	var ninth = 1/9;
	var weights = [ninth, ninth, ninth,
				   ninth, ninth, ninth,
				   ninth, ninth, ninth];
	convoluteFilter(imageData, weights, true, context);
}

function grayscaleFilter(imageData){
	var d = imageData.data;
  	for (var i = 0; i < d.length; i+=4) {
	    var r = d[i];
	    var g = d[i+1];
	    var b = d[i+2];
	    var v = 0.2126 * r + 0.7152 * g + 0.0722 * b;
	    d[i] = d[i+1] = d[i+2] = v
  	}
  	return imageData;
}

function colorAlphaFilter(imageData, redAdj, greenAdj, blueAdj){
	var d = imageData.data;
	for (var  i =0; i < d.length; i+=4) {
		d[i] *= redAdj;
	    d[i+1] *= greenAdj;
	    d[i+2] *= blueAdj;
	}
	return imageData;
}

function RGBtoHSV(r, g, b) {
    if (arguments.length === 1) {
        g = r.g, b = r.b, r = r.r;
    }
    var max = Math.max(r, g, b), min = Math.min(r, g, b),
        d = max - min,
        h,
        s = (max === 0 ? 0 : d / max),
        v = max / 255;

    switch (max) {
        case min: h = 0; break;
        case r: h = (g - b) + d * (g < b ? 6: 0); h /= 6 * d; break;
        case g: h = (b - r) + d * 2; h /= 6 * d; break;
        case b: h = (r - g) + d * 4; h /= 6 * d; break;
    }

    return {
        h: h,
        s: s,
        v: v
    };
}

function HSVtoRGB(h, s, v) {
    var r, g, b, i, f, p, q, t;
    if (arguments.length === 1) {
        s = h.s, v = h.v, h = h.h;
    }
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}

function hueRotationFilter(imageData, hueRotation){	
	var d = imageData.data;
	for (var  i = 0; i < d.length; i+=4) {
		// convert to hsv
		var hsv = RGBtoHSV(d[i], d[i+1], d[i+2]);
		hsv.h = (hsv.h + (hueRotation / 360));
		// covert back to rgb
		var rgb = HSVtoRGB(hsv);
		d[i] = rgb.r;
	    d[i+1] = rgb.g;
	    d[i+2] = rgb.b;
	}
	return imageData;

}

function brightnessFilter(imageData, adjustment){
	var d = imageData.data;
	for (var  i =0; i < d.length; i+=4) {
		d[i] += adjustment;
	    d[i+1] += adjustment;
	    d[i+2] += adjustment;
	}
	return imageData;
}

function thresholdFilter(imageData, threshold){
	var d = imageData.data;
	for (var i=0; i<d.length; i+=4) {
		var r = d[i];
		var g = d[i+1];
		var b = d[i+2];
		var v = (0.2126*r + 0.7152*g + 0.0722*b >= threshold) ? 255 : 0;
		d[i] = d[i+1] = d[i+2] = v
	}
	return imageData;
}

function convoluteFilter(imageData, weights, opaque, context) {
	var side = Math.round(Math.sqrt(weights.length));
	var halfSide = Math.floor(side/2);
	var src = imageData.data;
	var sw = imageData.width;
	var sh = imageData.height;
	// pad output by the convolution matrix
	//var w = sw;
	//var h = sh;
	//var output = context.createImageData(w, h);
	var dst = src;
	// go through the destination image pixels
	var alphaFac = opaque ? 1 : 0;
	for (var y = 0; y < sh; y++) {
		for (var x = 0; x < sw; x++) {
			var sy = y;
			var sx = x;
			var dstOff = (y * sw + x) * 4;
			// calculate the weighed sum of the source image pixels that
			// fall under the convolution matrix
			var r = 0, g = 0, b = 0, a = 0;
			for (var cy = 0; cy < side; cy++) {
				for (var cx = 0; cx < side; cx++) {
					var scy = sy + cy - halfSide;
					var scx = sx + cx - halfSide;
					if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
						var srcOff = (scy * sw + scx)*4;
						var wt = weights[cy * side + cx];
						r += src[srcOff] * wt;
						g += src[srcOff+1] * wt;
						b += src[srcOff+2] * wt;
						a += src[srcOff+3] * wt;
					}
				}
			}
			dst[dstOff] = r;
			dst[dstOff+1] = g;
			dst[dstOff+2] = b;
			dst[dstOff+3] = a + alphaFac*(255-a);
		}
	}
	return dst;
};

/* Takes an image and an array of color swapping directions */
function swapMultipleColorsFilter(imageData, colorSwappings){
	var d = imageData.data;
	for (var i = 0; i < d.length; i+=4) {
		var r = d[i];
		var g = d[i+1];
		var b = d[i+2];
		for (var j = 0; j < colorSwappings.length; j++){
			if (colorSwappings[j].targetR == r && colorSwappings[j].targetG == g && colorSwappings[j].targetB == b){
				d[i] = colorSwappings[j].destinationR;
				d[i+1] = colorSwappings[j].destinationG;
				d[i+2] = colorSwappings[j].destinationB;				
			}
		}
	}
	return imageData;
}

function swapColorFilter(imageData, targetR, targetG, targetB, destinationR, destinationG, destinationB){
	var d = imageData.data;
	for (var i = 0; i < d.length; i+=4) {
		var r = d[i];
		var g = d[i+1];
		var b = d[i+2];
		if (targetR == r && targetG == g && targetB == b){
			d[i] = destinationR;
			d[i+1] = destinationG;
			d[i+2] = destinationB;			
		}

	}
	return imageData;
}

/* DRAW FUNCTIONS */

/**
 * Draws a rounded rectangle using the current state of the canvas.
 * If you omit the last three params, it will draw a rectangle
 * outline with a 5 pixel border radius
 * @param {CanvasRenderingContext2D} ctx
 * @param {Number} x The top left x coordinate
 * @param {Number} y The top left y coordinate
 * @param {Number} width The width of the rectangle
 * @param {Number} height The height of the rectangle
 * @param {Number} [radius = 5] The corner radius; It can also be an object 
 *                 to specify different radii for corners
 * @param {Number} [radius.tl = 0] Top left
 * @param {Number} [radius.tr = 0] Top right
 * @param {Number} [radius.br = 0] Bottom right
 * @param {Number} [radius.bl = 0] Bottom left
 * @param {Boolean} [fill = false] Whether to fill the rectangle.
 * @param {Boolean} [stroke = true] Whether to stroke the rectangle.
 */
function roundRect(ctx, x, y, width, height, fill, stroke, radius) {
	if (typeof stroke == 'undefined') {
		stroke = true;
	}
	if (typeof radius === 'undefined') {
		radius = 5;
	}
	if (typeof radius === 'number') {
		radius = {tl: radius, tr: radius, br: radius, bl: radius};
	} else {
		var defaultRadius = {tl: 0, tr: 0, br: 0, bl: 0};
		for (var side in defaultRadius) {
			radius[side] = radius[side] || defaultRadius[side];
		}
	}
	ctx.beginPath();
	ctx.moveTo(x + radius.tl, y);
	ctx.lineTo(x + width - radius.tr, y);
	ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
	ctx.lineTo(x + width, y + height - radius.br);
	ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
	ctx.lineTo(x + radius.bl, y + height);
	ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
	ctx.lineTo(x, y + radius.tl);
	ctx.quadraticCurveTo(x, y, x + radius.tl, y);
	ctx.closePath();
	if (fill) {
		ctx.fill();
	}
	if (stroke) {
		ctx.stroke();
	}
}

/* DEGREES AND RADIANS */

function degreesToRadians(angle){
	return angle * Math.PI / 180;
}


/* PROBABILITY */

/* Returns a random with normal distribution, defined by mean and stdev */
function randomNormalDistribution(mean, stdev) {
  return (((Math.random()*2-1)+(Math.random()*2-1)+(Math.random()*2-1))*stdev+mean);
}

/* Returns a random value between minValue and maxValue */
function randomUniformDistribution(minValue, maxValue){
	var intervalSize = maxValue - minValue;
	return (minValue + Math.random() * intervalSize);
}

/* Returns a random integer between minValue and maxValue */
function randomInteger(minValue, maxValue){
	var intervalSize = maxValue - minValue + 1;
	var targetValue = minValue + Math.floor(Math.random() * intervalSize)
	return (targetValue > maxValue ? maxValue : targetValue);
}

/* Returns a random boolean value */
function randomBoolean(){
	return (Math.random() > 0.5);
}

/* EASING */

MovementTypeEnum = {
	STEADY : 0,
	QUAD: 1,
	CUBIC : 2,
	SINE : 3,
	CUADSINE : 4,
	ELASTIC : 5,
	LINEAR: 6
}

/* Fraction must be a number between 0 and 1, that controls the animation */ 
function getEasing(fraction, type){
	var result = 0;
	switch(type){
		case MovementTypeEnum.LINEAR:
			result = fraction;
			break;	
		case MovementTypeEnum.QUAD:
			result = fraction * fraction;
			break;
		case MovementTypeEnum.CUBIC:
			result = fraction * fraction * fraction ;
			break;
		case MovementTypeEnum.SINE:
			result = (Math.sin((Math.PI / 2) * fraction));
			break;
		case MovementTypeEnum.CUADSINE:
			var sine = Math.sin((Math.PI / 2) * fraction);
			result = sine * sine;
			break
		case MovementTypeEnum.ELASTIC:
			var s, a = 0.1, p = 0.9;
			if ( fraction === 0 ){
				result = 0; 
			}else if ( fraction === 1 ){
				result = 1;
			}else{
				if (!a || a < 1){
					a = 1; 
					s = p / 4; 
				}else{
					s = p * Math.asin( 1 / a ) / ( 2 * Math.PI );
				}	
				if (( fraction *= 2 ) < 1){
					result = - 0.5 * ( a * Math.pow( 2, 10 * ( fraction -= 1 ) ) * Math.sin( ( fraction - s ) * ( 2 * Math.PI ) / p ) );
				}else{
					result = a * Math.pow( 2, -10 * ( fraction -= 1 ) ) * Math.sin( ( fraction - s ) * ( 2 * Math.PI ) / p ) * 0.5 + 1
				}
			} 
			break;
		case MovementTypeEnum.STEADY:
			result = 0;
			break;
	}
	return result;
}