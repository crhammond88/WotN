#pragma strict

var mySkin : GUISkin;
var skillIconSkin : GUISkin;

var frozen : boolean;
var heightTestGUI : GUISkin;
var redGemStyle : GUIStyle;
var blueGemStyle : GUIStyle;
var purpleGemStyle : GUIStyle;

private var padding: int;
private var windowHeight : int;
private var topHeight : int;
private var bottomHeight : int;
private var windowWidth : int;
private var windowX : int;
private var windowY : int;
private var bottomY : int;
private var windowRect : Rect;
private var bottomRect : Rect;
private var middleRect : Rect;
private var scrollPosition : Vector2[];
private var needsBottom : boolean;
private var needsMiddle : boolean;

private var charButtonWidth : int;
private var diffButtonWidth : int;
private static var gemWidth : float;

private var playerData : PlayerData;
private var unitData : UnitData;
private var loadingScreen : LoadingScreen;

private var redGems : int;
private var blueGems : int;
private var purpleGems : int;

private var challengeNumber : int;

private var ralphCamera : Camera;
private var rosalindCamera : Camera;
private var leonardoCamera : Camera;
private var gravitonCamera : Camera;

private var ralphAnimation : Animation;
private var rosAnimation : Animation;
private var leoAnimation : Animation;
private var anim : Animator;

private var characterAnimations : Animation[];

var viewTab : int;
var viewTabNames : String[] = ["Stats", "Story", "Masters"];

private var tooltipRect : Rect;
private var tooltipString : String;
private var lastTooltip : String;
var drawToolTip : boolean;
private var tooltipY : int;
var tooltipSize : int;
var needsTooltip : boolean[];

private var redGemsMain : int;
private var blueGemsMain : int;
private var purpleGemsMain : int;
private var totalGemsMain : int;

private var guiMatrix : Matrix4x4;	

private var skillIconStyles : GUIStyle[,];

private var buttonPressSound : AudioSource;
private var skillSoundEffects : AudioSource[];

function Awake ()	{	
	var musicObject : GameObject = GameObject.Find("MenuMusic");
	if(!musicObject.audio.isPlaying && !playerData.musicMuted) {	musicObject.audio.Play();	}
	
	Physics.gravity = Vector3(0,0,0);
	ralphAnimation = GameObject.Find("Ralph").animation;
	rosAnimation = GameObject.Find("Rosalind").animation;
	leoAnimation = GameObject.Find("Leonardo").animation;
	anim = GameObject.Find("Graviton").GetComponent(Animator);
	ralphAnimation.Play("walk");
	rosAnimation.Play("walk");
	leoAnimation.Play("walk");
	anim.enabled = true;
	
	characterAnimations = new Animation[3];
	characterAnimations[0] = ralphAnimation;
	characterAnimations[1] = rosAnimation;
	characterAnimations[2] = leoAnimation;
	
	needsTooltip = new boolean[2];
	
	scrollPosition = new Vector2[20];
	Refresh();	
	charButtonWidth = 160; //camera.pixelWidth/5.0;
	diffButtonWidth = 200; //camera.pixelWidth/4.0;
	gemWidth = 130;
	topHeight = 230;
	bottomHeight = 280;
	windowY = 0;
	padding = 8.0;	
	windowHeight = 600;
	windowWidth = 800 - padding*2;	
	windowX = padding;		
	
	playerData = GameObject.FindGameObjectWithTag("Data").GetComponent(PlayerData);
	unitData = GameObject.FindGameObjectWithTag("Data").GetComponent(UnitData);
	loadingScreen = GameObject.FindGameObjectWithTag("LoadingScreen").GetComponent(LoadingScreen);	
	
	ralphCamera = GameObject.Find("RalphCamera").camera;
	rosalindCamera = GameObject.Find("RosalindCamera").camera;
	leonardoCamera = GameObject.Find("LeonardoCamera").camera;
	gravitonCamera = GameObject.Find("GravitonCamera").camera;
	
	AdjustModels();
	viewTab = 0;
	frozen = false;
	
	var stars : GameObject = GameObject.Find("Stars");
	stars.Find("Twinkle").particleSystem.Play();
	stars.transform.position.y = 100;
	stars.transform.position.z = 0;
	
	var gems : GameObject = GameObject.Find("Gems");
	gems.transform.position.y = -8;	
	
	skillIconStyles = new GUIStyle[4,5];
	skillIconStyles[0,0] = skillIconSkin.GetStyle("RalphPassive");
	skillIconStyles[0,1] = skillIconSkin.GetStyle("RalphSkillOne");
	skillIconStyles[0,2] = skillIconSkin.GetStyle("RalphSkillTwo");
	skillIconStyles[0,3] = skillIconSkin.GetStyle("RalphSkillThree");
	skillIconStyles[0,4] = skillIconSkin.GetStyle("RalphUltimate");
	skillIconStyles[1,0] = skillIconSkin.GetStyle("RosalindPassive");
	skillIconStyles[1,1] = skillIconSkin.GetStyle("RosalindSkillOne");
	skillIconStyles[1,2] = skillIconSkin.GetStyle("RosalindSkillTwo");
	skillIconStyles[1,3] = skillIconSkin.GetStyle("RosalindSkillThreeFinesse");
	skillIconStyles[1,4] = skillIconSkin.GetStyle("RosalindUltimate");
	skillIconStyles[2,0] = skillIconSkin.GetStyle("LeonardoPassive");
	skillIconStyles[2,1] = skillIconSkin.GetStyle("LeonardoSkillOne");
	skillIconStyles[2,2] = skillIconSkin.GetStyle("LeonardoSkillTwo");
	skillIconStyles[2,3] = skillIconSkin.GetStyle("LeonardoSkillThree");
	skillIconStyles[2,4] = skillIconSkin.GetStyle("LeonardoUltimate");
	skillIconStyles[3,0] = skillIconSkin.GetStyle("GravitonPassive");
	skillIconStyles[3,1] = skillIconSkin.GetStyle("GravitonSkillOne");
	skillIconStyles[3,2] = skillIconSkin.GetStyle("GravitonSkillTwo");
	skillIconStyles[3,3] = skillIconSkin.GetStyle("GravitonSkillThree");
	skillIconStyles[3,4] = skillIconSkin.GetStyle("GravitonUltimate");
	
	buttonPressSound = GameObject.Find("MenuButtonPressedSound").audio;
	
	skillSoundEffects = new AudioSource[4];
	skillSoundEffects[0] = GameObject.Find("RuntKickSound").audio;
	skillSoundEffects[1] = GameObject.Find("RosalindAttackSound").audio;
	skillSoundEffects[2] = GameObject.Find("SpiderSound").audio;
	skillSoundEffects[3] = GameObject.Find("GravityWellSound").audio;
	
	//count gems
	for(var i : int = 0; i < 4; i++)	{
		//for each difficulty
		for(var m : int = 0; m < 5; m++)		{
			//for each opponent char, sum gems earned
			for(var n : int = 0; n < 4; n++)	{
				if(playerData.gems[i*20 + m*4 + n] >= 1)	{
					redGemsMain += 1;
				}
				if(playerData.gems[i*20 + m*4 + n] >= 2)	{
					blueGemsMain += 1;
				}
				if(playerData.gems[i*20 + m*4 + n] == 3)	{
					purpleGemsMain += 1;
				}
			}
		}
	}
	totalGemsMain = redGemsMain + blueGemsMain + purpleGemsMain;
}

function AdjustModels () {
	if(playerData.difficultyDone) {
		ralphCamera.rect = Rect (0.1, 0.34, 0.18, 0.33);
		rosalindCamera.rect = Rect (0.3, 0.34, 0.18, 0.33);
		leonardoCamera.rect = Rect (0.5125, 0.34, 0.18, 0.33);
		gravitonCamera.rect = Rect (0.725, 0.34, 0.18, 0.33);
	}
	else if(!playerData.viewing) {
		ralphCamera.rect = Rect (0.1, 0.465, 0.18, 0.33);
		rosalindCamera.rect = Rect (0.3, 0.465, 0.18, 0.33);
		leonardoCamera.rect = Rect (0.5125, 0.465, 0.18, 0.33);
		gravitonCamera.rect = Rect (0.725, 0.465, 0.18, 0.33);
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

function Refresh () {	
	SetMatrix();
	if(playerData.difficultyDone)		{
		needsBottom = true;
		needsMiddle = false;
		topHeight = 225;
		bottomHeight = 240;
	}
	else if(playerData.characterDone)		{
		needsBottom = false;
		needsMiddle = false;
		topHeight = 600;
	}
	else if(playerData.viewing)		{
		needsBottom = true;
		needsMiddle = true;
		bottomHeight = 210;
		topHeight = 185;
	}
	else		{
		needsBottom = true;
		needsMiddle = false;
		topHeight = 140;
		bottomHeight = 300;
	}
	
	bottomY = 600 - bottomHeight;
	
	if(playerData.viewing && !playerData.characterDone)	{	
		bottomRect = Rect(600,bottomY,200,bottomHeight);
		middleRect = Rect(windowX,135,600,465);
	}	
	else { bottomRect = Rect(windowX,bottomY,windowWidth,bottomHeight);	}
	windowRect = Rect(windowX,windowY,windowWidth,topHeight);
	
	if(playerData.viewing && !playerData.characterDone) {
		switch(playerData.characterSelected) {
		case 0:
			ralphCamera.rect = Rect (0.775, 0.32, 0.18, 0.33);
			rosalindCamera.rect = Rect (-1, 0.35, 0.18, 0.33);
			leonardoCamera.rect = Rect (-1, 0.35, 0.18, 0.33);
			gravitonCamera.rect = Rect (-1, 0.35, 0.18, 0.33);
			break;
		case 1:
			ralphCamera.rect = Rect (-1, 0.35, 0.18, 0.33);
			rosalindCamera.rect = Rect (0.775, 0.32, 0.18, 0.33);
			leonardoCamera.rect = Rect (-1, 0.35, 0.18, 0.33);
			gravitonCamera.rect = Rect (-1, 0.35, 0.18, 0.33);
			break;
		case 2:
			ralphCamera.rect = Rect (-1, 0.35, 0.18, 0.33);
			rosalindCamera.rect = Rect (-1, 0.35, 0.18, 0.33);
			leonardoCamera.rect = Rect (0.775, 0.32, 0.18, 0.33);
			gravitonCamera.rect = Rect (-1, 0.35, 0.18, 0.33);
			break;
		case 3:
			ralphCamera.rect = Rect (-1, 0.35, 0.18, 0.33);
			rosalindCamera.rect = Rect (-1, 0.35, 0.18, 0.33);
			leonardoCamera.rect = Rect (-1, 0.35, 0.18, 0.33);
			gravitonCamera.rect = Rect (0.775, 0.32, 0.18, 0.33);
			break;
		}
	}
}

function OnGUI () {	
	GUI.skin = mySkin;	
	GUI.matrix = guiMatrix;	
	
	Refresh();
	if(needsBottom) {	bottomRect = GUI.Window(0, bottomRect, DoMyWindow1, ""); }
	if(needsMiddle) {	middleRect = GUI.Window(1, middleRect, DoMyWindow2, ""); }
	windowRect = GUI.Window (2, windowRect, DoMyWindow, "");
	
//	if(needsTooltip[0] == false && needsTooltip[1] == false) { tooltipString = ""; }
	if(tooltipString != lastTooltip) {	
		if (lastTooltip != "") {
			drawToolTip = false;
		}
		if (tooltipString != "") {
			drawToolTip = true;
		}
		lastTooltip = tooltipString;
	} 	
	if(drawToolTip && !frozen) {	
		//(camera.pixelWidth - playerWidth)/uiScaleValue + (playerWidth/uiScaleValue - playerWidth);
		var tooltipX : float = Input.mousePosition.x * 800 / Camera.main.pixelWidth - 130;
		tooltipY = 600 - Input.mousePosition.y * 600 / Camera.main.pixelHeight;	
		var tooltipWidth : float = 260;	
		var tooltipHeight : float = 200;
		var nameOfSkill : String = "";	
		var printedTip : String = tooltipString;
		var tooltipNumber : int;
		if(printedTip != "") {
			var firstChar : String = printedTip[0:1];
			var tempNum : int;
			if(int.TryParse(firstChar, tempNum)) {	tooltipNumber = tempNum; }
		}
		if(tooltipNumber > 0) {
			if(!playerData.viewing){
				tooltipHeight = 360; 
			}
			else if(!playerData.difficultyDone){
				tooltipHeight = 360; 
			}
			else {
				tooltipHeight = 300; 
			}
		}				
		if(tooltipString.Contains("$")) {
			var splitSkillStrings : String[] = tooltipString.Split("$"[0]);
			nameOfSkill = splitSkillStrings[0];
			tooltipHeight = heightTestGUI.window.CalcHeight(GUIContent(splitSkillStrings[1] + splitSkillStrings[2],""), 354);
			tooltipHeight += 12500/tooltipHeight;
			if(tooltipHeight > 630) { tooltipHeight = 630; }
			tooltipWidth = 354;
			tooltipX -= 47;			
			if(tooltipHeight > 600 - tooltipY) {  tooltipY = 600-tooltipHeight;	}	
		}
		else if(tooltipY > 600 - tooltipHeight/2.0 -88) { tooltipY = 600 - tooltipHeight*1.5 - 44; }	//50 25		
		tooltipRect = Rect(tooltipX, tooltipY, tooltipWidth, tooltipHeight);		
		tooltipRect = GUI.Window(13, tooltipRect, DoMyTooltipWindow, nameOfSkill);			
	}	
}

function DoMyTooltipWindow (windowID : int) {
	GUILayout.BeginVertical();
	GUILayout.Space(22);
	GUILayout.Label("", "Divider");
	GUI.BringWindowToFront(13);
	GUILayout.BeginVertical();		
	GUILayout.FlexibleSpace();
	
	var printedTip : String = tooltipString;
	var tooltipNumber : int;
	if(printedTip != "") {
		var firstChar : String = printedTip[0:1];
		var tempNum : int;
		if(int.TryParse(firstChar, tempNum)) {	tooltipNumber = tempNum; }
	}
	
	if(tooltipString.Contains("$")) { 
		var splitSkillStrings : String[] = tooltipString.Split("$"[0]);		
		printedTip =  splitSkillStrings[1] + "\n----------\n" + splitSkillStrings[2];
		GUILayout.Box(printedTip);
	}
	else if(tooltipNumber > 0) {
		GUILayout.BeginVertical();
		GUILayout.BeginHorizontal();	GUILayout.FlexibleSpace();	
		GUILayout.Box("Earn", "ItalicText");
		GUILayout.FlexibleSpace();		GUILayout.EndHorizontal();
		GUILayout.Label("", "Divider");
		switch(tooltipNumber) {
		case 1:
			GUILayout.BeginHorizontal();	GUILayout.FlexibleSpace();	
			GUILayout.Box("", "ItalicText");			GUILayout.Box("", "ItalicText");
			GUILayout.FlexibleSpace();		GUILayout.EndHorizontal();	
			GUILayout.BeginHorizontal();	GUILayout.FlexibleSpace();	
			GUILayout.Box("1", "ItalicText");			GUILayout.Box("", redGemStyle);	
			GUILayout.FlexibleSpace();		GUILayout.EndHorizontal();	
			GUILayout.BeginHorizontal();	GUILayout.FlexibleSpace();
			GUILayout.Box("", "ItalicText");			GUILayout.Box("", "ItalicText");	
			GUILayout.FlexibleSpace();		GUILayout.EndHorizontal();	
			break;
		case 2:			
			GUILayout.BeginHorizontal();	GUILayout.FlexibleSpace();	
			GUILayout.Box("2", "ItalicText");			GUILayout.Box("", redGemStyle);
			GUILayout.FlexibleSpace();		GUILayout.EndHorizontal();	
			GUILayout.BeginHorizontal();	GUILayout.FlexibleSpace();	
			GUILayout.Box("or", "ItalicText");			GUILayout.Box("", "ItalicText");	
			GUILayout.FlexibleSpace();		GUILayout.EndHorizontal();	
			GUILayout.BeginHorizontal();	GUILayout.FlexibleSpace();	
			GUILayout.Box("1", "ItalicText");			GUILayout.Box("", blueGemStyle);
			GUILayout.FlexibleSpace();		GUILayout.EndHorizontal();					
			break;
		case 3:
			GUILayout.BeginHorizontal();	GUILayout.FlexibleSpace();	
			GUILayout.Box("5", "ItalicText");			GUILayout.Box("", redGemStyle);
			GUILayout.FlexibleSpace();		GUILayout.EndHorizontal();	
			GUILayout.BeginHorizontal();	GUILayout.FlexibleSpace();	
			GUILayout.Box("or", "ItalicText");
			GUILayout.FlexibleSpace();		GUILayout.EndHorizontal();	
			GUILayout.BeginHorizontal();	GUILayout.FlexibleSpace();	
			GUILayout.Box("3", "ItalicText");			GUILayout.Box("", blueGemStyle);
			GUILayout.FlexibleSpace();		GUILayout.EndHorizontal();	
			GUILayout.BeginHorizontal();	GUILayout.FlexibleSpace();	
			GUILayout.Box("or", "ItalicText");
			GUILayout.FlexibleSpace();		GUILayout.EndHorizontal();	
			GUILayout.BeginHorizontal();	GUILayout.FlexibleSpace();	
			GUILayout.Box("1", "ItalicText");			GUILayout.Box("", purpleGemStyle);
			GUILayout.FlexibleSpace();		GUILayout.EndHorizontal();	
			break;
		case 4:
			GUILayout.BeginHorizontal();	GUILayout.FlexibleSpace();	
			GUILayout.Box("10", "ItalicText");			GUILayout.Box("", redGemStyle);
			GUILayout.FlexibleSpace();		GUILayout.EndHorizontal();	
			GUILayout.BeginHorizontal();	GUILayout.FlexibleSpace();	
			GUILayout.Box("or", "ItalicText");
			GUILayout.FlexibleSpace();		GUILayout.EndHorizontal();	
			GUILayout.BeginHorizontal();	GUILayout.FlexibleSpace();	
			GUILayout.Box("6", "ItalicText");			GUILayout.Box("", blueGemStyle);
			GUILayout.FlexibleSpace();		GUILayout.EndHorizontal();	
			GUILayout.BeginHorizontal();	GUILayout.FlexibleSpace();	
			GUILayout.Box("or", "ItalicText");
			GUILayout.FlexibleSpace();		GUILayout.EndHorizontal();	
			GUILayout.BeginHorizontal();	GUILayout.FlexibleSpace();	
			GUILayout.Box("3", "ItalicText");			GUILayout.Box("", purpleGemStyle);
			GUILayout.FlexibleSpace();		GUILayout.EndHorizontal();	
			break;
		case 5:
			GUILayout.BeginHorizontal();	GUILayout.FlexibleSpace();	
			GUILayout.Box("8", "ItalicText");			GUILayout.Box("", redGemStyle);
			GUILayout.FlexibleSpace();		GUILayout.EndHorizontal();	
			GUILayout.BeginHorizontal();	GUILayout.FlexibleSpace();	
			GUILayout.Box("or", "ItalicText");
			GUILayout.FlexibleSpace();		GUILayout.EndHorizontal();	
			GUILayout.BeginHorizontal();	GUILayout.FlexibleSpace();	
			GUILayout.Box("4", "ItalicText");			GUILayout.Box("", blueGemStyle);
			GUILayout.FlexibleSpace();		GUILayout.EndHorizontal();	
			GUILayout.BeginHorizontal();	GUILayout.FlexibleSpace();	
			GUILayout.Box("or", "ItalicText");
			GUILayout.FlexibleSpace();		GUILayout.EndHorizontal();	
			GUILayout.BeginHorizontal();	GUILayout.FlexibleSpace();	
			GUILayout.Box("2", "ItalicText");			GUILayout.Box("", purpleGemStyle);
			GUILayout.FlexibleSpace();		GUILayout.EndHorizontal();	
			break;
		case 6:
			GUILayout.BeginHorizontal();	GUILayout.FlexibleSpace();	
			GUILayout.Box("20", "ItalicText");			GUILayout.Box("", redGemStyle);
			GUILayout.FlexibleSpace();		GUILayout.EndHorizontal();
			GUILayout.BeginHorizontal();	GUILayout.FlexibleSpace();		
			GUILayout.Box("or", "ItalicText");
			GUILayout.FlexibleSpace();		GUILayout.EndHorizontal();	
			GUILayout.BeginHorizontal();	GUILayout.FlexibleSpace();	
			GUILayout.Box("10", "ItalicText");			GUILayout.Box("", blueGemStyle);
			GUILayout.FlexibleSpace();		GUILayout.EndHorizontal();	
			GUILayout.BeginHorizontal();	GUILayout.FlexibleSpace();	
			GUILayout.Box("or", "ItalicText");
			GUILayout.FlexibleSpace();		GUILayout.EndHorizontal();	
			GUILayout.BeginHorizontal();	GUILayout.FlexibleSpace();	
			GUILayout.Box("5", "ItalicText");			GUILayout.Box("", purpleGemStyle);
			GUILayout.FlexibleSpace();		GUILayout.EndHorizontal();	
			break;
		case 7:
			GUILayout.BeginHorizontal();	GUILayout.FlexibleSpace();	
			GUILayout.Box("40", "ItalicText");			GUILayout.Box("", redGemStyle);
			GUILayout.FlexibleSpace();		GUILayout.EndHorizontal();	
			GUILayout.BeginHorizontal();	GUILayout.FlexibleSpace();	
			GUILayout.Box("or", "ItalicText");
			GUILayout.FlexibleSpace();		GUILayout.EndHorizontal();	
			GUILayout.BeginHorizontal();	GUILayout.FlexibleSpace();	
			GUILayout.Box("20", "ItalicText");			GUILayout.Box("", blueGemStyle);
			GUILayout.FlexibleSpace();		GUILayout.EndHorizontal();	
			GUILayout.BeginHorizontal();	GUILayout.FlexibleSpace();	
			GUILayout.Box("or", "ItalicText");
			GUILayout.FlexibleSpace();		GUILayout.EndHorizontal();	
			GUILayout.BeginHorizontal();	GUILayout.FlexibleSpace();	
			GUILayout.Box("10", "ItalicText");			GUILayout.Box("", purpleGemStyle);
			GUILayout.FlexibleSpace();		GUILayout.EndHorizontal();	
			break;
		}
		GUILayout.Label("", "Divider");
		GUILayout.BeginHorizontal();	GUILayout.FlexibleSpace();	
		GUILayout.Box("To Unlock", "ItalicText");
		GUILayout.FlexibleSpace();		GUILayout.EndHorizontal();	
		GUILayout.EndVertical();
	}
	else {	GUILayout.Box(printedTip);	}
	
	
	GUILayout.FlexibleSpace();
	GUILayout.EndVertical();
	GUILayout.EndVertical();
}

function DoMyWindow (windowID : int) {
	if(frozen) { GUI.enabled = false; }
	else { GUI.enabled = true; }
	
	GUILayout.BeginVertical();
	GUILayout.Space(8);
	GUILayout.Label("", "Divider");
	
	//make screen titles
	if(playerData.characterDone)	{
		GUILayout.Label("Challenge Select");
	}
	else	{
		GUILayout.Label("Necromancer Select");
	}
	
	//character selected name display/change
	if(playerData.viewing || playerData.characterDone)		{
		var maxNecro : int = 1;
		if(redGemsMain > 7 || blueGemsMain > 3 || purpleGemsMain > 1) {maxNecro = 2;}
		if(redGemsMain > 19 || blueGemsMain > 9 || purpleGemsMain > 4) {maxNecro = 3;}
		if(redGemsMain > 39 || blueGemsMain > 19 || purpleGemsMain > 9) {maxNecro = 4;}
		if(maxNecro > 1) {
			var oldTabNumber : int = playerData.characterSelected;
			var necroNames : String[] = unitData.characterNames[:maxNecro];
			playerData.characterSelected = GUILayout.Toolbar(playerData.characterSelected, necroNames);
			if(oldTabNumber != playerData.characterSelected) {
				CheckDiff();
				if(!playerData.effectMuted) { buttonPressSound.Play(); }
			}
		}
	}
	
	//difficulty selected name display/change
	if(playerData.difficultyDone)		{
		GUILayout.Label("", "Divider");
		var maxDiff : int = 2;
		//for each difficulty, sum gems earned
		var redGemsDiff : int = 0;
		var blueGemsDiff : int = 0;
		var purpleGemsDiff : int = 0;
		for(var o : int = 0; o < 5; o++)	{
			//for each opponent char
			for(var p : int = 0; p < 4; p++)		{	
				var gemFinder : int = playerData.characterSelected*20 + o*4 + p;
				if(playerData.gems[gemFinder] >= 1)			{
					redGemsDiff += 1;
				}
				if(playerData.gems[gemFinder] >= 2)			{
					blueGemsDiff += 1;
				}
				if(playerData.gems[gemFinder] == 3)			{
					purpleGemsDiff += 1;
				}
			}
		}	
		if(redGemsDiff > 4 || blueGemsDiff > 2 || purpleGemsDiff > 0) {maxDiff = 3;}
		if(redGemsDiff > 9 || blueGemsDiff > 4 || purpleGemsDiff > 2) {maxDiff = 4;}
		var oldDiffNumber : int = playerData.difficultySelected;
		var diffNames : String[] = unitData.difficultyNames[:maxDiff];
		playerData.difficultySelected = GUILayout.Toolbar(playerData.difficultySelected, diffNames);
		if(oldDiffNumber != playerData.difficultySelected) {
			if(!playerData.effectMuted) { buttonPressSound.Play(); }
		}
	}
	
	//difficulty select
	if(!needsBottom) { 
		scrollPosition[0] = GUILayout.BeginScrollView(scrollPosition[0], false, false);
		//button creations
		DrawButtons();
		GUILayout.EndScrollView();
		
		//back button
		GUILayout.BeginHorizontal();
		GUILayout.Label("", "Divider");
		if(GUILayout.Button ("Back", "ShortButton")) {			
			playerData.characterDone = false;
			AdjustModels();
			if(!playerData.effectMuted) { buttonPressSound.Play(); }
		}
		GUILayout.Label("", "Divider");
		GUILayout.EndHorizontal();		
	}
	
	//close layout
	GUILayout.EndVertical();	
}

function CheckDiff () {
	var maxDiff : int = 1;
	//for each difficulty, sum gems earned
	var redGemsDiff : int = 0;
	var blueGemsDiff : int = 0;
	var purpleGemsDiff : int = 0;
	for(var o : int = 0; o < 5; o++)	{
		//for each opponent char
		for(var p : int = 0; p < 4; p++)		{	
			var gemFinder : int = playerData.characterSelected*20 + o*4 + p;
			if(playerData.gems[gemFinder] >= 1)			{
				redGemsDiff += 1;
			}
			if(playerData.gems[gemFinder] >= 2)			{
				blueGemsDiff += 1;
			}
			if(playerData.gems[gemFinder] == 3)			{
				purpleGemsDiff += 1;
			}
		}
	}	
	if(redGemsDiff > 4 || blueGemsDiff > 2 || purpleGemsDiff > 0) {maxDiff = 2;}
	if(redGemsDiff > 9 || blueGemsDiff > 4 || purpleGemsDiff > 2) {maxDiff = 3;}	
	if(playerData.difficultySelected > maxDiff) { playerData.difficultySelected = maxDiff; }
}

function DoMyWindow1 (windowID : int) {
	if(frozen) { GUI.enabled = false; }
	else { GUI.enabled = true; }
	
	GUILayout.BeginVertical();
	GUILayout.Space(8);
	GUILayout.Label("", "Divider");

//	scrollPosition = GUILayout.BeginScrollView(scrollPosition, false, false);
	//button creations
	DrawButtons();
//	GUILayout.EndScrollView();
	if(!playerData.viewing || playerData.characterDone) {
		//back button
		GUILayout.BeginHorizontal();
		GUILayout.Label("", "Divider");
		if(GUILayout.Button ("Back", "ShortButton")) {
			if(playerData.difficultyDone)		{
				playerData.difficultyDone = false;
			}
			else		{
				Application.LoadLevel("MainMenu");
			}
			if(!playerData.effectMuted) { buttonPressSound.Play(); }
		}
		GUILayout.Label("", "Divider");
		GUILayout.EndHorizontal();
	}
	//close layout
	GUILayout.EndVertical();		
}

function DoMyWindow2 (windowID : int) {
	if(frozen) { GUI.enabled = false; }
	else { GUI.enabled = true; }
	GUI.BringWindowToBack(2);
	GUI.BringWindowToBack(0);
	GUILayout.BeginVertical();
	GUILayout.Space(8);
	GUILayout.Label("", "Divider");
	GUILayout.Space(20);
	GUILayout.BeginHorizontal();
	GUILayout.FlexibleSpace();
	//for each difficulty, sum gems earned
	redGems = 0;
	blueGems = 0;
	purpleGems = 0;
	for(var o : int = 0; o < 5; o++)	{
		//for each opponent char
		for(var p : int = 0; p < 4; p++)		{	
			var gemFinder : int = playerData.characterSelected*20 + o*4 + p;
			if(playerData.gems[gemFinder] >= 1)			{
				redGems += 1;
			}
			if(playerData.gems[gemFinder] >= 2)			{
				blueGems += 1;
			}
			if(playerData.gems[gemFinder] == 3)			{
				purpleGems += 1;
			}
		}
	}
	GUILayout.Box ("", redGemStyle);
	GUILayout.Box ("" + redGems + " / 20", "LightOutlineText");
	GUILayout.FlexibleSpace();
	GUILayout.Box ("", blueGemStyle);
	GUILayout.Box ("" + blueGems + " / 20", "LightOutlineText");
	GUILayout.FlexibleSpace();
	GUILayout.Box ("", purpleGemStyle);
	GUILayout.Box ("" + purpleGems + " / 20", "LightOutlineText");
	GUILayout.FlexibleSpace();
	GUILayout.EndHorizontal();

	GUILayout.Label("Necromancer Information");
	var oldViewTabNumber : int = viewTab;
	viewTab = GUILayout.Toolbar(viewTab, viewTabNames);	
	if(oldViewTabNumber != viewTab) {
		if(!playerData.effectMuted) { buttonPressSound.Play(); }
	}
	
	var viewTarget : int = playerData.characterSelected;
	if(viewTab == 0) {
		scrollPosition[1] = GUILayout.BeginScrollView(scrollPosition[1], false, false);
		var skillTooltips : String[] = new String[5];
	    skillTooltips[0] = unitData.skillTooltips[playerData.characterSelected, 0];
	    skillTooltips[1] = unitData.skillTooltips[playerData.characterSelected, 1];
	    skillTooltips[2] = unitData.skillTooltips[playerData.characterSelected, 2];
	    skillTooltips[3] = unitData.skillTooltips[playerData.characterSelected, 3];
	    skillTooltips[4] = unitData.skillTooltips[playerData.characterSelected, 4];
	    var skillTooltipNumbers : String[] = new String[5];
	    skillTooltipNumbers[0] = unitData.skillTooltipInfo[playerData.characterSelected, 0];
	    skillTooltipNumbers[1] = unitData.skillTooltipInfo[playerData.characterSelected, 1];
	    skillTooltipNumbers[2] = unitData.skillTooltipInfo[playerData.characterSelected, 2];
	    skillTooltipNumbers[3] = unitData.skillTooltipInfo[playerData.characterSelected, 3];
	    skillTooltipNumbers[4] = unitData.skillTooltipInfo[playerData.characterSelected, 4];
	    var skillNames : String[] = new String[5];
	    skillNames[0] = unitData.passiveNames[playerData.characterSelected];
	    skillNames[1] = unitData.skillOneNames[playerData.characterSelected];
	    skillNames[2] = unitData.skillTwoNames[playerData.characterSelected];
	    skillNames[3] = unitData.skillThreeNames[playerData.characterSelected];
	    skillNames[4] = unitData.ultimateNames[playerData.characterSelected];
	    GUILayout.FlexibleSpace();
	    GUILayout.BeginHorizontal();
		for(var i : int = 0; i < 5; i++)	{	
			var skillTooltip : String = skillNames[i] + "$" + skillTooltips[i] + "$" + skillTooltipNumbers[i];
			GUILayout.FlexibleSpace();
			GUILayout.Label(GUIContent("", skillTooltip), skillIconStyles[viewTarget, i], GUILayout.Width(60));				
		}
		GUILayout.FlexibleSpace();
		GUILayout.EndHorizontal();
		GUILayout.Space(10);
		GUILayout.BeginHorizontal();
		
		GUILayout.FlexibleSpace();
		GUILayout.BeginVertical();
		
		GUILayout.FlexibleSpace();
		GUILayout.BeginHorizontal();
		GUILayout.Box(GUIContent("Health", "Units are defeated\nwhen Health reaches 0"), "BoldOutlineText");
		GUILayout.Space(10);
		GUILayout.Box(GUIContent("[ " + unitData.baseHealth[viewTarget].ToString("F0") + " ]", "Maximum Health at Level 1"),"LegendaryText");
		GUILayout.Space(5);
		GUILayout.Box(GUIContent("+ " + unitData.growthHealth[viewTarget],"Health Growth per Level"),"CursedText");
		GUILayout.FlexibleSpace();
		GUILayout.EndHorizontal();	
		
		GUILayout.FlexibleSpace();
		GUILayout.BeginHorizontal();
		GUILayout.Box(GUIContent("Health Regeneration", "Amount of Health\nregenerated each second"), "BoldOutlineText");
		GUILayout.Space(10);
		GUILayout.Box(GUIContent("[ " + unitData.baseHealthRegen[viewTarget].ToString("F0") + " ]", "Health Regeneration\nat Level 1"),"LegendaryText");
		GUILayout.Space(5);
		GUILayout.Box(GUIContent("+ " + unitData.growthHealthRegen[viewTarget],"Health Regeneration\nGrowth per Level"),"CursedText");
		GUILayout.FlexibleSpace();
		GUILayout.EndHorizontal();			
		
		if(viewTarget != 0) {			
			var manaName : String;
			var manaTooltip : String;
			var manaTooltip1 : String;
			var manaTooltip2 : String;
			var manaRegenTooltip : String;
			var manaRegenTooltip1 : String;
			var manaRegenTooltip2 : String;
			var manaLetter : String;
			switch (viewTarget) {
			case 1: 
				manaName = "Insight";
				manaLetter = "10";
				manaTooltip = "Rosalind uses Insight\nto execute her skills";
				manaTooltip1 = "Maximum Insight";
				manaRegenTooltip = "Amount of Insight\ngenerated each attack";
				manaRegenTooltip1 = "Insight Generation";
				break;
			case 2: 
				manaName = "Mana";
				manaLetter = "" + unitData.baseResourceRegen[viewTarget];
				manaTooltip = "Leonardo uses Mana\nto execute his skills";
				manaTooltip1 = "Maximum Mana at Level 1";
				manaTooltip2 = "Mana Growth per Level";
				manaRegenTooltip = "Amount of Mana\nregenerated each second";
				manaRegenTooltip1 = "Mana Regeneration\nat Level 1";
				manaRegenTooltip2 = "Mana Regeneration\nGrowth per Level";
				break;
			case 3: 
				manaName = "Energy";
				manaLetter = "" + unitData.baseResourceRegen[viewTarget];
				manaTooltip = "Graviton uses Energy\nto execute his skills";
				manaTooltip1 = "Maximum Energy at Level 1";
				manaTooltip2 = "Energy Growth per Level";
				manaRegenTooltip = "Amount of Energy\nregenerated each second";
				manaRegenTooltip1 = "Energy Regeneration\nat Level 1";
				manaRegenTooltip2 = "Energy Regeneration\nGrowth per Level";
				break;
			}
			
			GUILayout.FlexibleSpace();
			GUILayout.BeginHorizontal();
			GUILayout.Box(GUIContent(manaName, manaTooltip), "BoldOutlineText");
			GUILayout.Space(10);
			GUILayout.Box(GUIContent("[ " + unitData.baseResource[viewTarget].ToString("F0") + " ]",manaTooltip1),"LegendaryText");
			GUILayout.Space(5);
			if(viewTarget > 1) { GUILayout.Box(GUIContent("+ " + unitData.growthResource[viewTarget],manaTooltip2),"CursedText"); }
			GUILayout.FlexibleSpace();
			GUILayout.EndHorizontal();
			
			GUILayout.FlexibleSpace();
			GUILayout.BeginHorizontal();
			GUILayout.Box(GUIContent(manaName + " Regeneration", manaRegenTooltip), "BoldOutlineText");
			GUILayout.Space(10);
			if(viewTarget > 1) { GUILayout.Box(GUIContent("[ " + unitData.baseResourceRegen[viewTarget].ToString("F0") + " ]", manaRegenTooltip1),"LegendaryText"); }
			else { GUILayout.Box(GUIContent("[ 10 ]", manaRegenTooltip1),"LegendaryText");  }
			GUILayout.Space(5);
			if(viewTarget > 1) { GUILayout.Box(GUIContent("+ " + unitData.growthResourceRegen[viewTarget], manaRegenTooltip2),"CursedText"); }
			GUILayout.FlexibleSpace();
			GUILayout.EndHorizontal();				
		}
		GUILayout.FlexibleSpace();
		GUILayout.EndVertical();
		GUILayout.FlexibleSpace();
		GUILayout.BeginVertical();
		
		GUILayout.FlexibleSpace();
		GUILayout.BeginHorizontal();
		GUILayout.Box(GUIContent("Attack Speed", "The number of basic attacks\nperformed each second"), "BoldOutlineText");
		GUILayout.Box(GUIContent("[" + unitData.baseAttackSpeed[viewTarget].ToString("F0") + " ." + unitData.baseAttackSpeed[viewTarget].ToString("F1")[2] + "]", ""),"LegendaryText");		
		GUILayout.FlexibleSpace();
		GUILayout.Box(GUIContent("Attack Range", "The maximum distance\na basic attack can travel"), "BoldOutlineText");
		GUILayout.Box(GUIContent("[" + unitData.baseAttackRange[viewTarget].ToString("F0") + "]", ""),"LegendaryText");		
		GUILayout.FlexibleSpace();
		GUILayout.EndHorizontal();	
		
		GUILayout.FlexibleSpace();
		GUILayout.BeginHorizontal();
		//GUILayout.FlexibleSpace();
		GUILayout.Box(GUIContent("Attack Damage", "The amount of damage\ndealt by basic attacks"), "BoldOutlineText");
		GUILayout.Space(10);
		GUILayout.Box(GUIContent("[ " + unitData.baseAttackDamage[viewTarget].ToString("F0") + " ]", "Attack Damage at Level 1"),"LegendaryText");
		GUILayout.Space(5);
		GUILayout.Box(GUIContent("+ " + unitData.growthAttackDamage[viewTarget],"Attack Damage\nGrowth per Level"),"CursedText");
		GUILayout.FlexibleSpace();
		GUILayout.EndHorizontal();	
		
		GUILayout.FlexibleSpace();
		GUILayout.BeginHorizontal();
		//GUILayout.FlexibleSpace();
		GUILayout.Box(GUIContent("Damage Reduction", "The percentage of\ndamage mitigated"), "BoldOutlineText");
		GUILayout.Space(10);
		GUILayout.Box(GUIContent("[ " + unitData.baseDamageReduction[viewTarget].ToString("F0") + " ]", "Damage Reduction\nat Level 1"),"LegendaryText");
		GUILayout.Space(5);
		GUILayout.Box(GUIContent("+ " + unitData.growthDamageReduction[viewTarget],"Damage Reduction\nGrowth per Level"),"CursedText");
		GUILayout.FlexibleSpace();
		GUILayout.EndHorizontal();
		
		GUILayout.FlexibleSpace();
		GUILayout.BeginHorizontal();
		//GUILayout.FlexibleSpace();
		GUILayout.Box(GUIContent("Movement Speed", "Run speed"), "BoldOutlineText");
		GUILayout.Space(10);
		GUILayout.Box(GUIContent("[ " + unitData.baseMovementSpeed[viewTarget].ToString("F1") + " ]", "Movement Speed at Level 1"),"LegendaryText");
		GUILayout.Space(5);
		GUILayout.Box(GUIContent("+ " + unitData.growthMovementSpeed[viewTarget].ToString("F1"),"Movement Speed\nGrowth per Level"),"CursedText");
		GUILayout.FlexibleSpace();
		GUILayout.EndHorizontal();
		
		GUILayout.FlexibleSpace();		
		GUILayout.EndVertical();
		GUILayout.FlexibleSpace();
		GUILayout.EndHorizontal();
		
		GUILayout.EndScrollView();		
	}
	else if(viewTab == 1) {		
		switch(viewTarget) {
		case 0:
			scrollPosition[2] = GUILayout.BeginScrollView(scrollPosition[2], false, false);
			GUILayout.Box("Specialty : Poison					 Species : Erligrade							Origin : Earth\n\n"
				+ "\" Pressure makes diamonds. \"\n- General George S. Patton, Jr.\n\nThe Toxic Commander\n\n"
				+ "The erligrade evolved from the tardigrade in the late half of the 21st century on the Great Pacific garbage patch. As the increasingly dangerous toxins killed off the native wildlife and made the region inhospitable to all but the most hardy organisms, the tardigrade thrived. Millenia of survival in the harshest environments known to life prepared the tardigrade to rapidly adapt to the concoction of chemicals created and casually discarded by the homo sapiens.\n\nIn the early 22nd century, the newly dominate homo novas set out to correct the failures of their predecessors and began the process of cleaning planet Earth. The Great Pacific garbage patch, now roughly the size of Russia, was an obvious target for these efforts, but the novas were met with fierce resistance by the newly indigenous species. After several failed attempts to relocate the erligrades to cleaner environments, the novas sealed off the region and relinquished permanent control to the erligrades.\n\nMost erligrades were content with the new peace, but a group of disgruntled extraction survivors banded together and formed the Anti-Human Advocacy Alliance. Without an imminent threat, the alliance failed to gain traction in the erligarde populace for many years.\n\nThe peace had held for thirty years when Ralph swam into Mossterra, an erligrade city on the eastern border of the Erligrade Territory. As one of the closest cities to human civilization, Mossterra was home to one the largest AHAA outposts. When Ralph’s cousin, Wasserbar, encountered his long lost relative meandering raggedly through the sludge, he knew immediately that the AHAA finally had the catalyst they needed to unite the erligrade public against the sapiens.\n\nRalph was a young erligrade when his village was targeted by a forced extraction team. After the conflict ended, many of the extracted erligrades were returned home, but a large number remained missing and were assumed to be casualties of the rebellion. Unbeknownst to the novas, a powerful group of sapien extremists had performed unsanctioned, secret extractions and continued to hold large numbers of erligrades captive. The sapiens sought to discover a weakness in the erligrades, who they believed to be diseased abominations sent from hell to bring about the apocalypse, through rigorous and violent experimentation.\n\nAfter decades of imprisonment, Ralph finally escaped when a stroke of luck allowed him to slip into an old sewer system that was thought to be sealed. The infrastructure in place by the AHAA allowed Ralph to quickly spread his tale of torture and terror throughout the erligrade population. Determined to free his kin and prevent the humans from harming his people again, he converted the AHAA into a militia force and mounted an attack on his former captors.\n\nThe attack caught the sapiens completely by surprise and resulted in a resounding victory for Ralph and the AHAA. After hundreds of missing erligrades returned home from captivity, the public hailed the AHAA as the greatest heroes in erligrade history.\n\nThe sapiens, angered by their loses in the erligrade attack, retaliated against an unsuspecting erligrade settlement. The conflict escalated to an all-out war between the sapiens and erligrades. Under Ralph’s leadership, the erligrades made rapid strides in the war. The outcome of the fighting seemed inevitable, until a poorly coordinated attack resulted in the deaths of three nova civilians. The nova’s entrance into the war marked an end for Ralph’s progress, and the erligrades were beaten back and blockaded within the borders of the former Great Pacific garbage patch.\n\nDesperate and without options, Ralph turned to the darkest and most powerful hybrid of science and magic known to Earth, Necromancy. As the first erligrade Necromancer, Ralph discovered that the innate toxicity of his species could be channelled into the energy necessary to animate the dead.\n\nFueled by his newfound power, Ralph sought to break the blockade. The remnants of the AHAA rallied behind him in a last, frantic attempt to strike back at the humans. The battle was the most destructive blow ever struck against the novas in their brief history. Unknown to the erligrades, the novas were also facing interplanetary conflicts with the newly discovered planet Yetire and the arrival of a mysterious stranger from a distant star system.\n\nOvershadowed by the power of Necromancy and unwilling to risk more lives to conflict against invisible foes, the nova leadership devised a plan to limit the fighting to the tiny subset of individuals capable of tipping the scales of balance. The Interstellar Milkyway Treaty was adopted by each side, an agreement to settle all disputes by individual combat between the galaxy’s most powerful warlords.\n\nA great arena was constructed as the battleground of the Necromancers, so that they may wage their war for all eternity.");
			GUILayout.EndScrollView();
			break;
		case 1:
			scrollPosition[3] = GUILayout.BeginScrollView(scrollPosition[3], false, false);
			GUILayout.Box("Specialty : Blood					 Species : Homo nova							Origin : Mars\n\n"
				+ "\" In battle, if you make your opponent flinch, you have already won. \"\n- Miyamoto Musashi\n\nThe Red Warrior\n\n"
				+ "At the turn of the 22nd century, novas declared themselves as a new multi-planetary species, distinctly evolved from sapiens by fusion with technology. The sapiens resolute refusal to adapt to the rapid growth of scientific and technological advancement left them helpless against the sudden surge of nova achievements. The new species became dominant within years.\n\nThe novas sought to right the wrongs of their predecessors on Earth and begin a new age of interstellar exploration, but both goals were met with unprecedented opposition that resulted in the novas playing a central role in an interstellar war known as the Great Conflict.\n\nRosalind was the first child born to the sapien colonists on Mars. She spent much of her adult years governing a thriving colony on Europa after volunteering to lead the initial settlement of Jupiter’s hospitable moon. Her fascination with the sword began at an early age and she performed daily drills for decades to perfect her craft. When the conflict with the planet Yetire of the Alpha Centauri star system began, she returned to Mars to aid in the construction of the Nova Strategic Defense Fleet. The NSDF was successful, but ultimately unsustainable due to the immense resource cost of defending multiple human planets, satellites and space stations.\n\nWith technology alone unable to provide the power necessary to mount a sustainable defense against the Yetirian onslaught, Rosalind turned to Necromancy in a frantic attempt.to gain any possible advatage. She buried herself in studies of blood magic and bionics. The results were beyond her wildest dreams, but she soon learned that even her new found power was not enough to defend the numerous human colonies spread throughout the solar system.\n\nWhen the Interstellar Milkyway Treaty was proposed, Rosalind volunteered to represent her people as an eternal combatant in the War of the Necromancers.");				
			GUILayout.EndScrollView();
			break;
		case 2:
			scrollPosition[4] = GUILayout.BeginScrollView(scrollPosition[4], false, false);
			GUILayout.Box("Specialty : Elements					 Species : Metoh							Origin : Yetire\n\n"
				+"\" Death is nothing, but to live defeated and inglorious is to die daily. \"\n- Napoleon Bonaparte\n\nThe Frozen Conqueror\n\n"
				+ "	The metoh species gained dominance over the planet Yetire using magic, an innate connection to energy and matter. Every metoh is born with the ability to manipulate the atomic structure of the world around them. Unlike humans, the metoh never had the need to develop technology and failed to reach the level of communication necessary to promote peace on the planet. Metoh tribes battled ceaselessly for territorial control on Yetire’s mountainous supercontinent.\n\nThe planet of Yetire had long been immersed in violent struggle when the first sapien probe broke the cloudy, freezing atmosphere and heralded the discovery of extraterrestrial life forms for both species. While the humans regarded this as a monumental discovery, the metoh saw only a new opponent encroaching upon their homes. The probe was captured by a large tribe of metohs within days of its arrival.\n\nLeonardo, the leader of the tribe and a powerful Necromancer, was intrigued by the machine and ordered his most adept mages to unlock the mysteries of the invader. After years of studying the probe, the tribe was able to dissect enough of its secrets to begin the process of technological armament.\n\nWith the fusion of magic and technology, Leonardo’s conquest of Yetire was unstoppable and the Kangmi Empire was born. He quickly subjugated the many metoh tribes and began building a fleet of magic-fueled starships to further his empire in the worlds beyond the clouds.\n\nThe metoh’s starships were met with unprecedented resistance from the Nova Strategic Defense Fleet and the Kangmi Empire was forced to halt its invasion. After the secrets of the metoh magic were reverse engineered by the novas, Leonardo was forced to reconsider his position.\n\nSeeking an opportunity to once again gain an advantage on his adversaries, Leonardo agreed to the Interstellar Milkyway Treaty so that he could personally crush his foes until the end of time.");
			GUILayout.EndScrollView();
			break;
		case 3:
			scrollPosition[5] = GUILayout.BeginScrollView(scrollPosition[5], false, false);
			GUILayout.Box("Specialty : Gravity					Species : Unknown				 Origin : Unknown\n\n"
				+"\" All men can see these tactics whereby I conquer,\nbut what none can see is the strategy out of which victory is evolved. \"\n- Sun Tzu\n\nThe Mysterious Stranger\n\n"
				+ "Graviton mysteriously appeared on Earth at the height of the Great Conflict wielding power and technology hitherto unimagined by humans. While his intentions are unknown, it’s believed that Graviton played a key role in convincing the warring societies to participate in the Interstellar Milkyway Treaty. Graviton demanded participation in the treaty on behalf of his people, despite being the only member of his species to ever make contact with the novas, metohs or erligrades. His origin still remains a puzzle.\n\nPerhaps additional victories on the battlefield will unlock the secrets of this enigmatic visitor.");
			GUILayout.EndScrollView();
			break;
		}
		GUILayout.FlexibleSpace();
		GUILayout.FlexibleSpace();
	}
	else {		
		switch(viewTarget) {
		case 0:
			scrollPosition[6] = GUILayout.BeginScrollView(scrollPosition[6], false, false);
			GUILayout.Box("\" Attack rapidly, ruthlessly, viciously, without rest,\nhowever tired and hungry you may be, the enemy will be more tired, more hungry.\nKeep punching. \"\n- General George S. Patton, Jr."  
				+ "\n\n\" The art of war is simple enough.\nFind out where your enemy is. Get at him as soon as you can.\nStrike him as hard as you can, and keep moving on. \"\n- Ulysses S. Grant" +
				"\n\n\" Always mystify, mislead and surprise the enemy if possible. \"\n- Thomas Jonathan 'Stonewall' Jackson" +
				"\n\n\" In preparing for battle I have always found that plans are useless,\nbut planning is indispensable. \"\n- Dwight D. Eisenhower");
			GUILayout.EndScrollView();
			break;
		case 1:
			scrollPosition[7] = GUILayout.BeginScrollView(scrollPosition[7], false, false);
			GUILayout.Box("\" When you decide to attack, keep calm and dash in quickly, forestalling the enemy...\nattack with a feeling of constantly crushing the enemy, from first to last. \"\n- Miyamoto Musashi"
				 + "\n\n\" It is easy to kill someone with a slash of a sword.\nIt is hard to be impossible for others to cut down. \"\n- Yagyu Munenori" +
				"\n\n\" Mental bearing, not skill, is the sign of a matured samurai.\nA samurai therefore should neither be pompous nor arrogant. \"\n- Tsukahara Bokuden" + 				
				"\n\n\" The undisturbed mind is like the calm body water reflecting the brilliance of the moon.\nEmpty the mind and you will realize the undisturbed mind. \"\n- Yagyu Jubei");
			GUILayout.EndScrollView();
			break;
		case 2:
			scrollPosition[8] = GUILayout.BeginScrollView(scrollPosition[8], false, false);
			GUILayout.Box("\" The battlefield is a scene of constant chaos.\nThe winner will be the one who controls that chaos,\nboth his own and the enemies. \"\n- Napoleon Bonaparte" +
				"\n\n\" I am not afraid of an army of lions led by a sheep;\nI am afraid of an army of sheep led by a lion. \"\n- Alexander the Great" +
				"\n\n\" Do not underestimate the power of an enemy,\nno matter how great or small,\nto rise against you another day. \"\n- Atilla the Hun" +
				"\n\n\" Hasten slowly. \"\n- Augustus");
			GUILayout.EndScrollView();
			break;
		case 3:
			scrollPosition[9] = GUILayout.BeginScrollView(scrollPosition[9], false, false);
			GUILayout.Box("\" All warfare is based on deception. \"\n- Sun Tzu" +
				"\n\n\" All fixed set patterns are incapable of adaptability or pliability.\nThe truth is outside of all fixed patterns. \"\n- Bruce Lee" +
				"\n\n\" It does not matter how slowly you go so long as you do not stop. \"\n- Confucius" +
				"\n\n\" Some warriors look fierce, but are mild.\nSome seem timid, but are vicious.\nLook beyond appearances; position yourself for the advantage. \"\n- Deng Ming-Dao"	);
			GUILayout.EndScrollView();
			break;
		}
		GUILayout.FlexibleSpace();
		GUILayout.FlexibleSpace();
	}
	//GUILayout.FlexibleSpace();		
		
	//back button
	GUILayout.BeginHorizontal();
	GUILayout.Label("", "Divider");
	if(GUILayout.Button ("Back", "ShortButton")) {
		playerData.viewing = false;
		AdjustModels();
		if(!playerData.effectMuted) { buttonPressSound.Play(); }
	}
	GUILayout.Label("", "Divider");
	GUILayout.EndHorizontal();

	//close layout
	GUILayout.EndVertical();	
	
	if(Event.current.type == EventType.Repaint) {	 tooltipString = GUI.tooltip;	}
}

function DrawButtons() {
	var needsTooltip : boolean = true;
	//opponent select
	if(playerData.difficultyDone)	{
		GUILayout.Label("Select Opponent");
		GUILayout.BeginHorizontal();
		for(var i = 0; i < 4; i++)		{
			//create correct gem reference
			challengeNumber = (playerData.characterSelected * 20) + (playerData.difficultySelected * 4) + i;
			GUILayout.BeginVertical();
			GUILayout.BeginHorizontal();
			GUILayout.FlexibleSpace();
			//for each opponent char, sum gems earned
			redGems = 0;
			blueGems = 0;
			for(var k : int = 0; k < 4; k++)	{
				if(playerData.gems[playerData.characterSelected*20 + playerData.difficultySelected*4 + k] >= 1)		{		redGems += 1;			}
				if(playerData.gems[playerData.characterSelected*20 + playerData.difficultySelected*4 + k] >= 2)		{		blueGems += 1;			}	
			}
			if(i == 0 || i == 1 || (i == 2 && redGems > 0) || (i == 3 && (redGems > 1 || blueGems > 0))) {
				if (GUILayout.Button (unitData.characterNames[i], GUILayout.Width(charButtonWidth))) {
					playerData.opponentSelected = i;
					playerData.challengeSelected = challengeNumber;
					AnimateSelection(1);				
				}
			}
			else {
				var lockTooltips : String;
				switch(i) {
				case 2:
					lockTooltips = "1";
					break;
				case 3:
					lockTooltips = "2,1";
					break;
				}
				GUI.enabled = false;
				GUILayout.Button (GUIContent(unitData.characterNames[i], lockTooltips), GUILayout.Width(charButtonWidth));
				GUI.enabled = true;
			}
			GUILayout.FlexibleSpace();
			GUILayout.EndHorizontal();
			GUILayout.BeginHorizontal();
			GUILayout.FlexibleSpace();			
			var minutes : int = playerData.challengeTimes[challengeNumber] / 60;
	 	  	var seconds : int = playerData.challengeTimes[challengeNumber] % 60;
	 	  	var secondsText : String = "" + seconds;
			if(seconds < 10) {  secondsText = "0" + secondsText; }
			var timeString : String = "" + minutes + " : " + secondsText;
			switch(playerData.gems[challengeNumber]) {
			case 0:
				GUILayout.Box("New !", "CursedText");
				break;
			case 1:				
				GUILayout.Box("", redGemStyle);
				GUILayout.Box(timeString, "BoldText");
				break;
			case 2:
				GUILayout.Box("", redGemStyle);
				GUILayout.Box("", blueGemStyle);
				GUILayout.Box(timeString, "BoldText");
				break;
			case 3:
				GUILayout.Box("", redGemStyle);
				GUILayout.Box("", blueGemStyle);
				GUILayout.Box("", purpleGemStyle);
				GUILayout.Box(timeString, "BoldText");
				break;
			}			
			GUILayout.FlexibleSpace();
			GUILayout.EndHorizontal();
			GUILayout.EndVertical();
		}
		GUILayout.EndHorizontal();

	}
	//difficulty select
	else if(playerData.characterDone)	{	
		GUILayout.Label("Select Difficulty");
		GUILayout.FlexibleSpace();	
		//for each difficulty, sum gems earned
		var redGemsDiff : int = 0;
		var blueGemsDiff : int = 0;
		var purpleGemsDiff : int = 0;
		for(var o : int = 0; o < 5; o++)	{
			//for each opponent char
			for(var p : int = 0; p < 4; p++)		{	
				var gemFinder : int = playerData.characterSelected*20 + o*4 + p;
				if(playerData.gems[gemFinder] >= 1)			{
					redGemsDiff += 1;
				}
				if(playerData.gems[gemFinder] >= 2)			{
					blueGemsDiff += 1;
				}
				if(playerData.gems[gemFinder] == 3)			{
					purpleGemsDiff += 1;
				}
			}
		}		
		for(var j : int = 0; j < 5; j++)	{
			GUILayout.BeginVertical();
			GUILayout.FlexibleSpace();
			GUILayout.BeginHorizontal();
			GUILayout.FlexibleSpace();
			GUILayout.BeginVertical();
			GUILayout.FlexibleSpace();
			if(j == 4) {
				GUI.enabled = false;
				GUILayout.Button("Coming Soon!", GUILayout.Width(diffButtonWidth));
				GUI.enabled = true;	
			}
			else {
				if(j == 0 || j == 1 || (j == 2 && (redGemsDiff > 4 || blueGemsDiff > 2 || purpleGemsDiff > 0)) || (j == 3 && (redGemsDiff > 9 || blueGemsDiff > 4 || purpleGemsDiff > 2))) {
					if(GUILayout.Button (unitData.difficultyNames[j], GUILayout.Width(diffButtonWidth))) {					
						playerData.difficultySelected = j;
						playerData.difficultyDone = true;
						AdjustModels();
						if(!playerData.effectMuted) { buttonPressSound.Play(); }
					}
				}
				else {
					var lockTooltip0 : String;
					switch(j) {
					case 2:
						lockTooltip0 = "3..5,3,1";
						break;
					case 3:
						lockTooltip0 = "4..10,6,3";
						break;
					}
					GUI.enabled = false;
					GUILayout.Button (GUIContent(unitData.difficultyNames[j], lockTooltip0), GUILayout.Width(diffButtonWidth));
					GUI.enabled = true;
				}
			}
			GUILayout.FlexibleSpace();
			GUILayout.EndVertical();
			GUILayout.FlexibleSpace();
			//for each opponent char, sum gems earned
			redGems = 0;
			blueGems = 0;
			purpleGems = 0;
			for(k = 0; k < 4; k++)	{
				if(playerData.gems[playerData.characterSelected*20 + j*4 + k] >= 1)		{
					redGems += 1;
				}
				if(playerData.gems[playerData.characterSelected*20 + j*4 + k] >= 2)		{
					blueGems += 1;
				}
				if(playerData.gems[playerData.characterSelected*20 + j*4 + k] == 3)		{
					purpleGems += 1;
				} 	 	
			}
			GUILayout.BeginVertical();
			GUILayout.FlexibleSpace();
			GUILayout.BeginHorizontal();
			GUILayout.FlexibleSpace();
//			GUILayout.Box ("Red Gems : " + redGems + " / 4", GUILayout.Width(gemWidth));
//			GUILayout.FlexibleSpace();
//			GUILayout.Box ("Blue Gems : " + blueGems + " / 4", GUILayout.Width(gemWidth));
//			GUILayout.FlexibleSpace();
//			GUILayout.Box ("Purple Gems : " + purpleGems + " / 4", GUILayout.Width(gemWidth));			
			GUILayout.Box ("", redGemStyle);
			GUILayout.Box ("" + redGems + " / 4", "LightOutlineText", GUILayout.Width(40));
			GUILayout.FlexibleSpace();
			GUILayout.Box ("", blueGemStyle);
			GUILayout.Box ("" + blueGems + " / 4", "LightOutlineText", GUILayout.Width(40));
			GUILayout.FlexibleSpace();
			GUILayout.Box ("", purpleGemStyle);
			GUILayout.Box ("" + purpleGems + " / 4", "LightOutlineText", GUILayout.Width(40));
			GUILayout.FlexibleSpace();
			GUILayout.EndHorizontal();						
			GUILayout.FlexibleSpace();
			GUILayout.EndVertical();
			
			GUILayout.FlexibleSpace();
			GUILayout.EndHorizontal();
			GUILayout.FlexibleSpace();
			GUILayout.EndVertical();
			GUILayout.FlexibleSpace();
		}
	}
	//view char
	else if(playerData.viewing)	{		
		needsTooltip = false;
		GUILayout.FlexibleSpace();
		GUILayout.FlexibleSpace();
		GUILayout.BeginHorizontal();
		GUILayout.FlexibleSpace();
		GUILayout.BeginVertical();
//		GUILayout.FlexibleSpace();
		GUILayout.Space(9);
		if(GUILayout.Button ("\nSelect\n" + unitData.characterNames[playerData.characterSelected] + "\n\n", GUILayout.Width(100))) {
			AnimateSelection(0);
		}
//		GUILayout.FlexibleSpace();
		GUILayout.EndVertical();
		GUILayout.FlexibleSpace();
		GUILayout.EndHorizontal();
		GUILayout.FlexibleSpace();
	}
	//char select
	else	{
		GUILayout.FlexibleSpace();
		GUILayout.BeginHorizontal();
		for(var l = 0; l < 4; l++)		{
			GUILayout.BeginVertical();			
			//buttons
			GUILayout.FlexibleSpace();
			GUILayout.BeginHorizontal();
			GUILayout.FlexibleSpace();
			if(l == 0 || (l == 1 && (redGemsMain > 7 || blueGemsMain > 3 || purpleGemsMain > 1)) || (l == 2 && (redGemsMain > 19 || blueGemsMain > 9 || purpleGemsMain > 4))
				|| (l == 3 && (redGemsMain > 39 || blueGemsMain > 19 || purpleGemsMain > 9))) {
				if (GUILayout.Button (unitData.characterNames[l], GUILayout.Width(charButtonWidth))) {
					playerData.characterSelected = l;
					playerData.viewing = true;
					AdjustModels();
					if(!playerData.effectMuted) { buttonPressSound.Play(); }
				}
			}
			else {
				var lockTooltip : String;
				switch(l) {
				case 1:
					lockTooltip = "5..8,4,2";
					break;
				case 2:
					lockTooltip = "6..20,10,5";
					break;
				case 3:
					lockTooltip = "7..40,20,10";
					break;
				}
				GUI.enabled = false;
				GUILayout.Button (GUIContent(unitData.characterNames[l], lockTooltip), GUILayout.Width(charButtonWidth));
				GUI.enabled = true;
			}
			GUILayout.FlexibleSpace();
			GUILayout.EndHorizontal();
			//for each difficulty, sum gems earned
			redGems = 0;
			blueGems = 0;
			purpleGems = 0;
			for(var m : int = 0; m < 5; m++)	{
				//for each opponent char
				for(var n : int = 0; n < 4; n++)		{
					if(playerData.gems[l*20 + m*4 + n] >= 1)	{
						redGems += 1;
					}
					if(playerData.gems[l*20 + m*4 + n] >= 2)	{
						blueGems += 1;
					}
					if(playerData.gems[l*20 + m*4 + n] == 3)	{
						purpleGems += 1;
					}
				}
			}
			GUILayout.BeginHorizontal();
			GUILayout.FlexibleSpace();
			GUILayout.BeginVertical();
			GUILayout.BeginHorizontal();
			GUILayout.Box ("", redGemStyle);
			GUILayout.Box ("" + redGems + " / 20", "LightOutlineText");
			GUILayout.EndHorizontal();	
			GUILayout.FlexibleSpace();
			GUILayout.BeginHorizontal();
			GUILayout.Box ("", blueGemStyle);
			GUILayout.Box ("" + blueGems + " / 20", "LightOutlineText");
			GUILayout.EndHorizontal();	
			GUILayout.FlexibleSpace();
			GUILayout.BeginHorizontal();
			GUILayout.Box ("", purpleGemStyle);
			GUILayout.Box ("" + purpleGems + " / 20", "LightOutlineText");
			GUILayout.EndHorizontal();	
			GUILayout.EndVertical();
			GUILayout.FlexibleSpace();
			GUILayout.EndHorizontal();		
			
			GUILayout.EndVertical();
		}
		GUILayout.EndHorizontal();
		GUILayout.FlexibleSpace();	
	}
	
	
	if(needsTooltip && Event.current.type == EventType.Repaint) {	tooltipString = GUI.tooltip;	}
}

function AnimateSelection (type : int) {
	var charNumber : int;
	var gravPart : Transform;
	for(var count : int = 0; count < 2; count++) {
		if(count == 0) {
			frozen = true;
			if(type == 0) { charNumber = playerData.characterSelected; }
			else { charNumber = playerData.opponentSelected; } 
			switch(charNumber) {
			case 0:	
				if(type == 1) {
					rosalindCamera.enabled = false;
					leonardoCamera.enabled = false;
					gravitonCamera.enabled = false;
				}
				if(!playerData.effectMuted) {	skillSoundEffects[0].volume = playerData.effectVolume/100.0; skillSoundEffects[charNumber].Play();		}
				characterAnimations[charNumber].CrossFade("skillone"); 
				yield WaitForSeconds (0.63);
				break;
			case 1:			
				if(type == 1) {
					ralphCamera.enabled = false;
					leonardoCamera.enabled = false;
					gravitonCamera.enabled = false;
				}
				if(!playerData.effectMuted) {	StartToucheSound(); }
				characterAnimations[charNumber].CrossFade("ultimate"); 
				yield WaitForSeconds (1.45);
				break;
			case 2:			
				if(type == 1) {
					rosalindCamera.enabled = false;
					ralphCamera.enabled = false;
					gravitonCamera.enabled = false;
				}
				if(!playerData.effectMuted) {	StartSpiderSound(); }
				characterAnimations[charNumber].CrossFade("skillthree"); 
				yield WaitForSeconds (1.3);
				break;
			case 3:	
				if(type == 1) {
					rosalindCamera.enabled = false;
					leonardoCamera.enabled = false;
					ralphCamera.enabled = false;
				}
				if(!playerData.effectMuted) {	StartGravitySound(); }
				anim.SetBool("idling", false);
				anim.speed = 1.0;
				anim.SetBool("menuPulling", true);
				yield WaitForSeconds (1.5);		
				break;
			}			
		}
		else {
			switch(charNumber) {
				case 0:	
					characterAnimations[charNumber].Play("walk"); 
					break;
				case 1:			
					characterAnimations[charNumber].Play("walk"); 
					break;
				case 2:			
					characterAnimations[charNumber].Play("walk"); 
					break;
				case 3:		
					anim.SetBool("menuPulling", false);	
					anim.speed = 1.0;
					anim.SetBool("idling", true);	
					anim.transform.position = Vector3(1300,0.05,0);
					break;
			}
			if(type == 0) { playerData.characterDone = true; frozen = false; }
			else { 
				ralphCamera.enabled = false;
				rosalindCamera.enabled = false;
				leonardoCamera.enabled = false;
				gravitonCamera.enabled = false;
				loadingScreen.Load("Battlefield", this.gameObject); 
			}
		}
	}	
}

function StartToucheSound () {
	for(var i : int = 0; i < 3; i++){
		switch(i) {
		case 0:			
			skillSoundEffects[1].volume = playerData.effectVolume/100.0;
			skillSoundEffects[1].pitch = 1.2;
			skillSoundEffects[1].Play();
			yield WaitForSeconds(0.55);
			break;
		case 1:
			skillSoundEffects[1].Play();
			yield WaitForSeconds(0.75);
			break;
		case 2:
			skillSoundEffects[1].Play();
			break;
		}	
	}
}

function StartSpiderSound () {
	for(var i : int = 0; i < 3; i++){
		switch(i) {
		case 0:			
			skillSoundEffects[2].volume = playerData.effectVolume/100.0;
			skillSoundEffects[2].pitch = 0.8;
			skillSoundEffects[2].Play();
			yield WaitForSeconds(0.33);
			break;
		case 1:
			skillSoundEffects[2].pitch = 0.7;
			skillSoundEffects[2].Play();
			yield WaitForSeconds(0.66);
			break;
//		case 2:
//			skillSoundEffects[2].pitch = 0.9;
//			skillSoundEffects[2].Play();
//			break;
		}	
	}
}

function StartGravitySound () {
	for(var i : int = 0; i < 2; i++){
		switch(i) {
		case 0:			
			skillSoundEffects[3].volume = playerData.effectVolume/100.0;
			yield WaitForSeconds(1);
			break;
		case 1:
			skillSoundEffects[3].Play();
			break;
		}
	}
}
