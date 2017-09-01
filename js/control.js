
var canvas = document.getElementById('photonMappingBox');
var context = canvas.getContext('2d');

var configuracion = null;

var Control = {};

Control.initialize = function(){
    Control.eraseCanvas();
    Control.canvasStartupMessage();
    Control.inicializarFileUpload();
	
	let img = context.getImageData(0, 0, canvas.width, canvas.height);
	
	let pos_camera = new Vector(0,0,0);
	let viewport = {
		center: new Vector(0,0,10),
		width: 10,
		height: 10
	};
	
	let pixel_size = {
		width: viewport.width / canvas.width,
		height: viewport.height / canvas.height
	}
	let topleft = new Vector(
		viewport.center.x - (viewport.width / 2),
		viewport.center.y + (viewport.height / 2),
		viewport.center.z
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

	sphere = new Sphere(new Vector(0, 0, 25), 3);
	for (let row = 0; row < canvas.height; ++row) {
		for (let col = 0; col < canvas.width; ++col) {
			let current_pos = (row*canvas.width + col) * 4;
			if (sphere.collide([pos_camera, pixels[row*canvas.width + col]]).length > 0) {
				img.data[current_pos] = 255;
				img.data[current_pos + 1] = 0;
				img.data[current_pos + 2] = 0;
				img.data[current_pos + 3] = 0;
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

Control.iniciarPhotonMapping = function(){
	
	var ok = controlarPrecondiciones();
	
	if (ok){
		// photonMappingManager.init ... 
	}
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
