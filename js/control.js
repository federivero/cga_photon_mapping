
var canvas = document.getElementById('photonMappingBox');
var context = canvas.getContext('2d');

var config = null;

var Control = {};


Control.initialize = function(){
    Control.eraseCanvas();
    Control.canvasStartupMessage();
    Control.initializeFileUpload();
	Control.loadScene();

    //K3D.load("models/fox.obj", Control.parse_obj_model);

    // adjust canvas aspect ratio to match viewport's
    Control.adaptCanvasAspectRatio(Control.scene.viewport);
	Control.startPhotonMapping();
    Control.captureCanvas(ImageTypeEnum.PHOTON_GLOBAL_MAP);
	Control.rayTrace();
    Control.captureCanvas(ImageTypeEnum.COMPLETE_RENDER);
    //Control.tests();
}

Control.tests = function(){
    console.log(Control.photonMapping.get_photons(PhotonMapEnum.GLOBAL, new Vector(0,1,0)));

    // plane collision test
    /*
    var p = new Plane(
        [new Vector(0,1,0), new Vector(1,0,0), new Vector(1,1,0)],
        new Transform(
            new Vector(0, 0, 25),
            null,
            new Vector(3, 3, 3)
        ),
        new Color(100, 40, 0),
        0, 0, false
    );
    //console.log(p.collide([new Vector(0,0,-1),  new Vector(0,2,1)]));

    // triangle collision test
     var t = new Triangle(
        [new Vector(0,0,0), new Vector(1,0,0), new Vector(0,1,0)],
        new Transform(
            new Vector(0, 0, 25),
            null,
            new Vector(3, 3, 3)
        ),
        new Color(100, 40, 0),
        0, 0, false
    );
    console.log(t.collide([new Vector(0.2,0.2,-1),  new Vector(0.2,0.2,1)]));
    console.log(t.collide([new Vector(0.5,0.5,-1),  new Vector(0.5,0.5,1)]));
    console.log(t.collide([new Vector(1,1,-1),  new Vector(1,1,1)]));
    console.log(t.collide([new Vector(0,-0.1,-1),  new Vector(0,-0.1,1)]));
    */
}

Control.clickLnkCargarArchivo = function(){
	document.getElementById('inputCargarArchivo').click();
}

Control.parse_config = function(txtConfig){
	var jsonConfig = JSON.parse(txtConfig);

    // todo: handle error in json

	config = jsonConfig;
}

Control.parse_obj_model = function(obj_txt){

    var parsed_obj = K3D.parse.fromOBJ(obj_txt);
    console.log(parsed_obj);
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
            var extension = "";
            var fileName = file.name;
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


            if (extension == OBJ_FILE){
                K3D.load(file);
            }else if (extension == JSON_FILE){
                var reader = new FileReader();

                reader.readAsText(file);
                reader.onloadend = function(){
                    var file_content = reader.result;
                    if (extension == JSON_FILE){
                        Control.parse_config(file_content);
                    }
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
            new Color(100, 40, 0),
			1,
			new Color(100,100,100),
            false
        ),
		new Sphere(
            new Transform(
                new Vector(3, 0, 20),
                null,
                new Vector(1, 1, 1)
            ),
            new Color(20, 180, 40),
			1,
			new Color(100,100,100),
            false
        ),
		new Sphere(
            new Transform(
                new Vector(-5, -4, 40),
                null,
                new Vector(15, 15, 15)
            ),
            new Color(20, 20, 20),
			1,
			new Color(100,100,100),
            true
        ),
        new Sphere(
            new Transform(
                new Vector(3, 0, -20),
                null,
                new Vector(10, 10, 10)
            ),
            new Color(20, 180, 40),
            1,
            new Color(100,100,100),
            false
        ),
        new Sphere(
            new Transform(
                new Vector(1.5, 0, 10),
                null,
                new Vector(2, 2, 2)
            ),
            new Color(0, 0, 0),
			1,
			new Color(100,100,100),
            false,
            1.0,
            1.5
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
            this.triangles.push(new Triangle([p1,p2,p3],null,null,0,0,false));
            this.triangles.push(new Triangle([p1,p3,p4],null,null,0,0,false));
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
		this.photonMapping = new PhotonMapping(300000);
        this.photonMapping.generatePhotons(this.scene);

        this.generatePhotonImage();
	}
}

Control.generatePhotonImage = function(){
    this.photonMapping.drawPhotonMap(PhotonMapEnum.GLOBAL, this.scene);
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
	for (let row = 0; row < canvas.height; ++row) {
		for (let col = 0; col < canvas.width; ++col) {
			let current_pos = (row*canvas.width + col) * 4;
            let v2 = pixels[row*canvas.width + col];
            let trace_result = Control.scene.trace(v1, v2);
            if (trace_result.found === true) {
				let color = trace_result.nearest_shape.calculate_color(trace_result.nearest_collision, v1, v2, 10);
                img.data[current_pos] = color.r;
                img.data[current_pos + 1] = color.g;
                img.data[current_pos + 2] = color.b;
                img.data[current_pos + 3] = 255;
            } else {
				img.data[current_pos] = Control.scene.background_color.r;
				img.data[current_pos + 1] = Control.scene.background_color.g;
				img.data[current_pos + 2] = Control.scene.background_color.b;
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

var imageHistory = [];
var currentImage = -1;

// adds the current canvas to the image history
Control.captureCanvas = function(type){
    var captureCanvas = document.createElement('canvas');
    var captureContext = captureCanvas.getContext('2d');
    captureCanvas.width = canvas.width;
    captureCanvas.height = canvas.height;
    captureContext.drawImage(canvas, 0, 0);
    imageHistory.push(captureCanvas);

    currentImage++;

    if (imageHistory.length > 1)
        document.getElementById('btnPreviousImage').disabled = false;

    //Control.upload_canvas_image_to_server(type);
}

Control.previousImage = function(){
    if (currentImage > 0){
        currentImage--;
        this.displayCurrentImage();
    }
    this.updateControlButtons();
}

Control.nextImage = function(){
    if (currentImage < (imageHistory.length - 1)){
        currentImage++;
        this.displayCurrentImage();
    }
    this.updateControlButtons();
}

Control.displayCurrentImage = function(){
    var image = imageHistory[currentImage];
    canvas.width = image.width;
    canvas.height = image.height;
    context.drawImage(image, 0, 0);
}

Control.updateControlButtons = function(){
    if (currentImage > 0){
        document.getElementById('btnPreviousImage').disabled = false;
    }else{
        document.getElementById('btnPreviousImage').disabled = true;
    }
    if (currentImage < (imageHistory.length - 1)){
        document.getElementById('btnNextImage').disabled = false;
    }else{
        document.getElementById('btnNextImage').disabled = true;
    }
}

ImageTypeEnum = {
    PHOTON_GLOBAL_MAP : "PGM",
    PHOTON_CAUSTIC_MAP : "PCM",
    COMPLETE_RENDER : "CR"
}

Control.upload_canvas_image_to_server = function(type){

    type = type || ImageTypeEnum.COMPLETE_RENDER;

    var now = new Date();
    var image_name = type + "_" + now.getMonth() + "_" + now.getDate() + "_" + now.getHours() + "_" + now.getMinutes() + "_" + now.getSeconds() + "_" + now.getMilliseconds() + ".jpg";
    var canvas_image = canvas.toDataURL('image/jpeg', 1.0);
    var parameters = { image_name: image_name, image_content: canvas_image};

    var base_url = "http://www.randomit.com.uy/cga_photon_mapping_server";    
    var relative_path = '/api/images'; 
    
    $.ajax({
        url: base_url + relative_path,
        type: "POST",
        success: function(){ console.log("Upload successful"); },
        error: function(){ console.log("Error while submitting image to server"); },
        dataType: 'json',
        data: JSON.stringify(parameters)
    });

}

