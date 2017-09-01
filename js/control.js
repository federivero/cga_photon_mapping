
var canvas = document.getElementById('photonMappingBox');
var context = canvas.getContext('2d');

var configuracion = null;

var Control = {};

Control.initialize = function(){
    Control.eraseCanvas();
    Control.canvasStartupMessage();
    Control.inicializarFileUpload();
	
	img = context.getImageData(0, 0, canvas.width, canvas.height);
	
	pos_camera = new Vector(0,0,0);
	viewport = {
		center: new Vector(0,0,10),
		width: 5,
		height: 5
	};
	
	pixel_size = {
		width: viewport.width / canvas.width,
		height: viewport.height / canvas.height
	}
	topleft = new Vector(
		viewport.center.x - viewport.width,
		viewport.center.y + viewport.height,
		viewport.center.z
	);
	
	let pixels = [];
	for (let i = 0; i < canvas.height; ++i) {
		for (let j = 0; j < canvas.width; ++j) {
			// pixels[i*j]
			pixels.push(new Vector(
				topleft.x + (j * pixel_size.width) + pixel_size.width / 2,
				topleft.y - (i * pixel_size.height) - pixel_size.height / 2,
				topleft.z
			));
		}
	}
	sphere = new Sphere(new Vector(0,0,15), 5);
	for (let i = 0; i < canvas.height; ++i) {
		for (let j = 0; j < canvas.width; ++j) {
			let current_pos = (i*canvas.width + j) * 4;
			if (sphere.collide([pos_camera, pixels[i*j]]).length > 0) {
				//console.log(sphere.collide([pos_camera, pixels[i*j]]));
				//console.log(current_pos);
				img.data[current_pos] = 255;
				img.data[current_pos + 1] = 0;
				img.data[current_pos + 2] = 70;
				img.data[current_pos + 3] = 0;
			} else {
				img.data[current_pos] = 0;
				img.data[current_pos + 1] = 0;
				img.data[current_pos + 2] = 0;
				img.data[current_pos + 3] = 255;
			}
		}
	}
	console.log(img);
	for (let i = 0; i < 8100; i+=4) {
		img.data[i+1] = 0;
		img.data[i+2] = 70;
		img.data[i+3] = 240;
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
