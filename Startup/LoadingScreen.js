#pragma strict

var mySkin : GUISkin;

private var loadingText : LoadingText;
private var loadingMessage : GUIText;

private var charactersLoaded : boolean;

private var done : boolean;
private var finished : boolean;

private var playerData : PlayerData;
private var audioListener : AudioListener;

function Start () {
	DontDestroyOnLoad (this.gameObject);
	audioListener = this.GetComponent(AudioListener);
	this.camera.enabled = false;
	audioListener.enabled = false;
	
	charactersLoaded = false;
	finished = true;
	
	loadingText = GameObject.FindGameObjectWithTag("LoadingText").GetComponent(LoadingText);
	loadingMessage = GameObject.FindGameObjectWithTag("LoadingText").guiText;
	
	playerData = GameObject.FindGameObjectWithTag("Data").GetComponent(PlayerData);
}

//level to load, order in load
function Load (levelName : String, deadCamera : GameObject) {
	RenderSettings.fog = false;
	
	var gems : GameObject = GameObject.Find("Gems");
	var redGem : Transform = gems.transform.Find("RedGem");
	var blueGem : Transform = gems.transform.Find("BlueGem");
	var purpleGem : Transform = gems.transform.Find("PurpleGem");
	gems.transform.position.y = 100;	
	
	redGem.localPosition = Vector3(-3.5,0,10);
	blueGem.localPosition = Vector3(0,0,10);
	purpleGem.localPosition = Vector3(3.5,0,10);
	redGem.GetComponent(GemSpinner).isSpinning = true;
	blueGem.GetComponent(GemSpinner).isSpinning = true;
	purpleGem.GetComponent(GemSpinner).isSpinning = true;
	
	var stars : GameObject = GameObject.Find("Stars");
	stars.Find("Twinkle").particleSystem.Play();
	stars.transform.position.y = 100;
	stars.transform.position.z = 12;	
	
	done = false;
	finished = false;
	GameObject.Destroy(deadCamera);
	
	this.camera.enabled = true;
	audioListener.enabled = true;
	
	loadingText.Show();	
	
	
	//handles background loading between scenes
	if(levelName == "Characters")	{
		var titleText : GameObject = GameObject.Find("Title");
		var redGemDisplay : GameObject = GameObject.Find("RedGemDisplay");
		var blueGemDisplay : GameObject = GameObject.Find("BlueGemDisplay");
		var purpleGemDisplay : GameObject = GameObject.Find("PurpleGemDisplay");
		titleText.guiText.enabled = false;
		redGemDisplay.guiText.enabled = false;
		blueGemDisplay.guiText.enabled = false;
		purpleGemDisplay.guiText.enabled = false;
		
		if(!charactersLoaded)		{		LoadLevelWhenReady(levelName, true, true, "ChallengeSelect");		}
		else	{		LoadLevelWhenReady ("ChallengeSelect", true);		}
	}
	else if(levelName == "Battlefield")	{
		if(!playerData.fieldLoaded)		{
			LoadLevelWhenReady(levelName, true, true, "Challenge");
		}
		else		{
			LoadLevelWhenReady("Challenge", true);
		}
	}
	else	{
		LoadLevelWhenReady(levelName, true);
	}
}

function LoadLevelWhenReady (levelName : String, forcedDelay : boolean) {	LoadLevelWhenReady(levelName, forcedDelay, false, ""); }	
function LoadLevelWhenReady (levelName : String, forcedDelay : boolean, needsNext : boolean, nextLoad : String) {
	while(true) {
		if(forcedDelay) { forcedDelay = false; yield WaitForSeconds(0.5); }
		if (Application.CanStreamedLevelBeLoaded(levelName)) {
			if(levelName == "Challenge") { 
				var musicObject : GameObject = GameObject.Find("MenuMusic");
				if(musicObject.audio.isPlaying) {	musicObject.audio.Stop();	}
			} 
			Application.LoadLevel (levelName); 
			if(needsNext) {
				switch(levelName) {
				case "Characters":
					charactersLoaded = true;
					break;
				case "Battlefield":
					playerData.fieldLoaded = true;
					break;
				}
				loadingMessage.text = "Loading...99%";	
				Load(nextLoad, null);
				break;
			}
			else { done = true; break;}
		}			
		else {
			var percentageLoaded : int = Application.GetStreamProgressForLevel(levelName) * 100;
            var percentText : String = percentageLoaded.ToString();
			loadingMessage.text = "Loading..." + percentText + "%";		
			yield WaitForEndOfFrame();
		}	
	}
}

function LateUpdate()	{
	if(this.camera.enabled && done)	{
		if(finished)	{
			this.camera.enabled = false;
			audioListener.enabled = false;
			loadingText.Hide();
		}
		else	{
			finished = true;
		}
	}
}
