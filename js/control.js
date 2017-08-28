
var canvas = document.getElementById('photonMappingBox');
var context = canvas.getContext('2d');

var configuracion = null;

function inicializar(){

    borrarCanvas();
    mensajeInicialCanvas();
    inicializarFileUpload();
}

function clickLnkCargarArchivo(){
	document.getElementById('inputCargarArchivo').click();
}

function parsearConfiguracion(configuracionTxt){
	var configuracionJson = JSON.parse(configuracionTxt);

    // todo: controlar errores en el json

	configuracion = configuracionJson;
}

function borrarCanvas(){
    // setear los valores width y height borran la imagen del canvas!
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;   
}

function mensajeInicialCanvas(){
    context.font = "24px Verdana";
    context.fillStyle = "black";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText("Próximamente: imagen de photon mapping", canvas.width / 2, canvas.height / 2);
}

function inicializarFileUpload(){
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
function iniciarPhotonMapping(){
	
	var ok = controlarPrecondiciones();
	
	if (ok){
		// photonMappingManager.init ... 
	}
}

function controlarPrecondiciones(){
	if (configuracion == null){
		$.notify('Falta cargar la configuracion','warn');
		return false;
	}

	return true;
}


