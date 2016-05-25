#pragma strict

function Start () {
	PauseCounter();
}

function PauseCounter () {
	for(var n : int = 0; n < 2; n++) {
		switch(n) {
		case 0: 
			yield WaitForSeconds(3);
			break;
		case 1:
			this.particleSystem.Pause();
			break;
		}
	}
}