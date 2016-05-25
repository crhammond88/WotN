#pragma strict

private var windowHeight : float;
private var windowWidth : float;
private var windowX : float;
private var windowY : float;
private var windowRect : Rect;
private var askRect : Rect;
private var creditsWindow : Rect;
private static var scrollPosition : Vector2[];
private static var gemWidth : float;
private static var buttonWidth : float;

var mySkin : GUISkin;
var isReady : boolean;
var creditsOpen : boolean;

//private static var redGemsMain : int;
//private static var blueGemsMain : int;
//private static var purpleGemsMain : int;

var settingsGUI : SettingsGUI;
var helpGUI : HelpGUI;
private var playerData : PlayerData;
private var loadingScreen : LoadingScreen;

private var guiMatrix : Matrix4x4;	

private var buttonPressSound : AudioSource;
private var buttonHoverSound : AudioSource;

private var tooltipString : String;
private var lastTooltip : String;
var hoverSoundPlayed : boolean;

function Awake ()	{	
	isReady = false;
	creditsOpen = false;
	playerData = GameObject.FindGameObjectWithTag("Data").GetComponent(PlayerData);
	loadingScreen = GameObject.FindGameObjectWithTag("LoadingScreen").GetComponent(LoadingScreen);
	
	scrollPosition = new Vector2[2];
	gemWidth = 115; //camera.pixelWidth/7.0;
	buttonWidth = 160; //camera.pixelWidth/5.0;
	
	windowHeight = 300; //camera.pixelHeight/3.0*2;
	windowWidth = 400; //camera.pixelWidth/2.0;
	
	windowX = 200;//(camera.pixelWidth/2.0) - (windowWidth/2);
    windowY = 250;//(camera.pixelHeight/1.5) - (windowHeight/2);
    
	var shortY : float = 300;
	var shortX : float = 250;
	windowRect = Rect (windowX, windowY, windowWidth, windowHeight);	
	askRect = Rect (shortX, shortY, 300, 232);
	creditsWindow = Rect (8, 0, 784, 600);	
	
	tooltipString = "";
	lastTooltip = "";
	
	hoverSoundPlayed = true;
	
	buttonPressSound = GameObject.Find("MenuButtonPressedSound").audio;
	buttonPressSound.volume = playerData.effectVolume/100.0;
}

function SetMatrix () {
	if(Camera.main) {
		//min 60%, max 100%
		var scaleX : float = Camera.main.pixelWidth / 800;
		var scaleY : float = Camera.main.pixelHeight / 600;
		var scale : Vector3 = Vector3(scaleX, scaleY, 1);
//		var scale : Vector3;
//		if(scaleX > scaleY) { 
//			scale = Vector3(scaleY, scaleY, 1);
//		}
//		else {
//			scale = Vector3(scaleX, scaleX, 1);
//		}
		guiMatrix.SetTRS(Vector3.one, Quaternion.identity, scale);
	}
}

function OnGUI () {	
	if(isReady) {
		SetMatrix();
		GUI.skin = mySkin;	
		GUI.matrix = guiMatrix;	
		
		if(playerData.firstTimePlaying) {
			askRect = GUILayout.Window (1, askRect, DoAskWindow, "");
		}
		else if(creditsOpen) {
			creditsWindow = GUI.Window (3, creditsWindow, DoCreditsWindow, "");
		}
		else if(playerData.settingsOpen)	{
			settingsGUI.Open();
		}
		else if(playerData.helpOpen)	{
			helpGUI.Open();
		}
		else	{
			windowRect = GUI.Window (0, windowRect, DoMyWindow, "");
		}
		
//		if(lastTooltip != "Hover" && tooltipString == "Hover") {
//			hoverSoundPlayed = false;
//		}
//		lastTooltip = tooltipString;
//		if(!hoverSoundPlayed) {		
//			buttonHoverSound.Play();
//			hoverSoundPlayed = true;
//		}
	}
}

function DoAskWindow (windowID : int) {
	GUILayout.BeginVertical();
	GUILayout.Space(8);
	GUILayout.Label("", "Divider");
	GUILayout.Label("Read the Instructions?");
	GUILayout.FlexibleSpace();
	if(GUILayout.Button(GUIContent("Yes","Hover")))		{
		if(!playerData.effectMuted) { buttonPressSound.Play(); }
		playerData.helpOpen = true;
		playerData.firstTimePlaying = false;
	}
	//GUILayout.FlexibleSpace();
	if(GUILayout.Button(GUIContent("No","Hover")))		{
		if(!playerData.effectMuted) { buttonPressSound.Play(); }
		playerData.firstTimePlaying = false;
	}
	GUILayout.FlexibleSpace();
	GUILayout.EndVertical();
	if(Event.current.type == EventType.Repaint) {
		tooltipString = GUI.tooltip;
	}
}

function DoCreditsWindow (windowID : int) {
	GUILayout.BeginVertical();
	GUILayout.Space(8);
	GUILayout.Label("", "Divider");
	GUILayout.Label("Credits");
	scrollPosition[0] = GUILayout.BeginScrollView(scrollPosition[0], false, false);
	var forcedSpace : int = 15;
	
	GUILayout.BeginHorizontal();
	GUILayout.BeginVertical();
	GUILayout.FlexibleSpace();
	GUILayout.Label("Designed & Developed by");
	GUILayout.Label("Stories, Icons & Special Effects by");
	GUILayout.Label("Music Composed by");
	GUILayout.FlexibleSpace();
	GUILayout.EndVertical();
	GUILayout.FlexibleSpace();
	GUILayout.BeginVertical();
	GUILayout.FlexibleSpace();
	GUILayout.Box("Chris Hammond", "LegendaryText");
	GUILayout.FlexibleSpace();
	GUILayout.EndVertical();
	GUILayout.EndHorizontal();
	GUILayout.FlexibleSpace();
	GUILayout.Space(forcedSpace);
	
	GUILayout.BeginHorizontal();
	GUILayout.Label("3D Models, Textures & GUI Skins from");
	GUILayout.FlexibleSpace();
	GUILayout.Box("Unity Asset Store - Various Artists", "LegendaryText");
	GUILayout.EndHorizontal();
	GUILayout.FlexibleSpace();
	GUILayout.Space(forcedSpace);	
	
	GUILayout.BeginHorizontal();
	GUILayout.Label("Sound Effects from");
	GUILayout.FlexibleSpace();
	GUILayout.Box("SoundJay.com  &  Unity Asset Store - Free SFX Package", "LegendaryText");
	GUILayout.EndHorizontal();
	GUILayout.FlexibleSpace();
	GUILayout.Space(forcedSpace);
	
	GUILayout.BeginHorizontal();
	GUILayout.Label("Pathfinding from");
	GUILayout.FlexibleSpace();
	GUILayout.Box("Unity Asset Store - A* Pathfinding Project", "LegendaryText");	
	GUILayout.EndHorizontal();
	GUILayout.FlexibleSpace();
	GUILayout.Space(forcedSpace);

	GUILayout.BeginHorizontal();
	GUILayout.Label("Special Thanks - Alpha Testers");
	GUILayout.FlexibleSpace();
	GUILayout.FlexibleSpace();
	GUILayout.Box("Kristy Hammond", "LegendaryText");
	GUILayout.FlexibleSpace();
	GUILayout.Box("Andrew Davis", "LegendaryText");
	GUILayout.EndHorizontal();
	GUILayout.FlexibleSpace();

	GUILayout.EndScrollView();	
	
	//back button
	if(!playerData.settingKey)		{
		GUILayout.BeginHorizontal();
		GUILayout.Label("", "Divider");
		if(GUILayout.Button (GUIContent("Back","Hover"), "ShortButton")) {
			if(!playerData.effectMuted) { buttonPressSound.Play(); }
			creditsOpen = false;
		}
		GUILayout.Label("", "Divider");
		GUILayout.EndHorizontal();
	}
	GUILayout.EndVertical();
	
	if(Event.current.type == EventType.Repaint) {
		tooltipString = GUI.tooltip;
	}
}

function DoMyWindow (windowID : int) {
		GUILayout.BeginVertical();
		GUILayout.Space(8);
		GUILayout.Label("", "Divider");
        GUILayout.Label("Main Menu");
		GUILayout.FlexibleSpace();
		
		GUILayout.BeginHorizontal();
		GUILayout.FlexibleSpace();
		scrollPosition[1] = GUILayout.BeginScrollView(scrollPosition[1], false, false);
		GUILayout.BeginHorizontal();
		GUILayout.FlexibleSpace();
		if(GUILayout.Button(GUIContent("Play","Hover"), GUILayout.Width(buttonWidth)))		{
			loadingScreen.Load("Characters", this.gameObject);
			if(!playerData.effectMuted) { buttonPressSound.Play(); }
		}
		GUILayout.FlexibleSpace();
		GUILayout.EndHorizontal();
		
		GUILayout.BeginHorizontal();
		GUILayout.FlexibleSpace();
		if(GUILayout.Button(GUIContent("Help","Hover"), GUILayout.Width(buttonWidth)))		{
			playerData.helpOpen = true;
			if(!playerData.effectMuted) { buttonPressSound.Play(); }
		}
		GUILayout.FlexibleSpace();
		GUILayout.EndHorizontal();
		
		GUILayout.BeginHorizontal();
		GUILayout.FlexibleSpace();
		if(GUILayout.Button(GUIContent("Settings","Hover"), GUILayout.Width(buttonWidth)))		{
			playerData.settingsOpen = true;
			if(!playerData.effectMuted) { buttonPressSound.Play(); }
		}
		GUILayout.FlexibleSpace();
		GUILayout.EndHorizontal();
		
		GUILayout.BeginHorizontal();
		GUILayout.FlexibleSpace();
		if(GUILayout.Button(GUIContent("Credits","Hover"), GUILayout.Width(buttonWidth)))		{
			creditsOpen = true;
			if(!playerData.effectMuted) { buttonPressSound.Play(); }
		}
		GUILayout.FlexibleSpace();
		GUILayout.EndHorizontal();
		
		GUILayout.EndScrollView();
		GUILayout.FlexibleSpace();
		GUILayout.EndHorizontal();
		GUILayout.FlexibleSpace();
		GUILayout.EndVertical();
		
		if(Event.current.type == EventType.Repaint) {
		tooltipString = GUI.tooltip;
	}		
}

//function SetSizes () {
//	
//}
//
//function Refresh () {	
//	windowX = (camera.pixelWidth/2.0) - (windowWidth/2);
//    windowY = (camera.pixelHeight/1.5) - (windowHeight/2);
//	
//	windowRect = Rect (windowX, windowY, windowWidth, windowHeight);	
//}
