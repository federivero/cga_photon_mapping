
var canvas = document.getElementById('photonMappingBox');
var context = canvas.getContext('2d');

var Control = {};

Control.ready_for_input = false;
Control.preloaded_shapes = [];
Control.textures = {};

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
    console.log('starting photon mapping');
    Control.startPhotonMapping();
    console.log('starting trace');
    // is this what you call callback hell?
    Control.rayTrace(function() {
        Control.captureCanvas(ImageTypeEnum.COMPLETE_RENDER);
        this.ready_for_input = true;
        $.notify("Finished", "info");
    })
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

/*
  Parses the configuration file.

  - Overrides constants
  - Set's up the scene.
  - Triggers model loading.

  When everything's ready, Control.config_loaded is called
*/
Control.parse_config = function(txtConfig){
	var jsonConfig = JSON.parse(txtConfig);
	this.config = jsonConfig;

    // set default values
    this.config.resolution = this.config.resolution || {};
    this.config.global_map_photon_count = this.config.global_map_photon_count || 10000;
    this.config.photon_max_bounce = this.config.photon_max_bounce || 4;
    this.config.nearby_photons_proportion = this.config.nearby_photons_proportion || 0.0001;
    this.config.nearby_photons_fixed_quantity = this.config.nearby_photons_fixed_quantity || 5;
    this.config.nearby_photons_per_point_type = this.config.nearby_photons_per_point_type || 'proportional';
    this.config.diffuse_photon_scale_factor = this.config.diffuse_photon_scale_factor || 1;
    this.config.caustic_photon_scale_factor = this.config.caustic_photon_scale_factor || 1;
    PhotonMapping.MAX_PHOTON_BOUNCE = this.config.photon_max_bounce;
    PhotonMapping.PHOTON_PROPORTION = this.config.nearby_photons_proportion;
    PhotonMapping.NEARBY_PHOTON_FIXED_QUANTITY = this.config.nearby_photons_fixed_quantity;
    PhotonMapping.NEARBY_PHOTON_PER_POINT_TYPE = this.config.nearby_photons_per_point_type;

    Shape.DIFFUSE_PHOTON_SCALE_FACTOR = this.config.diffuse_photon_scale_factor;
    Shape.CAUSTIC_PHOTON_SCALE_FACTOR = this.config.caustic_photon_scale_factor;

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

    // load models
    this.config.scene.models = this.config.scene.models || [];
    this.config.scene.loaded_models = [];
    this.loaded_models = 0;
    for (var i = 0; i < this.config.scene.models.length; i++){

        this.config.scene.models[i].transform = this.config.scene.models[i].transform || {};
        this.config.scene.models[i].transform.translate = this.config.scene.models[i].transform.translate || {};
        this.config.scene.models[i].transform.translate.x = this.config.scene.models[i].transform.translate.x || 0;
        this.config.scene.models[i].transform.translate.y = this.config.scene.models[i].transform.translate.y || 0;
        this.config.scene.models[i].transform.translate.z = this.config.scene.models[i].transform.translate.z || 0;
        this.config.scene.models[i].transform.rotate.x = this.config.scene.models[i].transform.rotate.x || 0;
        this.config.scene.models[i].transform.rotate.y = this.config.scene.models[i].transform.rotate.y || 0;
        this.config.scene.models[i].transform.rotate.z = this.config.scene.models[i].transform.rotate.z || 0;
        this.config.scene.models[i].transform.scale.x = this.config.scene.models[i].transform.scale.x || 1;
        this.config.scene.models[i].transform.scale.y = this.config.scene.models[i].transform.scale.y || 1;
        this.config.scene.models[i].transform.scale.z = this.config.scene.models[i].transform.scale.z || 1;

        this.config.scene.models[i].texture = this.config.scene.models[i].texture || "";
        this.config.scene.models[i].name = this.config.scene.models[i].name || "";
        
        this.config.scene.models[i].color = this.config.scene.models[i].color || {};
        this.config.scene.models[i].color.r = this.config.scene.models[i].color.r || 200; // default color light red
        this.config.scene.models[i].color.g = this.config.scene.models[i].color.g || 0;
        this.config.scene.models[i].color.b = this.config.scene.models[i].color.b || 0;

        var model_config = Control.config.scene.models[i];
        K3D.load(this.config.scene.models[i].model, function(obj_txt){
            Control.parse_obj_model(obj_txt, model_config);
        });
    }

    if (this.config.scene.models.length == 0){
        this.config_loaded();
    }
}

/*
    Parses an .obj model and loads it into the scene.

    Applies any transform present in 'model_config' to the loaded mesh.
*/
Control.parse_obj_model = function(obj_txt, model_config){
    var parsed_obj = K3D.parse.fromOBJ(obj_txt);
    var color = new Color(model_config.color.r, model_config.color.g, model_config.color.b);

    var rotation = model_config.transform.rotate;
    rotation.x = rotation.x * Math.PI / 180;
    rotation.y = rotation.y * Math.PI / 180;
    rotation.z = rotation.z * Math.PI / 180;

    // axis rotation matrixes
    var rotation_x_matrix = math.matrix([
        [1,0                   ,0],
        [0,Math.cos(rotation.x),-Math.sin(rotation.x)],
        [0,Math.sin(rotation.x),Math.cos(rotation.x)]]);

    var rotation_z_matrix = math.matrix([
        [Math.cos(rotation.z),-Math.sin(rotation.z),0],
        [Math.sin(rotation.z), Math.cos(rotation.z),0],
        [0                   ,0                    ,1]]);

    var rotation_y_matrix = math.matrix([
        [Math.cos(rotation.y), 0,Math.sin(rotation.y)],
        [0,                    1,0],
        [-Math.sin(rotation.y),0,Math.cos(rotation.y)]]);

    var scale = model_config.transform.scale;
    var scale_matrix = math.matrix([[scale.x,0,0],[0,scale.y,0],[0,0,scale.z]]);

    // just rotation
    var rotation_matrix = math.multiply(math.multiply(rotation_x_matrix, rotation_y_matrix), rotation_z_matrix);

    // rotation + scale
    var transform_matrix = math.multiply(rotation_matrix, scale_matrix);

    // save the generated triangles in the config
    var model_name = model_config.name;
    Control.config.scene.loaded_models[model_name] = [];

    for (var i = 0; i < parsed_obj.i_verts.length; i+=3){
        var verts = [];
        var normals = [];
        var texture_coordinates = [];
        var has_texture = false;
        var has_normals = true;

        // in a .obj model, verts are expressed in counterclockwise order
        for (var j = 2; j >= 0; j--){
            var v_i = parsed_obj.i_verts[i + j] * 3; // vertex index
            var n_i = parsed_obj.i_norms[i + j] * 3; // normal index
            var t_i = parsed_obj.i_uvt[i + j] * 2; // texture index

            var x = parsed_obj.c_verts[v_i];
            var y = parsed_obj.c_verts[v_i+1];
            var z = parsed_obj.c_verts[v_i+2];

            verts.push(new Vector(x,y,z));

            if (isNaN(n_i)){
                has_normals = false;
            }else{
                x = parsed_obj.c_norms[n_i];
                y = parsed_obj.c_norms[n_i+1];
                z = parsed_obj.c_norms[n_i+2];

                normals.push(new Vector(x,y,z));                
            }

            if (!isNaN(t_i)){
                var u = parsed_obj.c_uvt[t_i];
                var v = parsed_obj.c_uvt[t_i + 1];
                texture_coordinates.push([u,v]);
                has_texture = (model_config.texture != "");
            }
        }

        // scale and rotate
        for (var k = 0; k < verts.length; k++){
            verts[k] = Vector.fromArray(math.multiply(verts[k].toArray(),transform_matrix)._data);
            if (has_normals)
                normals[k] = Vector.fromArray(math.multiply(normals[k].toArray(),rotation_matrix)._data);
        }   
        // translate object
        for (var k = 0; k < verts.length; k++){
            verts[k].x += model_config.transform.translate.x;
            verts[k].y += model_config.transform.translate.y;
            verts[k].z += model_config.transform.translate.z;
        }

        var t = new Triangle(verts, null, color, 1, color, false, 0, 0);
        t.has_texture = has_texture;
        t.texture_coordinates = texture_coordinates;
        t.texture_name = model_config.texture;

        // calculate normal at the baricenter of the triangle
        if (has_normals){
            t.set_normals(normals);
            /*
            var normal = new Vector(0,0,0);
            for (var k = 0; k < normals.length; k++){
                normal.x += normals[k].x / 3;
                normal.y += normals[k].y / 3;
                normal.z += normals[k].z / 3;
            }
            t.plane.setNormal(normals[1]);            
            */
        }

        Control.config.scene.loaded_models[model_name].push(t);
        //Control.model_shapes.push(t);
    }

    // load textures on the model
    if (model_config.texture != ""){
        var img = document.createElement('img');
        img.src = model_config.texture;
        img.onload = function(){
            // image is loaded, draw everything onto a canvas and extract it's pixels
            var texture_canvas = document.createElement('canvas');
            var texture_context = texture_canvas.getContext('2d');
            texture_canvas.width = img.naturalWidth;
            texture_canvas.height = img.naturalHeight;
            texture_context.drawImage(img, 0, 0);
            var texture_pixels = texture_context.getImageData(0, 0, texture_canvas.width, texture_canvas.height).data;

            Control.textures[model_config.texture] = { width: texture_canvas.width, height: texture_canvas.height, pixels : texture_pixels};
            Control.loaded_models++;
            if (Control.loaded_models == Control.config.scene.models.length){
                Control.config_loaded();
            }
        }
    }else{
        Control.loaded_models++;
        if (Control.loaded_models == Control.config.scene.models.length){
            Control.config_loaded();
        }
    }

    Control.parsed_obj = parsed_obj;
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
    for (var i = 0; i < Control.preloaded_shapes.length; i++){
        shapes.push(Control.preloaded_shapes[i]);
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
		this.photonMapping = new PhotonMapping(this.config.global_map_photon_count, this.config.caustic_map_photon_count);
        this.photonMapping.generatePhotons(PhotonMapEnum.GLOBAL, this.scene);
        //console.log('finished generating global photons!')
        this.photonMapping.generatePhotons(PhotonMapEnum.CAUSTIC, this.scene);
        //console.log('finished generating caustic photons!')

        // generate image with the global photon map
        this.generatePhotonImage(PhotonMapEnum.GLOBAL, true);
        Control.captureCanvas(ImageTypeEnum.PHOTON_GLOBAL_MAP);

        // generate image with the caustic photon map
        this.generatePhotonImage(PhotonMapEnum.CAUSTIC, true);
        Control.captureCanvas(ImageTypeEnum.PHOTON_CAUSTIC_MAP);

        // generate image with both photon maps
        this.generatePhotonImage(PhotonMapEnum.GLOBAL, true);
        this.generatePhotonImage(PhotonMapEnum.CAUSTIC, false);
        Control.captureCanvas(ImageTypeEnum.PHOTON_MULTIMAP);

	}
}

Control.generatePhotonImage = function(map_type, clear_canvas){
    this.photonMapping.drawPhotonMap(map_type, this.scene, clear_canvas);
}

// Changes canvas width and heght to match viewport's aspect ratio
Control.adaptCanvasAspectRatio = function(viewport){
    if (Control.getCanvasAspectRatio() > viewport.getAspectRatio()){
        Control.setCanvasWidthAndHeight(canvas.width / Control.getCanvasAspectRatio() * viewport.getAspectRatio(), canvas.height);
    }else if (viewport.getAspectRatio() < Control.getCanvasAspectRatio()){
        Control.setCanvasWidthAndHeight(canvas.width, canvas.height / Control.getCanvasAspectRatio() * viewport.getAspectRatio());
    }
}

Control.rayTrace = function(after_trace) {

    var img = context.getImageData(0, 0, canvas.width, canvas.height);

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

    const rows_per_draw = 1;
    // awful way of keeping track of state
    let row = 0;
    function animatedTrace() {
        for(;;){
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
            // hey I know it's a mess ok?
            if (++row < canvas.height) {
                if (row % rows_per_draw == 0) {
                    //
                    //createImageBitmap(img)
                    //    .then(response => {
                    //        context.drawImage(response,0,0);
                    //        window.requestAnimationFrame(animatedTrace);
                    //    })
                    //break;
                } else {
                    continue;
                }
            } else {
                context.putImageData(img, 0, 0);
                // absolutely disgusting hack because I don't know how to do promises
                return after_trace();
            }
        }
    }
    animatedTrace();
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

Control.downloadPhotonMap = function(){
    bootbox.prompt({
        title: "Seleccione tipo de mapa",
        inputType: 'select',
        inputOptions: [
            {
                text: 'Global',
                value: '1',
            },
            {
                text: 'Cáusticas',
                value: '2',
            }
        ],
        callback: function (result) {
            if (result == '1'){
                downloadFile("photon_global_map.json", JSON.stringify(Control.photonMapping.get_map(PhotonMapEnum.GLOBAL)));
            }else if (result == '2'){
                downloadFile("caustic_global_map.json", JSON.stringify(Control.photonMapping.get_map(PhotonMapEnum.CAUSTIC)));
            }
        }
    });
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
    PHOTON_MULTIMAP : "PMM",
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
                lights.push(l);
                break;
            case "square":
                var p1 = new Vector(config_light.points[0].x, config_light.points[0].y, config_light.points[0].z);
                var p2 = new Vector(config_light.points[1].x, config_light.points[1].y, config_light.points[1].z);
                var p3 = new Vector(config_light.points[2].x, config_light.points[2].y, config_light.points[2].z);
                l = new SquareLight(
                    new Color(config_light.color.r, config_light.color.g, config_light.color.b),
                    config_light.power, [p1, p2, p3]);
                if (config_light.visible){
                    Control.preloaded_shapes.push(new Triangle([p1,p3,p2],null,null,0,null,0,false,1,0,l));
                    Control.preloaded_shapes.push(new Triangle([p2,p3,p1.add(p2.subtract(p1)).add(p3.subtract(p1))],null,null,0,null,0,false,1,0,l));
                }
                lights.push(l);
                break;
        }
    }
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
                );
                break;
            case "model":
                s = new Model(
                    this.config.scene.loaded_models[config_shape.name],
                    null,
                    new Color(config_shape.diffuse_color.r, config_shape.diffuse_color.g, config_shape.diffuse_color.b),
                    config_shape.diffuse_reflection_coefficient,
                    new Color(config_shape.specular_color.r,config_shape.specular_color.g,config_shape.specular_color.b),
                    config_shape.specular_coefficient || 0,
                    config_shape.is_mirror || false,
                    config_shape.transparency || 0,
                    config_shape.refraction_coefficient || 0
                );
                break;
        }
        shapes.push(s);
    }
    return shapes;
}
