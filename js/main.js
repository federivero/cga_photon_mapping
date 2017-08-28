

var lastFrameTimeMs = 0;
var elapsedTime = 0;

function mainLoop(timestamp) {

	delta = timestamp - lastFrameTimeMs; 
	lastFrameTimeMs = timestamp;

	update(deltaInSeconds, elapsedTime);
    draw();
    requestAnimationFrame(mainLoop);
}


function update(delta, elapsedTime){

}

