#pragma strict

private var windowHeight : int;
private var windowWidth : int;
private var windowX : int;
private var windowY : int;
private var tooltipY : int;
private var windowRect : Rect;
private var tooltipRect : Rect;
private var tooltipString : String;
private var lastTooltip : String;
var drawToolTip : boolean;

private var sliderWidth : int;
private var keyWidth : int;
private var smallKeyWidth : int;
private var volumeWidth : int;
private var scrollHeight : int;
private var scrollPosition : Vector2;

private var padding: int;

private var keyStrings : String[] = ["Skill 1","Skill 2","Skill 3","Ultimate","Skill 1","Skill 2", "Skill 3","Ultimate","Lock","Self","Target","Zoom In","Zoom Out",
	"Mouse 1","Mouse 2","Stats","UI","Pause","Teleport"];
private var tabNames : String[] = ["Visual","Audio","Social","Interface","Hotkeys"];

var mySkin : GUISkin;
private var playerData : PlayerData;

private var pauseKeyText : String;

private var keyToSet : int;

private var buttonPressSound : AudioSource;

function Awake () {
//	SetSizes();
//	Refresh();
	tooltipString = "";
	lastTooltip = "";

	playerData = GameObject.FindGameObjectWithTag("Data").GetComponent(PlayerData);	
	
	padding = 8;
	
	windowHeight = 600;
	windowWidth = 800 - padding*2;
	windowX = padding;	
	windowY = 0;
	windowRect = Rect (windowX,windowY,windowWidth,windowHeight);
	
	sliderWidth = 120;//camera.pixelWidth/5.0;		
	keyWidth = 132; //camera.pixelWidth/6.0;
	smallKeyWidth = 100; //camera.pixelWidth/8.0;
	volumeWidth = 200; //camera.pixelWidth/4.0;
	scrollHeight = 200; //camera.pixelHeight/3.0;
	
	buttonPressSound = GameObject.Find("MenuButtonPressedSound").audio;
}

function Open () {
	GUI.skin = mySkin;
	
//	Refresh();
	windowRect = GUI.Window (0, windowRect, DoMyWindow, "");
	if(tooltipString != lastTooltip) {	
		if (lastTooltip != "") {
			drawToolTip = false;
		}
		if (tooltipString != "") {
			drawToolTip = true;
		}
		lastTooltip = tooltipString;
	} 
	if(drawToolTip) {		
		tooltipY = 600 - Input.mousePosition.y * 600 / Camera.main.pixelHeight;
		if(tooltipY > 474) { tooltipY = 255; }
		tooltipRect = Rect(Input.mousePosition.x * 800 / Camera.main.pixelWidth -120, tooltipY, 240, 220);
		tooltipRect = GUI.Window (1, tooltipRect, DoMyTooltipWindow, "");
	}
}

function DoMyTooltipWindow (windowID : int) {
	GUI.BringWindowToFront(1);
	GUILayout.BeginVertical();
	GUILayout.Space(21);
	GUILayout.Label("", "Divider");			
	GUILayout.FlexibleSpace();
	GUILayout.Box(tooltipString);
	GUILayout.FlexibleSpace();
	GUILayout.EndVertical();
}

function DoMyWindow (windowID : int) {
	GUILayout.BeginVertical();
	GUILayout.Space(8);
	GUILayout.Label("", "Divider");
	GUILayout.Label("Settings");
	GUILayout.BeginHorizontal();
	
	var oldTabNumber : int = playerData.tabNumber;
	if(!playerData.settingKey)		{		
		playerData.tabNumber = GUILayout.Toolbar(playerData.tabNumber,tabNames);
	}
	if(oldTabNumber != playerData.tabNumber) {
		if(!playerData.effectMuted) { buttonPressSound.Play(); };
	}
	GUILayout.EndHorizontal();

	scrollPosition = GUILayout.BeginScrollView(scrollPosition, false, false);
	if(playerData.tabNumber == 0)		{
		VisualSettings();
	}
	else if(playerData.tabNumber == 1)		{
		SoundSettings();
	}
	else if(playerData.tabNumber == 2)		{
		SocialSettings();
	}
	else if(playerData.tabNumber == 3)		{
		UISettings();
	}
	else if(playerData.tabNumber == 4)		{
		KeyboardSettings();
	}
	GUILayout.FlexibleSpace();
	GUILayout.EndScrollView();
	
	//back button
	if(!playerData.settingKey)		{
		GUILayout.BeginHorizontal();
		GUILayout.Label("", "Divider");
		if(GUILayout.Button ("Back", "ShortButton")) {
			playerData.SaveSettings();
			playerData.settingsOpen = false;
			if(!playerData.effectMuted) { buttonPressSound.Play(); }
		}
		GUILayout.Label("", "Divider");
		GUILayout.EndHorizontal();
	}
	GUILayout.EndVertical();	
	tooltipString = GUI.tooltip;
}

function VisualSettings ()	{
	//graphics options
	GUILayout.BeginHorizontal();
	GUILayout.Label("", "Divider");
	GUILayout.Label("Graphics");
	GUILayout.Label("", "Divider");
	GUILayout.EndHorizontal();
	GUILayout.BeginHorizontal();
	GUILayout.FlexibleSpace();
	//fullscreen toggle
	var buttonText : String = "Fullscreen";
	if(Screen.fullScreen) { buttonText = "Window"; }	
	if(GUILayout.Button(buttonText, GUILayout.Width(keyWidth)))	{ if(!playerData.effectMuted) { buttonPressSound.Play(); } FullScreen(); }
	GUILayout.FlexibleSpace();
	//FPS toggle
	playerData.displayingFPS = GUILayout.Toggle(playerData.displayingFPS, "Display Frames Per Second (FPS)", GUILayout.Width(volumeWidth));
	GUILayout.FlexibleSpace();
	GUILayout.EndHorizontal();
	
	GUILayout.FlexibleSpace();
	
	//camera
	GUILayout.BeginHorizontal();
	GUILayout.Label("", "Divider");
	GUILayout.Label("Camera");
	GUILayout.Label("", "Divider");
	GUILayout.EndHorizontal();
	
	GUILayout.BeginHorizontal();
	
	GUILayout.FlexibleSpace();
	
	GUILayout.BeginVertical();
	GUILayout.FlexibleSpace();
	
	GUILayout.Box (GUIContent("Scroll Speed : " + playerData.scrollSpeed * 2, "How fast does\nthe camera move?"), GUILayout.Width(volumeWidth));
	GUILayout.FlexibleSpace();
	GUILayout.Box (GUIContent("Mouse Scroll Range : " + (((-playerData.mouseScrollSize+10)*10)+100).ToString("F0") + "%", "How large are the\nareas that scroll\nthe camera?"), GUILayout.Width(volumeWidth));
	GUILayout.FlexibleSpace();
	GUILayout.Box ("Zoom : " + (-(((playerData.zoomValue-7)*10)-100)) + "%", GUILayout.Width(volumeWidth));
	GUILayout.FlexibleSpace();
	GUILayout.EndVertical();
	
	GUILayout.FlexibleSpace();
	
	GUILayout.BeginVertical();
	GUILayout.FlexibleSpace();
	playerData.scrollSpeed = GUILayout.HorizontalSlider(playerData.scrollSpeed, 1, 50, GUILayout.Width(sliderWidth));
	GUILayout.FlexibleSpace();
	playerData.mouseScrollSize = GUILayout.HorizontalSlider(playerData.mouseScrollSize, playerData.mouseScrollMin, playerData.mouseScrollMax, GUILayout.Width(sliderWidth));
	GUILayout.FlexibleSpace();
	playerData.zoomValue = GUILayout.HorizontalSlider(playerData.zoomValue, playerData.minZoom, playerData.maxZoom, GUILayout.Width(sliderWidth));
	GUILayout.FlexibleSpace();
	GUILayout.EndVertical();
	
	GUILayout.FlexibleSpace();
		
	GUILayout.BeginVertical();	
	GUILayout.FlexibleSpace();
	playerData.cameraLocked = GUILayout.Toggle(playerData.cameraLocked, GUIContent("Camera Locked","Is the camera\nlocked on you?"), GUILayout.Width(volumeWidth));
	GUILayout.FlexibleSpace();
	playerData.mouseScrollOn = GUILayout.Toggle(playerData.mouseScrollOn, GUIContent("Mouse Scroll On","Should the camera move\nwhen the mouse is near\nthe edge of the screen?"), GUILayout.Width(volumeWidth));
	GUILayout.FlexibleSpace();
	playerData.zoomLocked = GUILayout.Toggle(playerData.zoomLocked, "Zoom Locked", GUILayout.Width(volumeWidth));
	GUILayout.FlexibleSpace();
	GUILayout.EndVertical();
	
	GUILayout.EndHorizontal(); 
}

function SoundSettings ()	{
	//Music Volume
	GUILayout.BeginHorizontal();
	GUILayout.Label("", "Divider");
	GUILayout.Label("Music");
	GUILayout.Label("", "Divider");
	GUILayout.EndHorizontal();
	
	GUILayout.BeginHorizontal();
	GUILayout.FlexibleSpace();
	GUILayout.BeginVertical();
	GUILayout.FlexibleSpace();	
	GUILayout.Box ("Music Volume : " + playerData.musicVolume, GUILayout.Width(volumeWidth));	
	GUILayout.FlexibleSpace();
	GUILayout.EndVertical();
	GUILayout.FlexibleSpace();
	GUILayout.BeginVertical();
	GUILayout.FlexibleSpace();
	var oldVolume : int = playerData.musicVolume;
	playerData.musicVolume = GUILayout.HorizontalSlider(playerData.musicVolume, 1, 100, GUILayout.Width(sliderWidth));
	if(playerData.musicVolume != oldVolume) { UpdateMusicVolume(); }
	GUILayout.FlexibleSpace();
	GUILayout.EndVertical();
	GUILayout.FlexibleSpace();
	GUILayout.BeginVertical();
	GUILayout.FlexibleSpace();
	var isMusicMuted : boolean = playerData.musicMuted;
	playerData.musicMuted = GUILayout.Toggle(playerData.musicMuted, "Mute", GUILayout.Width(volumeWidth));
	if(isMusicMuted != playerData.musicMuted) { UpdateMusicMute(); }
	GUILayout.FlexibleSpace();
	GUILayout.EndVertical();
	GUILayout.EndHorizontal();
	
	GUILayout.FlexibleSpace();
		
	//Sound Volume
	GUILayout.BeginHorizontal();
	GUILayout.Label("", "Divider");
	GUILayout.Label("Sound Effects");
	GUILayout.Label("", "Divider");
	GUILayout.EndHorizontal();
	
	GUILayout.BeginHorizontal();
	GUILayout.FlexibleSpace();
	GUILayout.BeginVertical();
	GUILayout.FlexibleSpace();
	GUILayout.Box ("Sound Effect Volume : " + playerData.effectVolume, GUILayout.Width(volumeWidth));
	GUILayout.FlexibleSpace();
	GUILayout.EndVertical();
	GUILayout.FlexibleSpace();
	GUILayout.BeginVertical();
	GUILayout.FlexibleSpace();
	var oldEffectVolume : int = playerData.effectVolume;
	playerData.effectVolume = GUILayout.HorizontalSlider(playerData.effectVolume, 1, 100, GUILayout.Width(sliderWidth));
	if(playerData.effectVolume != oldEffectVolume) { UpdateSoundEffectVolume(); }
	GUILayout.FlexibleSpace();
	GUILayout.EndVertical();
	GUILayout.FlexibleSpace();
	GUILayout.BeginVertical();
	GUILayout.FlexibleSpace();
	var isEffectMuted : boolean = playerData.effectMuted;
	playerData.effectMuted = GUILayout.Toggle(playerData.effectMuted, "Mute", GUILayout.Width(volumeWidth));
	if(isEffectMuted != playerData.effectMuted) { UpdateSoundEffectMute();	}
	GUILayout.FlexibleSpace();
	GUILayout.EndVertical();
	GUILayout.EndHorizontal();
	
	GUILayout.FlexibleSpace();	
}

function UpdateMusicVolume () {
	var menuMusicObject: GameObject = GameObject.Find("MenuMusic");
	var battleMusicObject : GameObject = GameObject.Find("BattleMusic"); 
	if(battleMusicObject != null){
		battleMusicObject.audio.volume = playerData.musicVolume/100.0;
	}
	else if(menuMusicObject != null) {
		menuMusicObject.audio.volume = playerData.musicVolume/100.0;
	}
	
}

function UpdateMusicMute () {
	var menuMusicObject: GameObject = GameObject.Find("MenuMusic");
	var battleMusicObject : GameObject = GameObject.Find("BattleMusic"); 
	if(battleMusicObject != null){
		if(playerData.musicMuted) {		battleMusicObject.audio.Stop();		}
		else {	battleMusicObject.audio.volume = playerData.musicVolume/100.0;	battleMusicObject.audio.Play();	}
	}
	else if(menuMusicObject != null) {
		if(playerData.musicMuted) {		menuMusicObject.audio.Stop();		}
		else {	menuMusicObject.audio.volume = playerData.musicVolume/100.0;	menuMusicObject.audio.Play();	}
	}
	
}

function UpdateSoundEffectVolume () {
	var gameCon : GameObject = GameObject.FindGameObjectWithTag("GameController");	
	if(!playerData.effectMuted) { buttonPressSound.Play(); }
	if(gameCon) {
		var gameController : GameController = gameCon.GetComponent(GameController);
		var skills : Skills = gameCon.GetComponent(Skills);
		var opponentSkills : OpponentSkills = gameCon.GetComponent(OpponentSkills);
		for(var soundEffect in gameController.soundEffects) { 
			CheckSoundVolumeUpdate(soundEffect);			
		}
		for(soundEffect in gameController.attackSoundEffects) { 
			CheckSoundVolumeUpdate(soundEffect);
		}
		for(soundEffect in gameController.deathSoundEffects) { 
			CheckSoundVolumeUpdate(soundEffect);
		}
		for(soundEffect in gameController.teleportSoundEffects) { 
			CheckSoundVolumeUpdate(soundEffect);
		}
		for(soundEffect in skills.skillSoundEffects) { 
			CheckSoundVolumeUpdate(soundEffect);
		}
		for(soundEffect in skills.runtSoundEffects) { 
			CheckSoundVolumeUpdate(soundEffect);
		}
		for(soundEffect in opponentSkills.skillSoundEffects) { 
			CheckSoundVolumeUpdate(soundEffect);
		}
		for(soundEffect in opponentSkills.runtSoundEffects) { 
			CheckSoundVolumeUpdate(soundEffect);
		}
	}
	buttonPressSound.volume = playerData.effectVolume/100.0;	
}

function CheckSoundVolumeUpdate (soundEffect : AudioSource) {
	if(soundEffect != null) {
		soundEffect.volume = playerData.effectVolume;
	}
}


function UpdateSoundEffectMute () {
	var gameCon : GameObject = GameObject.FindGameObjectWithTag("GameController");	
	if(!playerData.effectMuted) {	buttonPressSound.Play(); }
	if(gameCon != null) {
		var gameController : GameController = gameCon.GetComponent(GameController);	
		var skills : Skills = gameCon.GetComponent(Skills);
		var opponentSkills : OpponentSkills = gameCon.GetComponent(OpponentSkills);
		for(var soundEffect in gameController.soundEffects) { 				
			CheckSoundUpdate(soundEffect);
		}
		for(soundEffect in gameController.attackSoundEffects) { 
			CheckSoundUpdate(soundEffect);
		}
		for(soundEffect in gameController.deathSoundEffects) { 
			CheckSoundUpdate(soundEffect);
		}
		for(soundEffect in gameController.teleportSoundEffects) { 
			CheckSoundUpdate(soundEffect);
		}
		for(soundEffect in skills.skillSoundEffects) { 
			CheckSoundUpdate(soundEffect);
		}
		for(soundEffect in skills.runtSoundEffects) { 
			CheckSoundUpdate(soundEffect);
		}
		for(soundEffect in opponentSkills.skillSoundEffects) { 
			CheckSoundUpdate(soundEffect);
		}
		for(soundEffect in opponentSkills.runtSoundEffects) { 
			CheckSoundUpdate(soundEffect);
		}
	}
	if(playerData.effectMuted) { buttonPressSound.volume = 0; }
	else { buttonPressSound.volume = playerData.effectVolume; }
}

function CheckSoundUpdate (soundEffect : AudioSource) {
	if(soundEffect != null) {
		if(playerData.effectMuted) { soundEffect.volume = 0; }
		else { soundEffect.volume = playerData.effectVolume; }
	}
}

function SocialSettings ()	{
	//*under construction*
	GUILayout.BeginHorizontal();
	GUILayout.FlexibleSpace();
	GUILayout.BeginVertical();
	GUILayout.FlexibleSpace();
	GUILayout.Box ("Coming Soon!", "ItalicText");
	GUILayout.FlexibleSpace();
	GUILayout.EndVertical();
	GUILayout.FlexibleSpace();
	GUILayout.EndHorizontal();
}

function UISettings ()	{
	//HUD
	GUILayout.BeginHorizontal();
	GUILayout.Label("", "Divider");
	GUILayout.Label("HUD");
	GUILayout.Label("", "Divider");
	GUILayout.EndHorizontal();
	
	GUILayout.BeginHorizontal();
	GUILayout.FlexibleSpace();
	GUILayout.BeginVertical();
	GUILayout.FlexibleSpace();
	GUILayout.Box (GUIContent("Scaling : " + playerData.uiScale*20 + "%", "How large should\nthe HUD be?"), GUILayout.Width(volumeWidth));
	GUILayout.FlexibleSpace();
	GUILayout.Box (GUIContent("Opacity : " + (playerData.hudOpacity*100).ToString("F0") + "%", "How opaque should\nthe HUD be?\n0% = Transparent"), GUILayout.Width(volumeWidth));
	GUILayout.FlexibleSpace();
	GUILayout.EndVertical();
	GUILayout.FlexibleSpace();
	GUILayout.BeginVertical();
	GUILayout.FlexibleSpace();
	playerData.uiScale = GUILayout.HorizontalSlider(playerData.uiScale, playerData.uiMin, playerData.uiMax, GUILayout.Width(sliderWidth));	
	GUILayout.FlexibleSpace();
//	GUILayout.BeginHorizontal();
//	GUILayout.FlexibleSpace();
//	playerData.uiToggle = GUILayout.Toggle(playerData.uiToggle, "Display HUD");	
//	GUILayout.FlexibleSpace();
//	GUILayout.EndHorizontal();
//	GUILayout.FlexibleSpace();
	playerData.hudOpacity = GUILayout.HorizontalSlider(playerData.hudOpacity, 0.25, 1.0, GUILayout.Width(sliderWidth));	
	GUILayout.FlexibleSpace();
	GUILayout.EndVertical();
	GUILayout.FlexibleSpace();
	GUILayout.BeginVertical();
	GUILayout.FlexibleSpace();
	playerData.uiToggle = GUILayout.Toggle(playerData.uiToggle, "Display HUD");	
	GUILayout.FlexibleSpace();	
	GUILayout.EndVertical();
	GUILayout.FlexibleSpace();	
	GUILayout.BeginVertical();
	GUILayout.FlexibleSpace();
	GUILayout.Label ("Stats Display");
	GUILayout.BeginHorizontal();
	GUILayout.FlexibleSpace();
	if(playerData.statsToggle) {
		if(GUILayout.Button(GUIContent("Toggle", "Should the stats display\ntoggle on and off or\nshould the key be held?"), GUILayout.Width(keyWidth))) {	
			playerData.statsToggle = false;
			if(!playerData.effectMuted) { buttonPressSound.Play(); }
		}
	}
	else {
		if(GUILayout.Button(GUIContent("Hold", "Should the stats display\ntoggle on and off or\nshould the key be held?"), GUILayout.Width(keyWidth))) {
			playerData.statsToggle = true;
			if(!playerData.effectMuted) { buttonPressSound.Play(); };
		}
	}	
	GUILayout.FlexibleSpace();
	GUILayout.EndVertical();
	GUILayout.FlexibleSpace();
	GUILayout.EndHorizontal();	
	GUILayout.EndHorizontal();	
	
	GUILayout.FlexibleSpace();
	
	//floating numbers/bars
	GUILayout.BeginHorizontal();
	GUILayout.Label("", "Divider");
	GUILayout.Label("Display");
	GUILayout.Label("", "Divider");
	GUILayout.EndHorizontal();
	GUILayout.BeginHorizontal();
	GUILayout.FlexibleSpace();
	playerData.expToggle = GUILayout.Toggle(playerData.expToggle, GUIContent("Floating Experience","Coming Soon!"));
	GUILayout.FlexibleSpace();
	playerData.playerHealthBar = GUILayout.Toggle(playerData.playerHealthBar, "Player Health Bar");
	GUILayout.FlexibleSpace();
	playerData.enemyHealthBar = GUILayout.Toggle(playerData.enemyHealthBar, "Enemy Health Bar");
	GUILayout.FlexibleSpace();
	GUILayout.EndHorizontal();
	GUILayout.FlexibleSpace();
	
	GUILayout.FlexibleSpace();
	
	//Quick Cast
	GUILayout.BeginHorizontal();
	GUILayout.Label("", "Divider");
	GUILayout.Label("Battle");
	GUILayout.Label("", "Divider");
	GUILayout.EndHorizontal();
	GUILayout.BeginHorizontal();
	GUILayout.FlexibleSpace();
	playerData.autoAttack = GUILayout.Toggle(playerData.autoAttack, GUIContent("Auto Attack", "Should my character\nautomatically attack\nenemies that come close?"));
	GUILayout.FlexibleSpace();
	playerData.quickCast = GUILayout.Toggle(playerData.quickCast, GUIContent("Quick Cast", "Should my aimed skills\nactivate instantly?\nOnly applies to keyboard."));
	GUILayout.FlexibleSpace();
	GUILayout.EndHorizontal();
	GUILayout.FlexibleSpace();
}

function KeyboardSettings ()	{
	if(playerData.settingKey)	{		SetKey(keyToSet);	}
	else	{		KeyButtons();	}
}

function KeyButtons ()	{	
	DrawKeyLabels("Skills");	
	for(var i : int = 0; i < 19; i++)	{	
		GUILayout.BeginVertical();
		GUILayout.BeginHorizontal();
		GUILayout.FlexibleSpace();		
		var adjustedWidth : float = keyWidth;
		if(i > 7) { adjustedWidth = smallKeyWidth; }  
		if (GUILayout.Button (keyStrings[i], GUILayout.Width(adjustedWidth)))		{
			keyToSet = i;
			playerData.settingKey = true;	
			if(!playerData.effectMuted) { buttonPressSound.Play(); }
		}
		GUILayout.FlexibleSpace();
		GUILayout.EndHorizontal();
		GUILayout.BeginHorizontal();
		GUILayout.FlexibleSpace();
		GUILayout.Box (" Key : " + playerData.keySettings[i],"OutlineText");
		GUILayout.FlexibleSpace();
		GUILayout.EndHorizontal();
		GUILayout.EndVertical();

		if(i == 3)		{
			GUILayout.EndHorizontal();
			GUILayout.FlexibleSpace();
			DrawKeyLabels("Skill Level Ups");
		}
		else if(i == 7)		{
			GUILayout.EndHorizontal();
			GUILayout.FlexibleSpace();
			DrawKeyLabels("Camera");
		}
		else if(i == 12)		{
			GUILayout.EndHorizontal();
			GUILayout.FlexibleSpace();
			DrawKeyLabels("Misc.");
		}
	}
	GUILayout.EndHorizontal();
}

function SetKey (keyNumber : int)	{
	var swap = false;
	GUILayout.Space(padding);
	GUILayout.Box ("PRESS DESIRED KEY");
	
	if(Event.current.isKey)	{
		var keyDown : KeyCode = Event.current.keyCode;
		//loop through keys
		for(var j : int = 0; j < 19; j++)		{
			if(playerData.keySettings[j] == keyDown)			{
				playerData.keySettings[j] = playerData.keySettings[keyNumber];
				playerData.keySettings[keyNumber] = keyDown;
				swap = true;
				playerData.settingKey = false;
			}
		}
		if(!swap)		{
			playerData.keySettings[keyNumber] = keyDown;
			playerData.settingKey = false;
		}
	}
}

function DrawKeyLabels (word : String){
	GUILayout.BeginHorizontal();
	GUILayout.Label("", "Divider");
	GUILayout.Label(word);
	GUILayout.Label("", "Divider");
	GUILayout.EndHorizontal();
	GUILayout.BeginHorizontal();
}

function FullScreen () {
	if(!playerData.fullscreen) {
		playerData.fullscreen = true;
		Screen.SetResolution(Screen.currentResolution.width, Screen.currentResolution.height, true);		
	}
	else {
		playerData.fullscreen = false;
		Screen.SetResolution (800, 600, false);
	}
//	RefreshCo();
}
//
//function RefreshCo () {
//	for(var i : int = 0; i < 3; i++) {
//		if(i < 2) {	yield WaitForEndOfFrame();		}
//		else { Refresh(); break; }
//	}
//}

