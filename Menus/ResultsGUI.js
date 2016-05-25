#pragma strict

private var windowHeight : int;
private var windowWidth : int;
private var windowX : int;
private var windowY : int;
private var windowRect : Rect;
private var scrollPosition : Vector2;
private var padding: int;
private var buttonSize: int;

//private var gemText : String;
private var difficultyText : String;
private var characterText : String;
private var opponentText : String;
private var killsText : String;
private var deathsText : String;
private var levelText : String;

var mySkin : GUISkin;

private var playerData : PlayerData;
private var unitData : UnitData;
private var loadingScreen : LoadingScreen;

private var guiMatrix : Matrix4x4;

private var buttonPressSound : AudioSource;

function Awake () {
	var musicObject : GameObject = GameObject.Find("MenuMusic");
	if(!musicObject.audio.isPlaying && !playerData.musicMuted) {	musicObject.audio.volume = playerData.musicVolume/100.0; musicObject.audio.Play();	}
	playerData = GameObject.FindGameObjectWithTag("Data").GetComponent(PlayerData);
	unitData = GameObject.FindGameObjectWithTag("Data").GetComponent(UnitData);
	loadingScreen = GameObject.FindGameObjectWithTag("LoadingScreen").GetComponent(LoadingScreen);
	
	var gems : GameObject = GameObject.Find("Gems");
	var redGem : Transform = gems.transform.Find("RedGem");
	var blueGem : Transform = gems.transform.Find("BlueGem");
	var purpleGem : Transform = gems.transform.Find("PurpleGem");
	gems.transform.position.y = 105;	
	
	switch(playerData.gemEarned) {
	case 0:
		redGem.localPosition = Vector3(100,0,0);
		blueGem.localPosition = Vector3(100,0,0);
		purpleGem.localPosition = Vector3(100,0,0);
		break;
	case 1:
		redGem.GetComponent(GemSpinner).isSpinning = true;
		redGem.localPosition = Vector3(0,0,0);
		blueGem.localPosition = Vector3(100,0,0);
		purpleGem.localPosition= Vector3(100,0,0);
		break;
	case 2:
		blueGem.GetComponent(GemSpinner).isSpinning = true;
		redGem.localPosition = Vector3(100,0,0);
		blueGem.localPosition = Vector3(0,0,0);
		purpleGem.localPosition = Vector3(100,0,0);
		break;
	case 3:
		purpleGem.GetComponent(GemSpinner).isSpinning = true;
		redGem.localPosition = Vector3(100,0,0);
		blueGem.localPosition = Vector3(100,0,0);
		purpleGem.localPosition = Vector3(0,0,0);
		break;
	}
	
	var stars : GameObject = GameObject.Find("Stars");
	stars.Find("Twinkle").particleSystem.Play();
	stars.transform.position.y = 100;
	stars.transform.position.z = 0;
	
	padding = 8;
		
	windowHeight = 492;
	windowWidth = 792;
	windowX = 4;
    windowY = 87;
	
	windowRect = Rect (windowX, windowY, windowWidth, windowHeight);	
	buttonSize = 160;
	
	buttonPressSound = GameObject.Find("MenuButtonPressedSound").audio;
}

function Start (){
	//gemText = "Gem Earned : " + unitData.gemNames[playerData.gemEarned];
	difficultyText = unitData.difficultyNames[playerData.difficultySelected];
	characterText = unitData.characterNames[playerData.characterSelected];
	opponentText = unitData.characterNames[playerData.opponentSelected];
	killsText = "" + playerData.finalKills;
	deathsText = "" + playerData.finalDeaths;
	levelText = "" + playerData.finalLevel;
}

function SetMatrix () {
	if(Camera.main) {
		//min 60%, max 100%
		var scaleX : float = Camera.main.pixelWidth / 800;
		var scaleY : float = Camera.main.pixelHeight / 600;
		var scale : Vector3 = Vector3(scaleX, scaleY, 1);
		guiMatrix.SetTRS(Vector3.one, Quaternion.identity, scale);
	}
}

function OnGUI () {
	GUI.skin = mySkin;
	SetMatrix();	
	GUI.matrix = guiMatrix;	
	windowRect = GUI.Window (0, windowRect, DoMyWindow, "");
}

function DoMyWindow (windowID : int) {
		GUILayout.BeginVertical();
		GUILayout.Space(8);
		GUILayout.Label("", "Divider");
		
		GUILayout.BeginHorizontal();
		GUILayout.FlexibleSpace();
		if(playerData.gemEarned > 0)		{
        	GUILayout.Label("Victory");
		}
		else		{
			GUILayout.Label("Defeat");
		}
		GUILayout.FlexibleSpace();
		GUILayout.EndHorizontal();
		
		GUILayout.BeginHorizontal();
		GUILayout.FlexibleSpace();
		var minutes : int = playerData.finalClock / 60;
 	  	var seconds : int = playerData.finalClock % 60;
		var gameClockText : String = String.Format ("{0:00} : {1:00}", minutes, seconds);
		GUILayout.Box(gameClockText, "LegendaryText");
		GUILayout.FlexibleSpace();
		GUILayout.EndHorizontal();
		GUILayout.FlexibleSpace();
		
		GUILayout.BeginHorizontal();
		GUILayout.FlexibleSpace();
		scrollPosition = GUILayout.BeginScrollView(scrollPosition, false, false);		
		GUILayout.BeginHorizontal();
		GUILayout.FlexibleSpace();
		GUILayout.BeginVertical();
		GUILayout.Label("Character");
		GUILayout.BeginHorizontal();
		GUILayout.FlexibleSpace();
		GUILayout.Box(characterText, "LegendaryText");
		GUILayout.FlexibleSpace();
		GUILayout.EndHorizontal();
		GUILayout.EndVertical();
		GUILayout.FlexibleSpace();
		GUILayout.BeginVertical();
		GUILayout.Label("Level");
		GUILayout.BeginHorizontal();
		GUILayout.FlexibleSpace();
		GUILayout.Box(levelText, "LegendaryText");
		GUILayout.FlexibleSpace();
		GUILayout.EndHorizontal();
		GUILayout.EndVertical();
		GUILayout.FlexibleSpace();
		GUILayout.BeginVertical();
		GUILayout.Label("Kills");
		GUILayout.BeginHorizontal();
		GUILayout.FlexibleSpace();
		GUILayout.Box(killsText, "LegendaryText");
		GUILayout.FlexibleSpace();
		GUILayout.EndHorizontal();
		GUILayout.EndVertical();
		GUILayout.FlexibleSpace();
		GUILayout.BeginVertical();
		GUILayout.Label("Deaths");
		GUILayout.BeginHorizontal();
		GUILayout.FlexibleSpace();
		GUILayout.Box(deathsText, "LegendaryText");
		GUILayout.FlexibleSpace();
		GUILayout.EndHorizontal();
		GUILayout.EndVertical();
		GUILayout.FlexibleSpace();
		GUILayout.EndHorizontal();
		
		GUILayout.Label("", "PlainText");
//		GUILayout.BeginHorizontal();
//		GUILayout.FlexibleSpace();
//		GUILayout.Box(gemText);
//		GUILayout.FlexibleSpace();
//		GUILayout.EndHorizontal();
		
		GUILayout.FlexibleSpace();
		GUILayout.FlexibleSpace();;
		GUILayout.BeginHorizontal();

		GUILayout.FlexibleSpace();
		GUILayout.BeginVertical();
		GUILayout.Label(difficultyText);
		GUILayout.BeginHorizontal();
		GUILayout.FlexibleSpace();
		GUILayout.Box(opponentText, "CursedText");
		GUILayout.FlexibleSpace();
		GUILayout.EndHorizontal();
		GUILayout.EndVertical();
		GUILayout.FlexibleSpace();
		GUILayout.EndVertical();
		
		GUILayout.FlexibleSpace();
		GUILayout.EndScrollView();
		GUILayout.FlexibleSpace();
		GUILayout.EndHorizontal();
		
		GUILayout.FlexibleSpace();
		
		GUILayout.BeginHorizontal();	
		if(GUILayout.Button("Main Menu", GUILayout.Width(buttonSize)))		{
			playerData.characterDone = false;
			playerData.viewing = false;
			playerData.difficultyDone = false;
			loadingScreen.Load("MainMenu", this.gameObject);
			if(!playerData.effectMuted) { buttonPressSound.Play(); }
		}
		GUILayout.Label("", "Divider");

		if(GUILayout.Button("Challenge Select", GUILayout.Width(buttonSize)))		{
			loadingScreen.Load("ChallengeSelect", this.gameObject);
			if(!playerData.effectMuted) { buttonPressSound.Play(); }
		}
		GUILayout.Label("", "Divider");
		if(GUILayout.Button("Replay", GUILayout.Width(buttonSize)))		{
			loadingScreen.Load("Challenge", this.gameObject);
			if(!playerData.effectMuted) { buttonPressSound.Play(); }
		}
		GUILayout.EndHorizontal();
		GUILayout.EndHorizontal();		
}
