#pragma strict
import System.Collections.Generic;
		
private var windowHeight : int;
private var windowWidth : int;
private var windowX : int;
private var windowY : int;
private var windowRect : Rect;
private var mouseRect : Rect;
private var askRect : Rect;
private var scrollPosition : Vector2;

var settingsGUI : SettingsGUI;
var helpGUI : HelpGUI;
var mySkin : GUISkin;

private var playerData : PlayerData;
private var battlefieldGUI : BattlefieldGUI;
private var gameController : GameController;
private var unitData : UnitData;
private var loadingScreen : LoadingScreen;

private var challengeNumber : int;

private var mouseOff : boolean;
private var quitting : boolean;

static private var mousePosX : int;
static private var mousePosY : int;

static private var minimap : GameObject;

static var cameraPosition : Vector3;
var asking : boolean;
var nextLoad : String;
var nextLoadType : int;

var gems : GameObject;
var redGem : Transform;
var blueGem : Transform;
var purpleGem : Transform;

private var guiMatrix : Matrix4x4;	

private var buttonPressSound : AudioSource;

private var skills : Skills;
private var opponentSkills : OpponentSkills;

function Awake ()	{	
	playerData = GameObject.FindGameObjectWithTag("Data").GetComponent(PlayerData);
	
	gameController = GameObject.FindGameObjectWithTag("GameController").GetComponent(GameController);
	battlefieldGUI = this.GetComponent(BattlefieldGUI);
	unitData = GameObject.FindGameObjectWithTag("Data").GetComponent(UnitData);
	loadingScreen = GameObject.FindGameObjectWithTag("LoadingScreen").GetComponent(LoadingScreen);
	gems = GameObject.Find("Gems");
	redGem = gems.transform.Find("RedGem");
	blueGem = gems.transform.Find("BlueGem");
	purpleGem = gems.transform.Find("PurpleGem");
	
	mouseOff = false;
	quitting = false;
	asking = false;
	
	minimap = GameObject.FindGameObjectWithTag("Minimap");	
	
	windowHeight = 405;
	windowWidth = 400;
	windowX = 200;
	windowY = 108;
	windowRect = Rect (windowX, windowY, windowWidth, windowHeight);
	var shortY : float = 184;
	var shortX : float = 267; //(camera.pixelWidth/2.0) - ((windowWidth*2/3.0)/2);
	mouseRect = Rect (shortX, shortY, 266, 232);
	askRect = Rect (shortX, shortY, 266, 232);
	
	buttonPressSound = GameObject.Find("MenuButtonPressedSound").audio;
	
	skills = GameObject.FindGameObjectWithTag("GameController").GetComponent(Skills);	
	opponentSkills = GameObject.FindGameObjectWithTag("GameController").GetComponent(OpponentSkills);	
}

function Start (){
	playerData.gemEarned = 0;
	challengeNumber = (playerData.characterSelected * 20) + (playerData.difficultySelected * 4) + playerData.opponentSelected;
	
	minimap.camera.enabled = true;
	minimap.transform.Find("Background").guiTexture.enabled = true;
}

function Update () {
	if(!gameController.gameOver) {
		if(Input.GetKeyDown(playerData.keySettings[17]))	{
			if(!gameController.paused)		{		Pause();		}
			else if(!playerData.settingKey && !mouseOff)		{			
				Unpause();
			}
			if(!playerData.effectMuted) { buttonPressSound.Play(); }
		}	
		
		//pause if the mouse is off screen
		mousePosX = Input.mousePosition.x; 
		mousePosY = Input.mousePosition.y; 
		//if mouse off screen
		if (!mouseOff && (mousePosX < 0 || mousePosX > camera.pixelWidth || mousePosY < 0 || mousePosY > camera.pixelHeight) && !gameController.paused)	{
			mouseOff = true;
			Pause();
		}
		//else if mouse on screen
		else if(mouseOff && (mousePosX > 0 && mousePosX < camera.pixelWidth && mousePosY > 0 && mousePosY < camera.pixelHeight) && gameController.paused)	{
			mouseOff = false;
			Unpause();
		}	
	}
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
		
	if(playerData.helpOpen)	{ GUI.matrix = guiMatrix;	helpGUI.Open();	}
	else if(playerData.settingsOpen)	{	GUI.matrix = guiMatrix;	 settingsGUI.Open();	}
	else if(mouseOff && gameController.paused)	{	GUI.matrix = guiMatrix;	 mouseRect = GUILayout.Window (0, mouseRect, DoMouseWindow, "");	}
	else if(asking) { GUI.matrix = guiMatrix;	 askRect = GUILayout.Window (1, askRect, DoAskWindow, "");	}
	else if(gameController.paused)	{	GUI.matrix = guiMatrix;	 windowRect = GUILayout.Window (2, windowRect, DoMyWindow, "");	}	
}

function DoAskWindow (windowID : int) {
	GUILayout.BeginVertical();
	GUILayout.Space(8);
	GUILayout.Label("", "Divider");
	GUILayout.Label("ARE YOU SURE?");
	GUILayout.FlexibleSpace();
	if(GUILayout.Button("Yes"))		{
		LoadNext(nextLoadType);
		if(!playerData.effectMuted) { buttonPressSound.Play(); }
	}
	if(GUILayout.Button("No"))		{
		quitting = false;
		asking = false;
		if(!playerData.effectMuted) { buttonPressSound.Play(); }
	}
	GUILayout.FlexibleSpace();
	GUILayout.EndVertical();
}

function DoMyWindow (windowID : int) {
	GUILayout.BeginVertical();
	GUILayout.Space(8);
	GUILayout.Label("", "Divider");
	if(quitting)	{
		GUILayout.Label("QUIT");
		scrollPosition = GUILayout.BeginScrollView(scrollPosition, false, false);
		GUILayout.FlexibleSpace();
		if(GUILayout.Button("Main Menu"))		{
			AreYouSure(2, "MainMenu");
			if(!playerData.effectMuted) { buttonPressSound.Play(); }
		}
		if(GUILayout.Button("Challenge Select"))		{
			AreYouSure(2, "ChallengeSelect");
			if(!playerData.effectMuted) { buttonPressSound.Play(); }
		}
		if(GUILayout.Button("Results"))		{
			AreYouSure(1);
			if(!playerData.effectMuted) { buttonPressSound.Play(); }
		}
		
		if(GUILayout.Button("Cancel"))		{		quitting = false;	if(!playerData.effectMuted) { buttonPressSound.Play(); }	}
		GUILayout.FlexibleSpace();
	}
	else	{
		GUILayout.Label("PAUSE");				
		GUILayout.FlexibleSpace();
		scrollPosition = GUILayout.BeginScrollView(scrollPosition, false, false);
		ChallengeInfo();
		if(GUILayout.Button("Resume"))		{	Unpause ();	if(!playerData.effectMuted) { buttonPressSound.Play(); }	}
		if(GUILayout.Button("Help"))		{		playerData.helpOpen = true;		if(!playerData.effectMuted) { buttonPressSound.Play(); }}
		if(GUILayout.Button("Settings"))		{		playerData.settingsOpen = true;	if(!playerData.effectMuted) { buttonPressSound.Play(); }	}
			
		if(GUILayout.Button("Restart Challenge"))		{
			AreYouSure(0);
			if(!playerData.effectMuted) { buttonPressSound.Play(); }
		}
		if(GUILayout.Button("Quit"))	{		quitting = true;	if(!playerData.effectMuted) { buttonPressSound.Play(); }	}
	}
	GUILayout.EndScrollView();
	GUILayout.FlexibleSpace();
	GUILayout.EndVertical();		
}

function LoadChallenge () {
	for(;;) {
		if(Application.CanStreamedLevelBeLoaded("Challenge")) {
			RenderSettings.fog = false;
			Application.LoadLevel("Challenge");
			break;
		}
		else {
			yield WaitForFixedUpdate();
		}
	}
}

function DoMouseWindow (windowID : int){
	GUILayout.BeginVertical();
	GUILayout.Space(8);
	GUILayout.Label("", "Divider");	
	GUILayout.Label("PAUSE");
	GUILayout.FlexibleSpace();
	GUILayout.Box("MOUSE OFF GAME SCREEN");
	GUILayout.FlexibleSpace();
	GUILayout.FlexibleSpace();
	GUILayout.EndVertical();
}

function ChallengeInfo () {
	GUILayout.BeginVertical();
	GUILayout.FlexibleSpace();
	
//	GUILayout.BeginHorizontal();
//	GUILayout.FlexibleSpace();
//	GUILayout.Box(unitData.difficultyNames[playerData.difficultySelected], "LegendaryText");
//	GUILayout.FlexibleSpace();
//	GUILayout.EndHorizontal();	
	
	var minutes : int = gameController.gameClock / 60;
   	var seconds : int = gameController.gameClock % 60;
   	var secondsText : String = "" + seconds;
   	if(seconds < 10) {  secondsText = "0" + secondsText; }
   	var gameClockText : String = "" + minutes + " : " + secondsText;
   	
	GUILayout.BeginHorizontal();
	GUILayout.FlexibleSpace();
	GUILayout.Box("Time ", "CursedText", GUILayout.Width(35));
	GUILayout.Box(gameClockText, "PlainText", GUILayout.Width(45));
	
	GUILayout.FlexibleSpace();
	GUILayout.BeginHorizontal();
	GUILayout.FlexibleSpace();
	GUILayout.Box(unitData.difficultyNames[playerData.difficultySelected], "BoldOutlineText");
	GUILayout.FlexibleSpace();
	GUILayout.EndHorizontal();	
	GUILayout.FlexibleSpace();	
	
	var challengeNumber : int = (playerData.characterSelected * 20) + (playerData.difficultySelected * 4) + playerData.opponentSelected;
	if(playerData.gems[challengeNumber] > 0) {
		minutes = playerData.challengeTimes[challengeNumber] / 60;
	  	seconds = playerData.challengeTimes[challengeNumber] % 60;
	  	secondsText = "" + seconds;
		if(seconds < 10) {  secondsText = "0" + secondsText; }
		var timeString : String = "" + minutes + " : " + secondsText;			
		GUILayout.Box("Best ", "LegendaryText", GUILayout.Width(35));	
		GUILayout.Box(timeString, "PlainText", GUILayout.Width(45));		
	}
	else {
		GUILayout.Space(80);	
	}
	
	GUILayout.FlexibleSpace();
	GUILayout.EndHorizontal();	
	
	GUILayout.FlexibleSpace();
	
	GUILayout.BeginHorizontal();
	GUILayout.FlexibleSpace();
	GUILayout.BeginHorizontal(GUILayout.Width(80));
	GUILayout.FlexibleSpace();
	GUILayout.Box(unitData.characterNames[playerData.characterSelected], "ItalicText");
	GUILayout.FlexibleSpace();
	GUILayout.EndHorizontal();
	GUILayout.FlexibleSpace();
	GUILayout.Box(" VS \0", "BoldText");
	GUILayout.FlexibleSpace();
	GUILayout.BeginHorizontal(GUILayout.Width(80));
	GUILayout.FlexibleSpace();
	GUILayout.Box(unitData.characterNames[playerData.opponentSelected], "ItalicText");
	GUILayout.FlexibleSpace();
	GUILayout.EndHorizontal();
	GUILayout.FlexibleSpace();
	GUILayout.EndHorizontal();
	
	GUILayout.FlexibleSpace();
	GUILayout.EndVertical();
}

function Pause () {	
	PauseSoundEffects();
	minimap.camera.enabled = false;
	minimap.transform.Find("Background").guiTexture.enabled = false;	
	gameController.paused = true;
	cameraPosition = transform.position;
	transform.position = Vector3(0,-100,0);
	transform.rotation = Quaternion.Euler(0,0,0);
	Camera.main.isOrthoGraphic = true;
	Time.timeScale = 0;	 
}

function Unpause (){
	quitting = false;
	asking = false;
	playerData.settingsOpen = false;
	playerData.helpOpen = false;
	battlefieldGUI.Refresh();
	transform.position = cameraPosition;
	minimap.camera.enabled = true;
	minimap.transform.Find("Background").guiTexture.enabled = true;
	gameController.paused = false;
	transform.rotation = Quaternion.Euler(60,0,0);
	Camera.main.isOrthoGraphic = false;
	Time.timeScale = 1;
	ResumeSoundEffects();
}

function AreYouSure (loadType : int) { AreYouSure(loadType, ""); }
function AreYouSure (loadType : int, loadString : String) {
	nextLoadType = loadType;
	nextLoad = loadString;
	asking = true;	
}

//types = 0:restart, 1:results, 2:nextLoad
function LoadNext (type : int) {
	Time.timeScale = 1;
	switch(type) {
	case 0:
		LoadChallenge();
		break;
	case 1:
		gameController.EndGame(false, true);
		break;
	case 2:
		if(nextLoad == "MainMenu") {
			playerData.characterDone = false;
			playerData.viewing = false;
			playerData.difficultyDone = false;
		}
		loadingScreen.Load(nextLoad, this.gameObject);
		break;		
	}
}

var soundEffectsPlaying : List.<AudioSource>;

function PauseSoundEffects () {
	soundEffectsPlaying = new List.<AudioSource>();
	for(var soundEffect in gameController.soundEffects) { 				
		if(soundEffect != null && soundEffect.isPlaying) {  soundEffectsPlaying.Add(soundEffect);  soundEffect.Pause();}
	}
	for(soundEffect in gameController.attackSoundEffects) { 
		if(soundEffect != null && soundEffect.isPlaying) {  soundEffectsPlaying.Add(soundEffect);  soundEffect.Pause();}
	}
	for(soundEffect in gameController.deathSoundEffects) { 
		if(soundEffect != null && soundEffect.isPlaying) {  soundEffectsPlaying.Add(soundEffect);  soundEffect.Pause();}
	}
	for(soundEffect in gameController.teleportSoundEffects) { 
		if(soundEffect != null && soundEffect.isPlaying) {  soundEffectsPlaying.Add(soundEffect);  soundEffect.Pause();}
	}
	for(soundEffect in skills.skillSoundEffects) { 
		if(soundEffect != null && soundEffect.isPlaying) {  soundEffectsPlaying.Add(soundEffect);  soundEffect.Pause();}
	}
	for(soundEffect in skills.runtSoundEffects) { 
		if(soundEffect != null && soundEffect.isPlaying) {  soundEffectsPlaying.Add(soundEffect);  soundEffect.Pause();}
	}
	for(soundEffect in opponentSkills.skillSoundEffects) { 
		if(soundEffect != null && soundEffect.isPlaying) {  soundEffectsPlaying.Add(soundEffect);  soundEffect.Pause();}
	}
	for(soundEffect in opponentSkills.runtSoundEffects) { 
		if(soundEffect != null && soundEffect.isPlaying) {  soundEffectsPlaying.Add(soundEffect);  soundEffect.Pause();}
	}
}

function ResumeSoundEffects () {
	for(var soundEffect in soundEffectsPlaying) {
		soundEffect.Play();
	}
}
