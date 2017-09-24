
var canvas = document.getElementById('photonMappingBox');
var context = canvas.getContext('2d');

var Control = {};

Control.ready_for_input = false;
Control.model_shapes = [];

Control.initialize = function(){
    Control.initialize_canvas();
    Control.initializeFileUpload();


    Control.load_default_configuration(this.config_loaded);

    //Control.tests();
}

Control.config_loaded = function(){
    Control.loadScene();
    Control.start_photon_mapping();
}

Control.load_default_configuration = function(){
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function(){
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                Control.parse_config(xhr.responseText);
            } else {
                $.notify("No se pudo cargar la configuración por defecto", "error");
            }
        }
    };
    xhr.open("GET", "config.json", true);
    xhr.send();
}

Control.start_photon_mapping = function(){
    // adjust canvas aspect ratio to match viewport's
    this.ready_for_input = false;
    Control.adaptCanvasAspectRatio(Control.scene.viewport);
    Control.startPhotonMapping();
    Control.captureCanvas(ImageTypeEnum.PHOTON_GLOBAL_MAP);
    Control.rayTrace();
    Control.captureCanvas(ImageTypeEnum.COMPLETE_RENDER);
    this.ready_for_input = true;
    $.notify("Finished", "info");
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
	this.config = jsonConfig;

    // set default values
    this.config.resolution = this.config.resolution || {};
    this.config.photon_count = this.config.photon_count || 10000;

    this.config.scene = this.config.scene || {};
    this.config.scene.models = this.config.scene.models || [];
    this.config.scene.shapes = this.config.scene.shapes || [];
    this.config.scene.camera = this.config.scene.camera || {};
    this.config.scene.camera.x = this.config.scene.camera.x || 0;
    this.config.scene.camera.y = this.config.scene.camera.y || 0;
    this.config.scene.camera.z = this.config.scene.camera.z || 0;
    this.config.scene.viewport = this.config.scene.viewport || {};
    this.config.scene.viewport.center = this.config.scene.viewport.center || {};
    this.config.scene.viewport.center.x = this.config.scene.viewport.center.x || 0;
    this.config.scene.viewport.center.y = this.config.scene.viewport.center.y || 0;
    this.config.scene.viewport.center.z = this.config.scene.viewport.center.z || 10;
    this.config.scene.viewport.width = this.config.scene.viewport.width || 20;
    this.config.scene.viewport.height = this.config.scene.viewport.height || 10;

    this.config.scene.lights = this.config.scene.lights || [];

    this.config.scene.models = this.config.scene.models || [];
    this.loaded_models = 0;
    for (var i = 0; i < this.config.scene.models.length; i++){
        K3D.load(this.config.scene.models[i], Control.parse_obj_model);
    }

    if (this.config.scene.models.length == 0){
        this.config_loaded();
    }
}

Control.parse_obj_model = function(obj_txt){
    var parsed_obj = K3D.parse.fromOBJ(obj_txt);
    var color = new Color(200,0,0);
    for (var i = 0; i < parsed_obj.i_verts.length; i+=3){
        var verts = [];
        for (var j = 0; j < 3; j++){
            var v_i = parsed_obj.i_verts[i + j]; // vertex index

            var x = parsed_obj.c_verts[v_i];
            var y = parsed_obj.c_verts[v_i+1];
            var z = parsed_obj.c_verts[v_i+2];

            verts.push(new Vector(x,y,z));
        }
        var t = new Triangle(verts, null, color, 1, color, false, 0, 0);
        Control.model_shapes.push(t);

        if (Control.model_shapes.length > 100){
            break;
        }
    }

    Control.loaded_models++;
    if (Control.loaded_models == Control.config.scene.models.length){
        Control.config_loaded();
    }
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

Control.initialize_canvas = function(){
    this.eraseCanvas();
    this.canvasStartupMessage();
    this.set_canvas_input_functions();
}

Control.canvasStartupMessage = function(){
    context.font = "24px Verdana";
    context.fillStyle = "black";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText("Próximamente: imagen de photon mapping", canvas.width / 2, canvas.height / 2);
}

Control.set_canvas_input_functions = function(){
    canvas.onmousedown = function(event){
        Control.canvas_mouse_down(event);
    }

    canvas.onmouseup = function(event){
        Control.canvas_mouse_up(event);
    }
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
    /*
	let shapes = [
        new Sphere(
            new Transform(
                new Vector(0, 0, 25),
                null,
                new Vector(3, 3, 3)
            ),
            new Color(100, 40, 0),
            0.5,
            new Color(100, 40, 0)
        ),
        new Sphere(
            new Transform(
                new Vector(3, 0, 20),
                null,
                new Vector(1, 1, 1)
            ),
            new Color(20, 180, 40),
            0.0,
            new Color(100,100,100),
            0,
            false,
            1,
            1.5
        ),
        // new Sphere(
        //     new Transform(
        //         new Vector(3, 0, -20),
        //         null,
        //         new Vector(10, 10, 10)
        //     ),
        //     new Color(20, 180, 40),
        //     0.5,
        //     new Color(100,100,100)
        // ),
        // new Triangle(
        //     [
        //         new Vector(-25,0,50),
        //         new Vector(20,0,50),
        //         new Vector(0,25,50),
        //     ],
        //     new Transform(
        //         new Vector(0, 0, 0),
        //         null,
        //         new Vector(0, 0, 0)
        //     ),
        //     new Color(230, 220, 35),
        //     0,
        //     new Color(100,100,100),
        // ),
        new Plane(
            [
                new Vector(-30,0,0),
                new Vector(-30,1,0),
                new Vector(-30,0,-1),
            ],
            new Transform(
                new Vector(0, 0, 0),
                null,
                new Vector(0, 0, 0)
            ),
            new Color(0, 0, 150),
            0.9,
            new Color(100,100,100)
        ),
        new Plane(
            [
                new Vector(30,0,0),
                new Vector(30,0,-1),
                new Vector(30,1,0),
            ],
            new Transform(
                new Vector(0, 0, 0),
                null,
                new Vector(0, 0, 0)
            ),
            new Color(150, 0, 0),
            0.9,
            new Color(100,100,100)
        ),
        new Plane(
            [
                new Vector(0,0,60),
                new Vector(1,0,60),
                new Vector(0,1,60)
            ],
            new Transform(
                new Vector(0, 0, 0),
                null,
                new Vector(0, 0, 0)
            ),
            new Color(150, 150, 150),
            0.9,
            new Color(100,100,100)
        )
    ];
    */
    let lights = Control.parse_lights_from_config();
    let shapes = Control.parse_shapes_from_config();
    for (var i = 0; i < Control.model_shapes.length; i++){
        shapes.push(Control.model_shapes[i]);
    }
    let camera = new Vector(this.config.scene.camera.x, this.config.scene.camera.y, this.config.scene.camera.z);
    let viewport = {
        center: new Vector(this.config.scene.viewport.center.x, this.config.scene.viewport.center.y, this.config.scene.viewport.center.z),
        width: this.config.scene.viewport.width,
        height: this.config.scene.viewport.height,
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
		// this.photonMapping = new PhotonMapping(this.config.photon_count, 1000);
		this.photonMapping = new PhotonMapping(1000, 10000);
        this.photonMapping.generatePhotons(PhotonMapEnum.GLOBAL, this.scene);
        console.log('finished generating global photons!')
        this.photonMapping.generatePhotons(PhotonMapEnum.CAUSTIC, this.scene);
        console.log('finished generating caustic photons!')
        this.generatePhotonImage();
	}
}

Control.generatePhotonImage = function(){
    this.photonMapping.drawPhotonMap(PhotonMapEnum.CAUSTIC, this.scene);
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
    var canvasImage = canvas.toDataURL('image/png', 1.0);
    downloadLink.setAttribute('download', "canvasImage.png");
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

    // Control.upload_canvas_image_to_server(type);
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


Control.canvas_mouse_down = function(event){
    if (this.ready_for_input){
        var rect = canvas.getBoundingClientRect();
        this.startMouseX = event.clientX - rect.left;
        this.startMouseY = event.clientY - rect.top;
    }
}

Control.canvas_mouse_up = function(event){
    if (this.ready_for_input){
        var rect = canvas.getBoundingClientRect();
        this.endMouseX = event.clientX - rect.left;
        this.endMouseY = event.clientY - rect.top;

        // move viewport and render again
        if (this.endMouseX != this.startMouseX){
            var dif = clamp(this.startMouseX - this.endMouseX, -COMPLETE_CIRCLE_X_SWIPE, COMPLETE_CIRCLE_X_SWIPE);
            var rotation = dif * 2 * Math.PI / COMPLETE_CIRCLE_X_SWIPE;

            var viewport = this.scene.viewport;
            var camera_distance = viewport.center.distanceTo(this.scene.camera);
            var current_rotation = Math.atan2(viewport.center.x, viewport.center.z);
            viewport.center.x = camera_distance * Math.sin(rotation + current_rotation);
            viewport.center.z = camera_distance * Math.cos(rotation + current_rotation);

            this.start_photon_mapping();
        }
    }
}


Control.parse_lights_from_config = function(){
    let lights = [];

    for (var i = 0; i < this.config.scene.lights.length; i++){
        var config_light = this.config.scene.lights[i];
        var l;
        switch (config_light.type){
            case "point":
                l = new PointLight(
                    new Transform(
                        new Vector(config_light.position.x, config_light.position.y, config_light.position.z), null, null
                    ),
                    new Color(config_light.color.r, config_light.color.g, config_light.color.b),
                    config_light.power
                );
                break;
        }
        lights.push(l);
    }
    console.log(lights);
    return lights;
}

Control.parse_shapes_from_config = function(){
    let shapes = [];

    for (var i = 0; i < this.config.scene.shapes.length; i++){
        var config_shape = this.config.scene.shapes[i];
        var s;
        switch (config_shape.type){
            case "plane":
                s = new Plane(
                    [
                        new Vector(config_shape.points[0].x, config_shape.points[0].y, config_shape.points[0].z),
                        new Vector(config_shape.points[1].x, config_shape.points[1].y, config_shape.points[1].z),
                        new Vector(config_shape.points[2].x, config_shape.points[2].y, config_shape.points[2].z),
                    ],
                    new Transform(
                        new Vector(0, 0, 0),
                        null,
                        new Vector(0, 0, 0)
                    ),
                    new Color(config_shape.diffuse_color.r, config_shape.diffuse_color.g, config_shape.diffuse_color.b),
                    config_shape.diffuse_reflection_coefficient,
                    new Color(config_shape.specular_color.r,config_shape.specular_color.g,config_shape.specular_color.b),
                    config_shape.specular_coefficient || 0,
                    config_shape.is_mirror || false,
                    config_shape.transparency || 0,
                    config_shape.refraction_coefficient || 0
                );
                break;
            case "sphere":
                s = new Sphere(
                    new Transform(
                        new Vector(config_shape.center.x, config_shape.center.y, config_shape.center.z),
                        null,
                        new Vector(config_shape.radius, config_shape.radius, config_shape.radius)
                    ),
                    new Color(config_shape.diffuse_color.r, config_shape.diffuse_color.g, config_shape.diffuse_color.b),
                    config_shape.diffuse_reflection_coefficient,
                    new Color(config_shape.specular_color.r,config_shape.specular_color.g,config_shape.specular_color.b),
                    config_shape.specular_coefficient || 0,
                    config_shape.is_mirror || false,
                    config_shape.transparency || 0,
                    config_shape.refraction_coefficient || 0
                )
                break;
        }
        shapes.push(s);
    }
    return shapes;
}
