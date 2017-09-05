
var canvas = document.getElementById('photonMappingBox');
var context = canvas.getContext('2d');

var configuracion = null;

var Control = {};

Control.initialize = function(){
    Control.eraseCanvas();
    Control.canvasStartupMessage();
    Control.inicializarFileUpload();
	Control.loadScene();
	Control.iniciarPhotonMapping();
	Control.rayTrace();
}

Control.clickLnkCargarArchivo = function(){
	document.getElementById('inputCargarArchivo').click();
}

Control.parsearConfiguracion = function(configuracionTxt){
	var configuracionJson = JSON.parse(configuracionTxt);

    // todo: controlar errores en el json

	configuracion = configuracionJson;
}

Control.eraseCanvas = function(){
    // setear los valores width y height borran la imagen del canvas!
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

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

Control.inicializarFileUpload = function(){
    $('#inputCargarArchivo').fileupload({
        // Función llamada al seleccionar un archivo nuevo
        add: function(e, data){
            var archivo = data.files[0];
            var lector = new FileReader();
            lector.readAsText(archivo);

            lector.onloadend = function(){
                var extension = "";

                var nombreArchivo = archivo.name;
                if (nombreArchivo.includes(".")){
                    extension = nombreArchivo.substring(nombreArchivo.lastIndexOf("."))
                }else{
                    $.notify("Archivo sin extensión", "error");
                    return;
                }
                if (EXTENSIONES_VALIDAS.indexOf(extension) == -1){
                    $.notify("Extensión inválida. Extensiones válidas: " + EXTENSIONES_VALIDAS, "error");
                    return;
                }
                var contenidoArchivo = lector.result;
                if (extension == EXTENSION_JSON){
                    parsearConfiguracion(contenidoArchivo);
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
            )
        ),
		new Sphere(
            new Transform(
                new Vector(3, 0, 20),
                null,
                new Vector(1, 1, 1)
            )
        )
	];
	let lights = [];
	let camera = new Vector(0,0,0)
	let viewport = {
		center: new Vector(0,0,10),
		width: 10,
		height: 10
	};
	Control.scene = new Scene(
		shapes,
		lights,
		camera,
		viewport
	);
}

Control.iniciarPhotonMapping = function(){

	var ok = Control.controlarPrecondiciones();

	if (ok){
		// photonMappingManager.init ...
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

	for (let row = 0; row < canvas.height; ++row) {
		for (let col = 0; col < canvas.width; ++col) {
            // from here onwards it's the Trace function, soon to be moved away
			let current_pos = (row*canvas.width + col) * 4;
			let found = false;
            let segment = new Vector();
            v1 = Control.scene.camera;
            v2 = pixels[row*canvas.width + col];
			Control.scene.shapes.forEach(function(shape){
                collisions = shape.collide([v1, v2]);
                collisions.forEach(function(current_collision) {
                    // for each collision, keep the closest point found yet
                    // check if the vector is on the right side of the camera
                    segment = Vector.substract(current_collision, v1, segment);
                    if segment.dot()
                    // TODO: you are here. line 210 of Shape.cpp

                });
				if (collisions.length > 0) {
					img.data[current_pos] = 200;
					img.data[current_pos + 1] = 0;
					img.data[current_pos + 2] = 100;
					img.data[current_pos + 3] = 255;
					found = true;
				}
			})
			if (!found) {
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
	if (configuracion == null){
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
