#pragma strict
var titleAlpha : float;
var titleY : float;
var gemY : float;

var gemTransform : Transform;
var redGem : Transform;
var blueGem : Transform;
var purpleGem : Transform;

var pixelOff : Vector2;
var origTextSize : int;

private var playerData : PlayerData;

function Awake () {
	titleAlpha = 0;
	titleY = 0.5;
	gemY = -8;
	
	gemTransform = GameObject.Find("Gems").transform;
	playerData = GameObject.FindGameObjectWithTag("Data").GetComponent(PlayerData);
	
	pixelOff = guiText.pixelOffset;
	origTextSize = guiText.fontSize;
}

function Start () {		
	redGem = gemTransform.transform.Find("RedGem");
	blueGem = gemTransform.transform.Find("BlueGem");
	purpleGem = gemTransform.transform.Find("PurpleGem");
	redGem.GetComponent(GemSpinner).isSpinning = true;
	blueGem.GetComponent(GemSpinner).isSpinning = true;
	purpleGem.GetComponent(GemSpinner).isSpinning = true;
	redGem.localPosition = Vector3(-3.5,0,0);
	blueGem.localPosition = Vector3(0,0,0);
	purpleGem.localPosition = Vector3(3.5,0,0);
	
	if(playerData.firstTitleLoad) {
		playerData.firstTitleLoad = false;
		StartAnimations();
	}
	else {
		QuickStart();
	}
}

function Update () {
	if(Camera.main) {
//		var scaleX : float = Camera.main.pixelWidth / 800;
		var scaleY : float = Camera.main.pixelHeight / 600;
//		guiText.pixelOffset = new Vector2(pixelOff.x*scaleX, pixelOff.y*scaleY);
		guiText.fontSize = origTextSize * scaleY;	
		
		redGem.position.x = Camera.main.ViewportToWorldPoint(Vector3(0.275,0.65,10)).x;
		//redGem.position = redGem.InverseTransformPoint(Camera.main.ScreenToViewportPoint(Vector3(0.3,0,0)));
//		blueGem.localPosition = Vector3(0,0,0);
		//purpleGem.position = purpleGem.InverseTransformPoint(Camera.main.ScreenToViewportPoint(Vector3(0.7,0,0)));
		purpleGem.position.x = Camera.main.ViewportToWorldPoint(Vector3(0.725,0.65,10)).x;
	}	
}

function StartAnimations () {
	for(var n : int = 0; n < 3; n++) {
		switch(n) {
		case 0: 
			yield WaitForSeconds(0.5);
			break;
		case 1:
			//start starlight and twinkle
			GameObject.Find("Stars").Find("Main").particleSystem.Play();
			GameObject.Find("Stars").Find("Twinkle").particleSystem.Play();	
			var titleMusic : AudioSource = GameObject.Find("TitleMusic").audio;
			if(!playerData.musicMuted) {
				titleMusic.volume = 0.01;	
				titleMusic.Play();	
				MenuMusicVolume(titleMusic, 0.25);
			}
			//animate minions
			yield WaitForSeconds(1);
			break;
		case 2: 			
			//fade in title
			FadeTitle();
			break;
		}
	}
}

function FadeTitle () {
	for(;;) {
		if(titleAlpha >= .8) { RaiseTitle(); GameObject.Find("Stars").Find("Main").particleSystem.Pause(); break; }
		else { 
			titleAlpha += 0.005; 
			guiText.color = Color(1,1,1,titleAlpha);
			yield WaitForFixedUpdate(); 
		}
	}
}

//raise title and gems
function RaiseTitle () {
	for(;;) {
		if(titleY >= 0.8) { DelayMenu(); break; }//gem 7
		else { 
			titleY += 0.002; 
			gemY += 0.074;
			transform.position.y = titleY;
			gemTransform.position.y = gemY;
			yield WaitForFixedUpdate(); 
		}
	}
}
 
function DelayMenu () {
	for(var n : int = 0; n < 2; n++) {
		switch(n) {
		case 0:
			var titleMusic : AudioSource = GameObject.Find("TitleMusic").audio;
			MuteMusicVolume(titleMusic, 0.2);
			yield WaitForSeconds(1.5);
			break;
		case 1:
			//flash screen
			Camera.main.GetComponent(MainMenuGUI).isReady = true;
			var musicSource : AudioSource = GameObject.Find("MenuMusic").audio;
			if(!playerData.musicMuted) {
				musicSource.volume = 0.2;
				musicSource.Play();	
				MenuMusicVolume(musicSource, 0.1);
			}
			break;
		}
	}
}

function MenuMusicVolume (musicSource : AudioSource, speedFloat : float) {
	while(musicSource.volume < playerData.musicVolume/100.0) {
		musicSource.volume += speedFloat * Time.deltaTime;
		yield;
	}
}

function MuteMusicVolume (musicSource : AudioSource, speedFloat : float) {
	while(musicSource.volume > 0) {
		musicSource.volume -= speedFloat * Time.deltaTime;
		yield;
	}
}

function QuickStart () {
	var stars : GameObject = GameObject.Find("Stars");
	var bushes : GameObject[] = GameObject.FindGameObjectsWithTag("Bush");
	for(var bush in bushes) { bush.renderer.material.SetColor("_Color", Color.gray); }
	if(playerData.fieldLoaded) {
		stars.transform.position.y = 10;
	}
	else { stars.transform.position.y = 0.5; }
	stars.transform.position.z = 0;
	stars.Find("Twinkle").particleSystem.Play();
	guiText.color = Color(1,1,1,0.8);
	transform.position.y = 0.8;
	gemTransform.position.y = 3.137;
	Camera.main.GetComponent(MainMenuGUI).isReady = true;
	var musicObject : GameObject = GameObject.Find("MenuMusic");
	if(!musicObject.audio.isPlaying && !playerData.musicMuted) {	musicObject.audio.Play();	}
	
	//show numbers
}