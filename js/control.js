
var canvas = document.getElementById('photonMappingBox');
var context = canvas.getContext('2d');

var config = null;

var Control = {};

Control.initialize = function(){
    Control.eraseCanvas();
    Control.canvasStartupMessage();
    Control.initializeFileUpload();
	Control.loadScene();
	//Control.startPhotonMapping();
	Control.rayTrace();

    //Control.tests();
}

Control.tests = function(){

    // plane collision test
    var p = new Plane( [new Vector(0,1,0), new Vector(1,0,0), new Vector(1,1,0)], 
            new Transform(
                new Vector(0, 0, 25),
                null,
                new Vector(3, 3, 3)
            ),
            new Color(100, 40, 0) );

    //console.log(p.collide([new Vector(0,0,-1),  new Vector(0,2,1)]));

    // triangle collision test
     var t = new Triangle( [new Vector(0,0,0), new Vector(1,0,0), new Vector(0,1,0)], 
            new Transform(
                new Vector(0, 0, 25),
                null,
                new Vector(3, 3, 3)
            ),
            new Color(100, 40, 0) );

    console.log(t.collide([new Vector(0.2,0.2,-1),  new Vector(0.2,0.2,1)]));
    console.log(t.collide([new Vector(0.5,0.5,-1),  new Vector(0.5,0.5,1)]));
    console.log(t.collide([new Vector(1,1,-1),  new Vector(1,1,1)]));
    console.log(t.collide([new Vector(0,-0.1,-1),  new Vector(0,-0.1,1)]));
}

Control.clickLnkCargarArchivo = function(){
	document.getElementById('inputCargarArchivo').click();
}

Control.parsearConfiguracion = function(txtConfig){
	var jsonConfig = JSON.parse(txtConfig);

    // todo: handle error in json

	config = jsonConfig;
}

Control.eraseCanvas = function(){
    // setting width and height values of the canvas erases it
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    context.fillStyle = "white";
    context.rect(0, 0, canvas.width, canvas.height);
    context.fill();
}

Control.setCanvasWidthAndHeight = function(w,h){

    canvas.style.width = w;
    canvas.style.height = h;    

    canvas.width = w;
    canvas.height = h;

    context.fillStyle = "white";
    context.rect(0, 0, canvas.width, canvas.height);
    context.fill();
}

Control.canvasStartupMessage = function(){
    context.font = "24px Verdana";
    context.fillStyle = "black";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText("Próximamente: imagen de photon mapping", canvas.width / 2, canvas.height / 2);
}

Control.getCanvasAspectRatio = function(){
    return canvas.width / canvas.height;
}

Control.initializeFileUpload = function(){
    $('#inputCargarArchivo').fileupload({
        // Función llamada al seleccionar un archivo nuevo
        add: function(e, data){
            var file = data.files[0];
            var reader = new FileReader();
            reader.readAsText(file);

            reader.onloadend = function(){
                var extension = "";

                var fileName = archivo.name;
                if (fileName.includes(".")){
                    extension = fileName.substring(fileName.lastIndexOf("."))
                }else{
                    $.notify("Archivo sin extensión", "error");
                    return;
                }
                if (EXTENSIONES_VALIDAS.indexOf(extension) == -1){
                    $.notify("Extensión inválida. Extensiones válidas: " + EXTENSIONES_VALIDAS, "error");
                    return;
                }
                var fileContent = reader.result;
                if (extension == EXTENSION_JSON){
                    parsearConfiguracion(fileContent);
                }

            }
        }
    });
}

Control.loadScene = function() {
	let shapes = [
		new Sphere(
            new Transform(
                new Vector(0, 0, 25),
                null,
                new Vector(3, 3, 3)
            ),
            new Color(100, 40, 0)
        ),
		new Sphere(
            new Transform(
                new Vector(3, 0, 20),
                null,
                new Vector(1, 1, 1)
            ),
            new Color(20, 180, 40)
        ),
		new Sphere(
            new Transform(
                new Vector(-5, -4, 40),
                null,
                new Vector(15, 15, 15)
            ),
            new Color(200, 180, 40)
        )
	];
	let lights = [
		new PointLight(
			new Transform(
				new Vector(10, 8, 10), null, null
			),
			new Color(255, 255, 255),
            100 // power
		)
	];
	let camera = new Vector(0,0,0)
	let viewport = {
		center: new Vector(0,0,10),
		width: 20,
		height: 10,
        getAspectRatio : function(){
            return this.width / this.height;
        },
        collidesWithRay : function(ray){
            if (this.triangles == undefined){
                this.generateTriangles();
            }
            var collision = this.triangles[0].collide(ray);
            if (collision.length > 0){
                return collision;
            }else{
                return this.triangles[1].collide(ray);
            }
        },
        generateTriangles : function(){
            this.triangles = [];
            var p1 = new Vector(this.center.x - this.width / 2, this.center.y + this.height / 2, this.center.z);
            var p2 = new Vector(this.center.x + this.width / 2, this.center.y + this.height / 2, this.center.z);
            var p3 = new Vector(this.center.x + this.width / 2, this.center.y - this.height / 2, this.center.z);
            var p4 = new Vector(this.center.x - this.width / 2, this.center.y - this.height / 2, this.center.z);
            this.triangles.push(new Triangle([p1,p2,p3],null,null));
            this.triangles.push(new Triangle([p1,p3,p4],null,null));   
        }
	};
	Control.scene = new Scene(
		shapes,
		lights,
		camera,
		viewport
	);
}

Control.startPhotonMapping = function(){

	var ok = true; //Control.controlarPrecondiciones();

	if (ok){
		this.photonMapping = new PhotonMapping(300);
        this.photonMapping.generatePhotons(this.scene);

        this.generatePhotonImage();

        this.photonMapping.drawPhotonMap(PhotonMapEnum.GLOBAL, this.scene);

	}
}

Control.generatePhotonImage = function(){
    
}

// Changes canvas width and heght to match viewport's aspect ratio 
Control.adaptCanvasAspectRatio = function(viewport){
    if (Control.getCanvasAspectRatio() > viewport.getAspectRatio()){
        Control.setCanvasWidthAndHeight(canvas.width / Control.getCanvasAspectRatio() * viewport.getAspectRatio(), canvas.height);
    }else if (viewport.getAspectRatio() < Control.getCanvasAspectRatio()){
        Control.setCanvasWidthAndHeight(canvas.width, canvas.height / Control.getCanvasAspectRatio() * viewport.getAspectRatio());
    }    
}

Control.rayTrace = function() {

    // adjust canvas aspect ratio to match viewport's
    Control.adaptCanvasAspectRatio(Control.scene.viewport);

    let img = context.getImageData(0, 0, canvas.width, canvas.height);

	let pixel_size = { 
		width: Control.scene.viewport.width / canvas.width,
		height: Control.scene.viewport.height / canvas.height
	}
	let topleft = new Vector(
		Control.scene.viewport.center.x - (Control.scene.viewport.width / 2),
		Control.scene.viewport.center.y + (Control.scene.viewport.height / 2),
		Control.scene.viewport.center.z
	);

	let pixels = [];
	for (let row = 0; row < canvas.height; ++row) {
		for (let col = 0; col < canvas.width; ++col) {
			// pixels[row*canvas.width + col]
			pixels.push(new Vector(
				topleft.x + (col * pixel_size.width) + pixel_size.width / 2,
				topleft.y - (row * pixel_size.height) - pixel_size.height / 2,
				topleft.z
			));
		}
	}

    let v1 = Control.scene.camera;
    // The dot product of this vector with any point shouldn't be negative
    let direction = Control.scene.viewport.center.subtract(v1);
    let segment = new Vector();
	for (let row = 0; row < canvas.height; ++row) {
		for (let col = 0; col < canvas.width; ++col) {
            // from here onwards it's the Trace function, soon to be moved away
			let current_pos = (row*canvas.width + col) * 4;
			let found = false;
            let v2 = pixels[row*canvas.width + col];
            let shortest_distance = -1;
            let nearest_shape = null;
            let nearest_collision = null;
			Control.scene.shapes.forEach(function(shape){
                let collisions = shape.collide([v1, v2]);
                collisions.forEach(function(current_collision) {
                    // for each collision, keep the closest point found yet
                    // check if the vector is on the right side of the camera
                    segment = Vector.subtract(current_collision, v1, segment);
                    if ((segment.dot(direction) >= 0) && (!found || (segment.length() < shortest_distance))) {
                        found = true;
                        shortest_distance = segment.length();
                        nearest_shape = shape;
                        nearest_collision = current_collision;
                    }
                });
			})
            if (found === true) {
				let color = nearest_shape.calculate_color(nearest_collision, v1, v2, 1);
                img.data[current_pos] = color.r;
                img.data[current_pos + 1] = color.g;
                img.data[current_pos + 2] = color.b;
                img.data[current_pos + 3] = 255;
            } else {
				img.data[current_pos] = 0;
				img.data[current_pos + 1] = 0;
				img.data[current_pos + 2] = 0;
				img.data[current_pos + 3] = 255;
			}
		}
	}
	context.putImageData(img, 0, 0);
}

Control.controlarPrecondiciones = function(){
	if (config == null){
		$.notify('Falta cargar la configuracion','warn');
		return false;
	}

	return true;
}


Control.downloadCanvas = function(){
    var downloadLink = document.getElementById('downloadCanvasLink');
    var canvasImage = canvas.toDataURL('image/jpeg', 1.0);
    downloadLink.setAttribute('download', "canvasImage.jpg");
    downloadLink.href = canvasImage;
    downloadLink.click();
}
