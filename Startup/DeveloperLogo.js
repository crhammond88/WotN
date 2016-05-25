#pragma strict
var coverHeight : float = 0.145;
var coverY : float = 0.425;

var rain : Transform;
var stems : Transform;
var groundCover : Transform;

var coverCamera : Camera;

var pixelOff : Vector2;
var origTextSize : int;

private var playerData : PlayerData;
 
function Awake() {
	Application.runInBackground = true;
	Time.timeScale = 1;	
	
	pixelOff = guiText.pixelOffset;
	origTextSize = guiText.fontSize;
	
	playerData = GameObject.FindGameObjectWithTag("Data").GetComponent(PlayerData);	
}

function Start () {	StartAnimations(); }

function Update () {
	if(Camera.main) {
		//var scaleX : float = Camera.main.pixelWidth / 800;
		var scaleY : float = Camera.main.pixelHeight / 600;	
//		guiText.pixelOffset = new Vector2(pixelOff.x*scaleX, pixelOff.y*scaleY);
		guiText.fontSize = origTextSize * scaleY;	
	}
}

function StartAnimations ()	{
	for(var n : int = 0; n < 5; n++) {
		switch(n) {
		case 0:
			yield WaitForSeconds(1.5);
			break;
		case 1:		
			rain.particleSystem.Play();	
			if(!playerData.effectMuted) {
				rain.audio.Play();
				RainVolume(rain.audio);	
			}	
			yield WaitForSeconds(0.5);
			break;
		case 3:			
			groundCover.particleSystem.Play();
			stems.particleSystem.Play();
			yield WaitForSeconds(1.9);
			break;
		case 4:
			stems.particleSystem.Pause();			
			Uncover();
			yield WaitForSeconds(1.5);
			break;
		}
	}
}

function RainVolume (rainSound : AudioSource) {
	while(rainSound.volume < 1*playerData.musicVolume/100.0) {
		rainSound.volume += 0.3 * Time.deltaTime;
		yield;
	}
}

function Uncover () {
	for(;;) {
		if(coverHeight < 0.04) {
			coverCamera.cullingMask = 1 << 0;
		}
		if(coverHeight < 0) {
			groundCover.particleSystem.Pause();
			coverCamera.enabled = false;
			TitleBuffer();
			break;
		}
		coverHeight -= 0.002;
		coverY += 0.002;
		coverCamera.rect = Rect(0, coverY, 1, coverHeight);
		if(coverCamera.fieldOfView > 0.13237) {
			coverCamera.fieldOfView -= 0.13238;//0.145,0.425//9.6
		}
		else { coverCamera.fieldOfView = 0; }
		yield WaitForFixedUpdate();
	}
}

function TitleBuffer () {
	for(var n : int = 0; n < 2; n++) {
		switch(n) {
		case 0:
			yield WaitForSeconds(1.5);
			break;
		case 1:
			LoadTitle();
			break;
		}
	}	
}		
		
function LoadTitle () {
	for(;;) {
		if(Application.CanStreamedLevelBeLoaded("MainMenu")) {
			Application.LoadLevel("MainMenu");
			break;
		}
		else {	yield;	}
	}
}