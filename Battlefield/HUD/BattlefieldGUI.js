#pragma strict

var skillIconSkin : GUISkin;

//minimap defaults 360,120
static var lineTex : Texture2D;

private static var topBarHeight : float;
private static var bottomBarHeight : float;

private var padding : float;
private var windowWidth : float;
private var windowHeight: float;
private var windowX : float;
private var topBarY : float;
private var bottomBarY : float;
private var targetBoxY : float; 
private var targetBoxX : float; 
var isTargetCursor : boolean;
var aimingParticle : Transform;

private var windowRect : Rect;
private var playerRect : Rect;
private var playerPicRect : Rect;
private var playerBoxRect : Rect;
private var opponentRect : Rect;
private var opponentPicRect : Rect;
private var opponentBoxRect : Rect;
private var pauseRect : Rect;
private var skillsRect : Rect;
private var visionRect : Rect;
private var skillLevelUpsRect : Rect;
private var targetBoxRect : Rect;		
private var fpsBoxRect : Rect;	
private var playerStatsRect : Rect;
private var opponentStatsRect : Rect;

private var levelSize : float;
private var picWidth : float;
private var uiScaleWidth : float;
private var playerWidth : float;
private var opponentX : float;
private var visionX : float;
private var skillsWidth : float;
private var pauseWidth : float;
private var skillLevelUpsY : float;
private var skillsX : float;
private var fpsBoxX : float;
private var fpsBoxY : float;
private var monsterTimeX : int;
private var monsterTimeY : int;

private var gameController : GameController;
private var playerData : PlayerData;
private var unitData : UnitData;
private var battlefieldPauseGUI : BattlefieldPauseGUI;
private var skills : Skills;
private var opponentSkills : OpponentSkills;
private var minimapBackground : GUITexture;

private var primaryColors : Color[];
private var secondaryColors : Color[] = [Color.white,Color.white,Color.white,Color.white];
private var gravitonManaColor : Color = Color(0.55, 0, 0.8);

private var scale : Vector3;
private var hasUpdatedGui : boolean;
private var displayingStats : boolean;
private var targetBoxAvailable : boolean;

private var guiMatrixNoScale : Matrix4x4;
private var guiMatrix : Matrix4x4;	
private var guiMatrixOrig : Matrix4x4;

private var unitNumberToName : Dictionary.<int,String> = new Dictionary.<int,String>();

private var updateInterval : float = 0.5; 
private var accum : float = 0.0; // FPS accumulated over the interval
private var frames : int = 0; // Frames drawn over the interval
private var timeleft : float; // Left time for current interval
var fpsText : String;

private var tooltipRect : Rect;
private var tooltipString : String;
private var lastTooltip : String;
var drawToolTip : boolean;
private var tooltipY : int;
var needsTooltip : boolean[];
private var skillTooltips : String[];
private var skillNames : String[];
private var skillLevelUpTooltips : String[];
private var skillTooltipsZero : String[];
var tooltipSize : int;
var emptyStyle : GUIStyle;

private var skillIconStyles : GUIStyle[];

private var buttonPressSound : AudioSource;

function Awake () {
	playerData = GameObject.FindGameObjectWithTag("Data").GetComponent(PlayerData);
	unitData = GameObject.FindGameObjectWithTag("Data").GetComponent(UnitData);
	gameController = GameObject.FindGameObjectWithTag("GameController").GetComponent(GameController);
	battlefieldPauseGUI = this.GetComponent(BattlefieldPauseGUI);
	minimapBackground = this.transform.parent.Find("Minimap").Find("Background").GetComponent(GUITexture);
	skills = gameController.gameObject.GetComponent(Skills);
	opponentSkills = GameObject.FindGameObjectWithTag("GameController").GetComponent(OpponentSkills);	
	
	hasUpdatedGui = false;    
	isTargetCursor = false; 
	guiMatrix.SetTRS(Vector3.one, Quaternion.identity, Vector3(1,1,1));
	GUI.matrix = guiMatrix;
    guiMatrixNoScale = GUI.matrix;  
    needsTooltip = new boolean[4];
    
    skillTooltips = new String[5];
    skillTooltips[0] = unitData.skillTooltips[playerData.characterSelected, 0];
    skillTooltips[1] = unitData.skillTooltips[playerData.characterSelected, 1];
    skillTooltips[2] = unitData.skillTooltips[playerData.characterSelected, 2];
    skillTooltips[3] = unitData.skillTooltips[playerData.characterSelected, 3];
    skillTooltips[4] = unitData.skillTooltips[playerData.characterSelected, 4];
    skillNames = new String[5];
    skillNames[0] = unitData.passiveNames[playerData.characterSelected];
    skillNames[1] = unitData.skillOneNames[playerData.characterSelected];
    skillNames[2] = unitData.skillTwoNames[playerData.characterSelected];
    skillNames[3] = unitData.skillThreeNames[playerData.characterSelected];
    skillNames[4] = unitData.ultimateNames[playerData.characterSelected];
    skillLevelUpTooltips = new String[5];
    skillLevelUpTooltips[1] = unitData.skillLevelUpTooltips[playerData.characterSelected, 1];
    skillLevelUpTooltips[2] = unitData.skillLevelUpTooltips[playerData.characterSelected, 2];
    skillLevelUpTooltips[3] = unitData.skillLevelUpTooltips[playerData.characterSelected, 3];
    skillLevelUpTooltips[4] = unitData.skillLevelUpTooltips[playerData.characterSelected, 4];
    skillTooltipsZero = new String[4];
    skillTooltipsZero[1] = unitData.skillTooltipsZero[playerData.characterSelected, 1];
    skillTooltipsZero[2] = unitData.skillTooltipsZero[playerData.characterSelected, 2];
    skillTooltipsZero[3] = unitData.skillTooltipsZero[playerData.characterSelected, 3];
    
    skillIconStyles = new GUIStyle[8];
    switch(playerData.characterSelected) {
    case 0:			
		skillIconStyles[0] = skillIconSkin.GetStyle("RalphPassive");
		skillIconStyles[1] = skillIconSkin.GetStyle("RalphSkillOne");
		skillIconStyles[2] = skillIconSkin.GetStyle("RalphSkillTwo");
		skillIconStyles[3] = skillIconSkin.GetStyle("RalphSkillThree");
		skillIconStyles[4] = skillIconSkin.GetStyle("RalphUltimate");
		break;
	case 1:	
		skillIconStyles[0] = skillIconSkin.GetStyle("RosalindPassive");
		skillIconStyles[1] = skillIconSkin.GetStyle("RosalindSkillOne");
		skillIconStyles[2] = skillIconSkin.GetStyle("RosalindSkillTwo");
		skillIconStyles[3] = skillIconSkin.GetStyle("RosalindSkillThree");
		skillIconStyles[4] = skillIconSkin.GetStyle("RosalindUltimate");
		skillIconStyles[5] = skillIconSkin.GetStyle("RosalindSkillThreeFinesse");
		break;
	case 2:		
		skillIconStyles[0] = skillIconSkin.GetStyle("LeonardoPassive");
		skillIconStyles[1] = skillIconSkin.GetStyle("LeonardoSkillOne");
		skillIconStyles[2] = skillIconSkin.GetStyle("LeonardoSkillTwo");
		skillIconStyles[3] = skillIconSkin.GetStyle("LeonardoSkillThree");
		skillIconStyles[4] = skillIconSkin.GetStyle("LeonardoUltimate");
		break;
	case 3:
		skillIconStyles[0] = skillIconSkin.GetStyle("GravitonPassive");
		skillIconStyles[1] = skillIconSkin.GetStyle("GravitonSkillOne");
		skillIconStyles[2] = skillIconSkin.GetStyle("GravitonSkillTwo");
		skillIconStyles[3] = skillIconSkin.GetStyle("GravitonSkillThree");
		skillIconStyles[4] = skillIconSkin.GetStyle("GravitonUltimate");
    	break;    
    }
    
    buttonPressSound = GameObject.Find("MenuButtonPressedSound").audio;
} 

function Start () {		
	//hashing
	for(var i : int = 0; i < 37; i++)	{
		unitNumberToName[i] = unitData.unitNames[i];
	}	
	//colors
	primaryColors = unitData.primaryColors;
	SetSizes();
	Refresh();
	timeleft = updateInterval;  
	displayingStats = false;
	targetBoxAvailable = true;
	aimingParticle = GameObject.Find("AimingParticle").transform;
}

function Update() {	ToggleUI();	ToggleFPS(); ToggleStats();}

function OnGUI ()	{	
	if(!hasUpdatedGui) {
		ColoredGUISkin.Instance.UpdateGuiColors(primaryColors[playerData.characterSelected], secondaryColors[playerData.characterSelected]);
		hasUpdatedGui = true;
	}
	GUI.matrix = guiMatrix;
	if(!gameController.paused && playerData.uiToggle &&!gameController.gameOver)	{
		RefreshLite();
		CheckCursor();
		
		GUI.skin = ColoredGUISkin.Skin;
		GUI.color = Color(1,1,1,playerData.hudOpacity);
		////
		guiMatrixOrig = GUI.matrix;   		
   		
   		DrawHealthBars();  	   		
		//top
		pauseRect = GUI.Window (0, pauseRect, PauseBox, "", ColoredGUISkin.Skin.customStyles[4]); 			
		skillsRect = GUI.Window (4, skillsRect, SkillsBox, "", ColoredGUISkin.Skin.box);	
		visionRect = GUI.Window (5, visionRect, VisionBox, "", ColoredGUISkin.Skin.customStyles[4]);		
			
		//skill level ups
		GUI.color = Color(1,1,1,1.0);
		if(gameController.skillPointAvailable)		{
			skillLevelUpsRect = GUI.Window (16, skillLevelUpsRect, SkillLevelUps, "", emptyStyle);	
		}		
		
		GUI.color = Color(1,1,1,playerData.hudOpacity);
		//bottom
		if(displayingStats) { 
			playerStatsRect = GUI.Window (15, playerStatsRect, PlayerStats, "", ColoredGUISkin.Skin.customStyles[6]);
			opponentStatsRect =	GUI.Window (14, opponentStatsRect, OpponentStats, "", ColoredGUISkin.Skin.customStyles[6]);	
			if(gameController.viewTarget != 38 && targetBoxAvailable) {
				//target box
				targetBoxRect = GUI.Window (11, targetBoxRect, TargetBox, "", ColoredGUISkin.Skin.box);
			}
		}
		else {		
			DrawStatBars();	
			playerRect = GUI.Window (1, playerRect, Player, "", ColoredGUISkin.Skin.customStyles[2]);
			playerPicRect = GUI.Window (20, playerPicRect, PlayerPic, "", emptyStyle);
			playerBoxRect = GUI.Window (6, playerBoxRect, PlayerBox, "", ColoredGUISkin.Skin.box);
			opponentRect = GUI.Window (3, opponentRect, Opponent, "", ColoredGUISkin.Skin.customStyles[2]);
			opponentPicRect = GUI.Window (21, opponentPicRect, OpponentPic, "", emptyStyle);
			opponentBoxRect = GUI.Window (7, opponentBoxRect, OpponentBox, "", ColoredGUISkin.Skin.box);
		}
				
		//fps box
		if(playerData.displayingFPS) {	fpsBoxRect = GUI.Window (12, fpsBoxRect, FPSBox, "", ColoredGUISkin.Skin.box);	}
		if(needsTooltip[0] == false && needsTooltip[1] == false && needsTooltip[2] == false && needsTooltip[3] == false) { tooltipString = ""; }
		//tooltips
		if(tooltipString != lastTooltip) {	
			if (lastTooltip != "") {
				drawToolTip = false;
			}
			if (tooltipString != "") {
				drawToolTip = true;
				if(tooltipString[0:3] == "How")	{	tooltipSize = 0;		}
				else if(tooltipString[0:3] == "Res") { tooltipSize = 1; }
				else if(tooltipString[0:3] == "Lev") { tooltipSize = 3; }
				else { tooltipSize = 2; } 
			}
			lastTooltip = tooltipString;
		} 
		if(drawToolTip) {	
			//(camera.pixelWidth - playerWidth)/uiScaleValue + (playerWidth/uiScaleValue - playerWidth);
			var uiScaleValue : float = (1 + (playerData.uiScale - 5)/10.0);
			var tooltipX : float = (Input.mousePosition.x - 70)/uiScaleValue + (70/uiScaleValue - 70);
			tooltipY = (Camera.main.pixelHeight - Input.mousePosition.y+20)/uiScaleValue;
			var tooltipHeight : float;
			switch(tooltipSize) {			
			case 0:	
				tooltipX = (Input.mousePosition.x - 70)/uiScaleValue + (70/uiScaleValue - 70);
				tooltipRect = Rect(tooltipX, tooltipY, 140, 100);
				tooltipRect = GUI.Window (13, tooltipRect, DoMyTooltipWindow, "", ColoredGUISkin.Skin.box);
				break;
			case 1:
				tooltipX = (Input.mousePosition.x - 100)/uiScaleValue + (90/uiScaleValue - 100);
				if(tooltipX < 0) { tooltipX = 0; }
				tooltipHeight = ColoredGUISkin.Skin.box.CalcHeight(GUIContent(tooltipString,""), 200) + 20;
				tooltipRect = Rect(tooltipX, tooltipY, 200, tooltipHeight);
				tooltipRect = GUI.Window (13, tooltipRect, DoMyTooltipWindow, "", ColoredGUISkin.Skin.box);
				break;
			case 2:				
				var splitSkillStrings : String[] = tooltipString.Split("$"[0]);
				var nameOfSkill : String = splitSkillStrings[0];
				if(splitSkillStrings.Length > 2) {
					tooltipHeight = ColoredGUISkin.Skin.box.CalcHeight(GUIContent(splitSkillStrings[1] + splitSkillStrings[2],""), 320) + 50;
				}
				else {
					tooltipHeight = ColoredGUISkin.Skin.box.CalcHeight(GUIContent(splitSkillStrings[1],""), 320) + 50;
				}
				tooltipX = (Input.mousePosition.x - 160)/uiScaleValue + (160/uiScaleValue - 160);
				tooltipRect = Rect(tooltipX, tooltipY, 320, tooltipHeight);		
				tooltipRect = GUI.Window (13, tooltipRect, DoMyTooltipWindow, nameOfSkill);
				break;
			case 3:
				tooltipHeight = ColoredGUISkin.Skin.box.CalcHeight(GUIContent(tooltipString,""), 340) + 20;
				tooltipX = (Input.mousePosition.x - 170)/uiScaleValue + (170/uiScaleValue - 170);
				tooltipRect = Rect(tooltipX, tooltipY, 340, tooltipHeight);
				tooltipRect = GUI.Window (13, tooltipRect, DoMyTooltipWindow, "", ColoredGUISkin.Skin.box);
			}
		}
	
		//dont scale stuff below here
		GUI.matrix = guiMatrixNoScale;
		//draw mouse camera scroll indicator lines
		CameraScrollLines();
		MonsterTimer();
		
		GUI.matrix = guiMatrixOrig;				
	}
}

function DoMyTooltipWindow (windowID : int) {
	var printedTip : String = tooltipString;
	var spaceNum : int = 0;
	if(tooltipString.Contains("$")) { 
		var splitSkillStrings : String[] = tooltipString.Split("$"[0]);
		if(splitSkillStrings.Length > 2) {
			printedTip = splitSkillStrings[1] + splitSkillStrings[2];
		}
		else {
			printedTip = splitSkillStrings[1];
		}
		spaceNum = 17;
	}
	GUILayout.Space(spaceNum);
	GUI.BringWindowToFront(13);
	GUILayout.BeginVertical();		
	GUILayout.FlexibleSpace();
	GUILayout.Box(printedTip);
	GUILayout.FlexibleSpace();
	GUILayout.EndVertical();
}

function CheckCursor () {
	if(gameController.playerAiming && !isTargetCursor) {
		//start target cursor
		isTargetCursor = true;
		aimingParticle.particleSystem.startColor = primaryColors[gameController.characterSelected[1]];
		aimingParticle.particleSystem.Play();
		CheckTargetCursor();
	}	
}

function CheckTargetCursor () {
	for(;;) {
		if(!gameController.playerAiming) {
			//stop target cursor			
			aimingParticle.particleSystem.Stop();
			aimingParticle.particleSystem.Clear();
			isTargetCursor = false;
			break;
		}
		else if(gameController.paused) { 
			var screenMiddle : Vector3 = Vector3(Camera.main.pixelWidth/2.0, Camera.main.pixelHeight/2.0, 5);
			aimingParticle.position = Camera.main.ScreenToWorldPoint(screenMiddle);
			yield;
		}
		else {		
			var mousePos : Vector3 = Input.mousePosition;
			mousePos.z = 5;
			aimingParticle.position = Camera.main.ScreenToWorldPoint(mousePos);
			yield;	
				
		}
	}
}

function MonsterTimer () {
	if(gameController.isMonsterRespawning) {
		var minutes : int = gameController.respawnDurations[0]/60;
		var seconds : int = gameController.respawnDurations[0]%60;
		var secondsText : String = "" + seconds;
		if(seconds < 10) {  secondsText = "0" + secondsText; }
		var timerString : String = "" + minutes + ":" + secondsText;
		GUI.Box(Rect(monsterTimeX, monsterTimeY, 55, 35), timerString);
	}
}

function DrawStatBars () {
	var barHeight : int = 10;
	var manaColor : Color = Color.blue;
	var playerChar : int = gameController.characterSelected[1];
	var opponentChar : int = gameController.characterSelected[2];
	var widthDistance : int = (playerWidth/2.25);
	
	//player bars	
	var playerHealthPercent : float  = Mathf.Clamp(((gameController.currentHealths[1])/gameController.maxHealths[1])*100.0, 0, 100.0f);
	var playerManaPercent : float  = Mathf.Clamp(((gameController.currentResources[1])/gameController.maxResources[1])*100.0, 0, 100.0f);
	var playerExpPercent : float  = Mathf.Clamp(((gameController.experiences[1]-(gameController.playerExperienceNeeded-
		((gameController.levels[1]+1.0)*100)))/((gameController.levels[1]+1.0)*100))*100.0, 0, 100.0f);
	var playerWidthDistance : int = (windowX+widthDistance);
	var height : int = bottomBarY+(bottomBarHeight/3.75);
	//background
	DrawLine(Vector2(playerWidthDistance,height), Vector2((playerWidthDistance+100),height), Color(0.45,0,0), barHeight);	
	//health bar	
	DrawLine(Vector2(playerWidthDistance,height), Vector2((playerWidthDistance+playerHealthPercent),height), Color.yellow, barHeight);
	height = bottomBarY+(bottomBarHeight/3.0);
	//background
	DrawLine(Vector2(playerWidthDistance,height), Vector2((playerWidthDistance+100),height), Color.gray, 20);
	if(playerChar != 0) {
		if(playerChar == 1) { manaColor = Color.red; }	
		else if(playerChar == 3) { manaColor = gravitonManaColor; }	
		//mana bar		
		DrawLine(Vector2(playerWidthDistance,height), Vector2((playerWidthDistance+playerManaPercent),height), manaColor, barHeight);
	}
	else {
		//empty/full bar
		DrawLine(Vector2(playerWidthDistance,height), Vector2((playerWidthDistance+100),height), Color.green, 10);
	}
	//xp bar
	if(gameController.levels[1] < 10) {
		height = bottomBarY+(bottomBarHeight/2.5);
		DrawLine(Vector2(playerWidthDistance,height), Vector2((playerWidthDistance+playerExpPercent),height), Color.magenta, barHeight);
	}
	
	//opponent bars	
	var opponentHealthPercent : float  = Mathf.Clamp(((gameController.currentHealths[2])/gameController.maxHealths[2])*100.0, 0, 100.0f);
	var opponentManaPercent : float  = Mathf.Clamp(((gameController.currentResources[2])/gameController.maxResources[2])*100.0, 0, 100.0f);
	var opponentExpPercent : float  = Mathf.Clamp(((gameController.experiences[2]-(gameController.opponentExperienceNeeded-
		((gameController.levels[2]+1.0)*100)))/((gameController.levels[2]+1.0)*100))*100.0, 0, 100.0f);
	var opponentWidthDistance : int = (opponentX+widthDistance);
	height = bottomBarY+(bottomBarHeight/3.75);
	//background
	DrawLine(Vector2(opponentWidthDistance,height), Vector2((opponentWidthDistance+100),height), Color(0.45,0,0), barHeight);	
	//health bar	
	DrawLine(Vector2(opponentWidthDistance,height), Vector2((opponentWidthDistance+opponentHealthPercent),height), Color(1,0.5,0), barHeight);
	height = bottomBarY+(bottomBarHeight/3.0);
	//background
	DrawLine(Vector2(opponentWidthDistance,height), Vector2((opponentWidthDistance+100),height), Color.gray, 20);
	if(opponentChar != 0) {
		if(opponentChar == 1) { manaColor = Color.red; }
		else if(opponentChar == 3) { manaColor = gravitonManaColor; }
		else {	manaColor = Color.blue; }
		//mana bar		
		DrawLine(Vector2(opponentWidthDistance,height),	Vector2((opponentWidthDistance+opponentManaPercent),height), manaColor, barHeight);
	}
	else {
		//empty/full bar
		DrawLine(Vector2(opponentWidthDistance,height), Vector2((opponentWidthDistance+100),height), Color.green, 10);
	}
	if(gameController.levels[2] < 10) {
		//xp bar
		height = bottomBarY+(bottomBarHeight/2.5); 
		DrawLine(Vector2(opponentWidthDistance,height), Vector2((opponentWidthDistance+opponentExpPercent),height), Color.magenta, barHeight);
	}
}

var topPoint : Vector2;
var botPoint : Vector2;
var leftPoint : Vector2;
var rightPoint : Vector2;
var lineHeight : float;
var lineWidth : float;
var lineMid : float;
var midPoint : Vector2;

function CameraScrollLines() {
	//left
	if(gameController.leftCamera)		{
		topPoint = Vector2(playerData.sideScrollDistance,playerData.topScrollDistance);
		botPoint = Vector2(playerData.sideScrollDistance,camera.pixelHeight - playerData.botScrollDistance);
		lineHeight = Vector2.Distance(topPoint, botPoint);
		lineMid = camera.pixelHeight - playerData.botScrollDistance - lineHeight/2.0;
		midPoint = Vector2(playerData.sideScrollDistance/2.0,lineMid);
		DrawLine(topPoint,midPoint);
		DrawLine(midPoint,botPoint);
		//DrawLine(Vector2(playerData.sideScrollDistance,playerData.topScrollDistance),Vector2(playerData.sideScrollDistance,camera.pixelHeight - playerData.botScrollDistance));
	}
	//right
	if(gameController.rightCamera)		{
		topPoint = Vector2(camera.pixelWidth - playerData.sideScrollDistance,playerData.topScrollDistance);
		botPoint = Vector2(camera.pixelWidth - playerData.sideScrollDistance,camera.pixelHeight - playerData.botScrollDistance);
		lineHeight = Vector2.Distance(topPoint, botPoint);
		lineMid = camera.pixelHeight - playerData.botScrollDistance - lineHeight/2.0;
		midPoint = Vector2(camera.pixelWidth - playerData.sideScrollDistance/2.0,lineMid);
		DrawLine(topPoint,midPoint);
		DrawLine(midPoint,botPoint);
		//DrawLine(Vector2(camera.pixelWidth - playerData.sideScrollDistance,playerData.topScrollDistance),Vector2(camera.pixelWidth - playerData.sideScrollDistance,camera.pixelHeight - playerData.botScrollDistance));
	}
	//bottom
	if(gameController.bottomCamera)		{
		leftPoint = Vector2(playerData.sideScrollDistance,camera.pixelHeight - playerData.botScrollDistance);
		rightPoint = Vector2(camera.pixelWidth - playerData.sideScrollDistance,camera.pixelHeight - playerData.botScrollDistance);
		lineWidth = Vector2.Distance(leftPoint, rightPoint);
		lineMid = camera.pixelWidth - playerData.sideScrollDistance - lineWidth/2.0;
		midPoint = Vector2(lineMid,camera.pixelHeight - playerData.botScrollDistance*.84);
		DrawLine(leftPoint,midPoint);
		DrawLine(midPoint,rightPoint);
		//DrawLine(Vector2(playerData.sideScrollDistance,camera.pixelHeight - playerData.botScrollDistance),Vector2(camera.pixelWidth - playerData.sideScrollDistance,camera.pixelHeight - playerData.botScrollDistance));
	}
	//top
	if(gameController.topCamera)		{
		leftPoint = Vector2(playerData.sideScrollDistance,playerData.topScrollDistance);
		rightPoint = Vector2(camera.pixelWidth - playerData.sideScrollDistance,playerData.topScrollDistance);
		lineWidth = Vector2.Distance(leftPoint, rightPoint);
		lineMid = camera.pixelWidth - playerData.sideScrollDistance - lineWidth/2.0;
		midPoint = Vector2(lineMid,playerData.topScrollDistance*.8);
		DrawLine(leftPoint,midPoint);
		DrawLine(midPoint,rightPoint);
		//DrawLine(Vector2(playerData.sideScrollDistance,playerData.topScrollDistance),Vector2(camera.pixelWidth - playerData.sideScrollDistance,playerData.topScrollDistance));
	}
}

function ToggleUI () {
	if(Input.GetKeyDown(playerData.keySettings[16]))	{
		playerData.uiToggle = !playerData.uiToggle;
	}
}

function ToggleFPS () {
	if(Input.GetKeyDown(KeyCode.I))	{
		playerData.displayingFPS = !playerData.displayingFPS;
	}
}

function ToggleStats () {
	if(playerData.statsToggle) {
		if(Input.GetKeyDown(playerData.keySettings[15]))	{
			displayingStats = !displayingStats;
		}
	}
	else {
		if(Input.GetKeyDown(playerData.keySettings[15]))	{
			displayingStats = true;
		}
		if(Input.GetKeyUp(playerData.keySettings[15]))	{
			displayingStats = false;
		}
	}
}

function PauseBox() {
	GUI.matrix = guiMatrixOrig;
	GUILayout.BeginHorizontal();
	//pause button
	GUILayout.BeginVertical();
	if (GUILayout.Button("Pause")) {
		battlefieldPauseGUI.Pause();
		if(!playerData.effectMuted) { buttonPressSound.Play(); }
	}
	var minutes : int = gameController.gameClock / 60;
   	var seconds : int = gameController.gameClock % 60;
   	var secondsText : String = "" + seconds;
   	if(seconds < 10) {  secondsText = "0" + secondsText; }
   	var gameClockText : String = "" + minutes + ":" + secondsText;
   	var timeText : String;
   	var respawnText : String = "Respawn Timers\n\nMinions - " + (70 - seconds)%60 + "s";
   	if(gameController.playerGuardianDown) {
   		minutes = gameController.respawnDurations[7]/60;
		seconds = gameController.respawnDurations[7]%60;
		secondsText = "" + seconds;
		if(seconds < 10) {  secondsText = "0" + secondsText; }
		timeText = "" + minutes + ":" + secondsText;
   		respawnText += "\nMy Guardian - " +  timeText;
   	}
   	if(gameController.enemyGuardianDown) {
 	  	minutes = gameController.respawnDurations[8]/60;
		seconds = gameController.respawnDurations[8]%60;
		secondsText = "" + seconds;
		if(seconds < 10) {  secondsText = "0" + secondsText; }
		timeText = "" + minutes + ":" + secondsText;
   		respawnText += "\nEnemy Guardian - " + timeText;
   	}
   	if(gameController.isMonsterRespawning) {
   		minutes = gameController.respawnDurations[0]/60;
		seconds = gameController.respawnDurations[0]%60;
		secondsText = "" + seconds;
		if(seconds < 10) {  secondsText = "0" + secondsText; }
		timeText = "" + minutes + ":" + secondsText;
   		respawnText += "\nMonster - " + timeText;
   	}
	GUILayout.Box(GUIContent(gameClockText, respawnText));
	GUILayout.EndVertical();
	
	//sound toggles
	GUILayout.BeginVertical();
	GUILayout.FlexibleSpace();
	var isMusicMuted : boolean = playerData.musicMuted;
	playerData.musicMuted = GUILayout.Toggle(playerData.musicMuted,"Music", ColoredGUISkin.Skin.customStyles[5]);
	if(isMusicMuted != playerData.musicMuted) { UpdateMusicMute(); }
	var isEffectMuted : boolean = playerData.effectMuted;
	playerData.effectMuted = GUILayout.Toggle(playerData.effectMuted,"SFX", ColoredGUISkin.Skin.customStyles[5]);
	if(isEffectMuted != playerData.effectMuted) { UpdateSoundEffectMute(); }
	GUILayout.EndVertical();
	
	GUILayout.EndHorizontal();	
	if(GUI.tooltip != "") { tooltipString = GUI.tooltip; needsTooltip[0] = true; }
	else { needsTooltip[0] = false; }
}

function UpdateMusicMute () {
	var battleMusicObject : GameObject = GameObject.Find("BattleMusic"); 
	if(battleMusicObject != null) {
		if(playerData.musicMuted) {		battleMusicObject.audio.Stop();		}
		else {	battleMusicObject.audio.volume = playerData.musicVolume/100.0; battleMusicObject.audio.Play();	}
	}
}

function UpdateSoundEffectMute () {
	if(!playerData.effectMuted) {	buttonPressSound.Play(); }
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
	if(playerData.effectMuted) { buttonPressSound.volume = 0; }
	else { buttonPressSound.volume = playerData.effectVolume; }
}

function CheckSoundUpdate (soundEffect : AudioSource) {
	if(soundEffect != null) {
		if(playerData.effectMuted) { soundEffect.volume = 0; }
		else { soundEffect.volume = playerData.effectVolume; }
	}
}

function SkillsBox () {
	GUI.matrix = guiMatrixOrig;
	//skills
	GUILayout.BeginHorizontal();
	GUILayout.FlexibleSpace();
	//passive icon
	GUILayout.BeginVertical();
	GUILayout.FlexibleSpace();
	GUILayout.Label(GUIContent("", skillNames[0] + "$" + skillTooltips[0] + "$\n----------\n" + unitData.skillTooltipNumbers[0]), skillIconStyles[0]);
	GUILayout.FlexibleSpace();
	GUILayout.EndVertical();
	GUILayout.FlexibleSpace();
	//active skill icons & levelup buttons
	for(var i : int = 0; i < 4; i++)	{
		var skillLevel : int = gameController.skillLevels[1, i];
		GUILayout.BeginVertical();
		GUILayout.FlexibleSpace();
		var skillTooltip : String;
		var skillIcon : GUIStyle = skillIconStyles[i+1];
		if(gameController.characterSelected[1] == 1 && i == 2) {
			if(gameController.stances[1] == 0) {
				skillIcon = skillIconStyles[5];
			}
		}
		if(gameController.skillLevels[1,i] > 0) {
			if(gameController.characterSelected[1] == 1 && i == 2) {
				if(gameController.stances[1] == 0) { 
					skillTooltip = "Finesse" + "$" + skillTooltips[i+1] + "$\n----------\n" + unitData.skillTooltipNumbers[i+1];
				}
				else {
					skillTooltip = "Grace" + "$" + skillTooltips[i+1] + "$\n----------\n" + unitData.skillTooltipNumbers[i+1];
				}
			}
			else {
				skillTooltip = skillNames[i+1] + "$" + skillTooltips[i+1] + "$\n----------\n" + unitData.skillTooltipNumbers[i+1];
			}
		}
		else {
			if(gameController.characterSelected[1] == 1 && i == 2) {
				if(gameController.stances[1] == 0) { 
					skillTooltip = "Finesse" + "$" + skillTooltips[i+1] + "$\n----------\nCurrent Stance : Grace\n----------\n" 
						+ "Cooldown : 3   Insight : 30\n\nAttack Speed +5%\nMovement Speed -5%";
				}
				else {
					skillTooltip = "Grace" + "$" + skillTooltips[i+1] + "$\n----------\nCurrent Stance : Finesse\n----------\n" 
						+ "Cooldown : 3   Insight : 30\n\nAttack Speed -5%\nMovement Speed +5%";
				}
			}
			else {	skillTooltip = skillNames[i+1] + "$" + skillTooltips[i+1]; }
		}
		//if not ralphs skill 3 (passive)
		if(!(gameController.characterSelected[1] == 0 && i == 2)) {
			//buttons/timers
			if(gameController.cooldowns[1,i])		{
				GUI.enabled = false;
				var currentTime : float = gameController.cooldownTimers[1,i];
				if(currentTime < 9.95) {
					GUILayout.Button(GUIContent("" + currentTime.ToString("F1"), skillTooltip), skillIcon);
				}
				else {
					GUILayout.Button(GUIContent("" + currentTime.ToString("F0"), skillTooltip), skillIcon);
				}
				GUI.enabled = true;
			}
			else if(!gameController.playerAiming && !skills.seeking && (gameController.skillLevels[1,i] > 0 || (gameController.characterSelected[1] == 1 && i == 2)) && 
				!gameController.frozen[1] && !gameController.stunned[1] && gameController.currentHealths[1] >= 1 && gameController.currentResources[1] >= gameController.skillCosts[1,i] 
				&& !(gameController.characterSelected[1] == 2 && gameController.skillsExecuting[1, 3]))	{
				if(GUILayout.Button(GUIContent("",skillTooltip), skillIcon)) {
					gameController.TrySkill(i, true);
				//	if(!playerData.effectMuted) { buttonPressSound.Play(); }
				}
			}
			else if(gameController.playerAiming && gameController.playerAimingNumber == i) {
				//GUILayout.Box(GUIContent("",skillTooltip), skillIconStyles[i+1]);
				gameController.playerAiming = GUILayout.Toggle(gameController.playerAiming , "", skillIcon);
			}
			else {
				GUI.enabled = false;
				GUILayout.Button(GUIContent("",skillTooltip), skillIcon);
				GUI.enabled = true;
			}	
		}
		else {
			if(gameController.skillLevels[1,i] > 0) {
				GUILayout.Label(GUIContent("", skillNames[3] + "$" + skillTooltips[3] + "$\n----------\n"	+ unitData.skillTooltipNumbers[3]), skillIcon);
			}
			else {
				GUI.enabled = false;
				GUILayout.Button(GUIContent("",skillTooltip), skillIcon);
				GUI.enabled = true;
			}
		}	
		GUILayout.FlexibleSpace();
		GUILayout.EndVertical();
		GUILayout.FlexibleSpace();
	}
	GUILayout.EndHorizontal();
	if(GUI.tooltip != "") { tooltipString = GUI.tooltip; needsTooltip[1] = true; }
	else { needsTooltip[1] = false; }
}

function SkillLevelUps ()	{
	GUILayout.BeginHorizontal();
	GUILayout.FlexibleSpace();
	GUILayout.Space(skillsWidth/5.0);
	for(var j : int = 0; j < 4; j++)	{
		var skillLevel : int = gameController.skillLevels[1,j];
		var levelingTooltip : String = "Level Up " + skillNames[j+1] + "!\n----------\n" + skillLevelUpTooltips[j+1];
		if(skillLevel < 1 && !(gameController.characterSelected[1] == 1 && j == 2)) { 
			if(j < 3) {
				if(gameController.characterSelected[1] == 2 && skillLevel < 1) {
					switch(j) {
					case 0:
						levelingTooltip = "Level Up " + skillNames[j+1] + "!\n----------\n" + skillTooltipsZero[j+1] + "\n\nFire Aura\nAttack Speed +5%";
						break;
					case 1:
						levelingTooltip = "Level Up " + skillNames[j+1] + "!\n----------\n" + skillTooltipsZero[j+1] + "\n\nIce Aura\nDamage Reduction +5";
						break;
					case 2:
						levelingTooltip = "Level Up " + skillNames[j+1] + "!\n----------\n" + skillTooltipsZero[j+1] + "\n\nEarth Aura\nMovement Speed +15%";
						break;
					}				
				}
				else {
					levelingTooltip = "Level Up " + skillNames[j+1] + "!\n----------\n" + skillTooltipsZero[j+1];
				}
			}
			else {
				levelingTooltip =  "Level Up " + skillNames[j+1] + "!\n----------\n" + unitData.skillTooltipNumbers[j+1];
			}			
		}
		if(j == 3)	{
			if(gameController.levels[1] < 5 || skillLevel >= 1)	{
				GUILayout.Space(skillsWidth/5.0);
			}
			else	{
				GUILayout.BeginHorizontal();
				GUILayout.FlexibleSpace();
				if(GUILayout.Button(GUIContent(" + \0", levelingTooltip)))				{
					gameController.SkillLevelUp(1, j);
					if(!playerData.effectMuted) { buttonPressSound.Play(); }
				}
				GUILayout.FlexibleSpace();
				GUILayout.EndHorizontal();
			}
		}
		else if(skillLevel < 3)	{
			GUILayout.BeginHorizontal();
			GUILayout.FlexibleSpace();
			if(GUILayout.Button(GUIContent(" + \0", levelingTooltip)))			{
				gameController.SkillLevelUp(1, j);
				if(!playerData.effectMuted) { buttonPressSound.Play(); }
			}
			GUILayout.FlexibleSpace();
			GUILayout.EndHorizontal();
		}
		else {
			GUILayout.Space(skillsWidth/5.0);
		}
	}
	GUILayout.FlexibleSpace();
	GUILayout.EndHorizontal();
	if(GUI.tooltip != "") { tooltipString = GUI.tooltip; needsTooltip[3] = true; }
	else { needsTooltip[3] = false; }
}

function VisionBox ()	{
	GUILayout.BeginHorizontal();
		
	//hud scaling
	GUILayout.BeginVertical();
	GUILayout.BeginHorizontal();
	GUILayout.FlexibleSpace();
	GUILayout.Box(GUIContent("S","How large\nshould the\nHUD be?"));
	GUILayout.FlexibleSpace();
	GUILayout.EndHorizontal();
	
	GUILayout.BeginHorizontal();
	GUILayout.FlexibleSpace();
	if(playerData.uiScale < playerData.uiMax)	{	
		if(GUILayout.Button(" + \0"))		{
			if(!playerData.effectMuted) { buttonPressSound.Play(); }
			//cheats for testing
//			gameController.LevelUp(2);
//			gameController.LevelUp(1);
//			gameController.currentHealths[1] = gameController.maxHealths[1];
//			gameController.currentResources[1] = gameController.maxResources[1];
			playerData.uiScale += 1;
			Refresh();
		}
	}
	else {
		GUILayout.Box("");
	}
	GUILayout.FlexibleSpace();
	GUILayout.EndHorizontal();
	GUILayout.BeginHorizontal();
	GUILayout.FlexibleSpace();
	if(playerData.uiScale > playerData.uiMin)	{
		if(GUILayout.Button(" - \0"))		{
			if(!playerData.effectMuted) { buttonPressSound.Play(); }
			playerData.uiScale -= 1;
			Refresh();
		}
	}
	else {
		GUILayout.Box("");
	}
	GUILayout.FlexibleSpace();
	GUILayout.EndHorizontal();
	GUILayout.EndVertical();

	//hud opactiy scaling
	GUILayout.BeginVertical();
	GUILayout.BeginHorizontal();
	GUILayout.FlexibleSpace();
	GUILayout.Box(GUIContent("O","How opaque\nshould the\nHUD be?"));
	GUILayout.FlexibleSpace();
	GUILayout.EndHorizontal();
	
	GUILayout.BeginHorizontal();
	GUILayout.FlexibleSpace();
	if(playerData.hudOpacity < 1.00)	{	
		if(GUILayout.Button(" + \0"))		{
			if(!playerData.effectMuted) { buttonPressSound.Play(); }
			playerData.hudOpacity += 0.1;
		}
	}
	else {
		GUILayout.Box("");
	}
	GUILayout.FlexibleSpace();
	GUILayout.EndHorizontal();
	GUILayout.BeginHorizontal();
	GUILayout.FlexibleSpace();
	if(playerData.hudOpacity > 0.25)	{
		if(GUILayout.Button(" - \0"))		{
			if(!playerData.effectMuted) { buttonPressSound.Play(); }
			playerData.hudOpacity -= 0.1;
		}
	}
	else {
		GUILayout.Box("");
	}
	GUILayout.FlexibleSpace();
	GUILayout.EndHorizontal();
	GUILayout.EndVertical();
	
	//fullscreen toggle
	var buttonText : String = "__     __\n|             |\nFS\n|__    __|\n"; //"__     __\n|      ^      |\n <       > \n|__ v __|\n";//"__     __\n| __  __ |\n|__ __|\n|__    __|\n";
	if(Screen.fullScreen) { buttonText = "__ __\n>|          |<\n>|__ __|<\n        \0"; }	//"__     __\n|    _ _    |\n! _ _ !\n|__    __|\n";//"\n    _ _   \n> :     : <\n  : _ _ :  \n";//"\n__| _ _ |__\n__: _ _ :__\n|      |\n";
	GUILayout.BeginVertical();
	GUILayout.FlexibleSpace();
	if(GUILayout.Button(buttonText, GUILayout.Height(80)))	{ if(!playerData.effectMuted) { buttonPressSound.Play(); } FullScreen(); }	
	GUILayout.FlexibleSpace();
	GUILayout.EndVertical();
	
	GUILayout.EndHorizontal();
	if(GUI.tooltip != "") { tooltipString = GUI.tooltip; needsTooltip[2] = true; }
	else { needsTooltip[2] = false; }
}

function Player() {
	NameDisplay(1);
}

function PlayerPic() {
	GUI.BringWindowToBack(20);
	PicDisplay(1);
}

function PlayerBox()	{
	ScoreStats(1);
}

function PlayerStats () {
	FullStats(1);	
}

var ralphFaceStyle : GUIStyle;
var rosFaceStyle : GUIStyle;
var leoFaceStyle : GUIStyle;
var gravFaceStyle : GUIStyle;

function PicDisplay (unitNumber : int) {	
	GUILayout.BeginHorizontal();
	GUILayout.BeginVertical();
	//death timer
	if(gameController.currentHealths[unitNumber] < 1) {		
		GUILayout.FlexibleSpace();		
		GUILayout.Box("" + gameController.respawnDurations[unitNumber], deathTimerStyle);		
		GUILayout.FlexibleSpace();
	}
	else {
		GUILayout.FlexibleSpace();
		switch(gameController.characterSelected[unitNumber]) {
		case 0:
			GUILayout.Box("", ralphFaceStyle);
			break;
		case 1:
			GUILayout.Box("", rosFaceStyle);
			GUILayout.Space(1);
			break;
		case 2:
			GUILayout.Box("", leoFaceStyle);
			break;
		case 3:
			GUILayout.Box("", gravFaceStyle);
			GUILayout.Space(1);
			break;
		}		
	}
	GUILayout.EndVertical();
	GUILayout.FlexibleSpace();
	GUILayout.EndHorizontal();
}

var deathTimerStyle : GUIStyle;

function NameDisplay (unitNumber : int) {
	//picture
	GUILayout.BeginHorizontal();
	GUILayout.Box("" + gameController.levels[unitNumber]);
	GUILayout.FlexibleSpace();
	GUILayout.FlexibleSpace();
	//name
	GUILayout.Box("  \0" + unitData.characterNames[gameController.characterSelected[unitNumber]] + "  \0");
	GUILayout.FlexibleSpace();
	GUILayout.EndHorizontal();
}

function FullStats (unitNumber : int) {
	GUILayout.BeginVertical();
	GUILayout.FlexibleSpace();
	GUILayout.BeginHorizontal();
	GUILayout.FlexibleSpace();
	var characterNumber : int = gameController.characterSelected[unitNumber];
	var boxString : String;
	var nameString : String = unitData.characterNames[characterNumber];
	var manaString : String = "\n";
	var expString : String = "" + gameController.playerExperienceNeeded;
	if(unitNumber == 2) { expString = "" + gameController.opponentExperienceNeeded; }
	
	if(characterNumber != 0) {
		var manaName : String;
		var manaLetter : String;
		switch (characterNumber) {
		case 1: 
			manaName = "Insight";
			manaLetter = "10 IPA";
			break;
		case 2: 
			manaName = "Mana";
			manaLetter = "" + gameController.resourceRegens[unitNumber] + " MPS";
			break;
		case 3: 
			manaName = "Energy";
			manaLetter = "" + gameController.resourceRegens[unitNumber] + " EPS";
			break;
		}
		manaString += manaName + "  [ " + gameController.currentResources[unitNumber].ToString("F0") + " / " + gameController.maxResources[unitNumber].ToString("F0")
			+ " ]\n          +" + manaLetter;
	}
	boxString = "Health  [ " + gameController.currentHealths[unitNumber].ToString("F0") + " / " + gameController.maxHealths[unitNumber].ToString("F0") + 
		" ]\n          +" + gameController.healthRegens[unitNumber] + " HPS" + manaString +
		"\n\nAttack Speed : " + gameController.attackSpeeds[unitNumber].ToString("F2") + "\nAttack Damage : " + gameController.attackDamages[unitNumber] + 
		"\nDamage Reduction : " + gameController.damageReductions[unitNumber].ToString() + "\nMovement Speed : " + gameController.movementSpeeds[unitNumber].ToString("F1");
		
	GUILayout.Box("" + nameString + "\n-- Level " + gameController.levels[unitNumber] + " --\nExp  : " 
		+ gameController.experiences[unitNumber] + " / " + expString + "\n\n" + boxString);
	GUILayout.FlexibleSpace();
	GUILayout.EndHorizontal();
	GUILayout.FlexibleSpace();
	GUILayout.EndVertical();
}

function ScoreStats (unitNumber : int) {
	GUILayout.BeginVertical();
	GUILayout.FlexibleSpace();
	GUILayout.BeginHorizontal();
	GUILayout.FlexibleSpace();
	GUILayout.Box("Kills      --- " + 	gameController.kills[unitNumber] + " ---  \nDeaths    --- " + gameController.deaths[unitNumber] + " ---  \0");
	GUILayout.FlexibleSpace();
	GUILayout.EndHorizontal();
	GUILayout.FlexibleSpace();
	GUILayout.EndVertical();	
}

function Opponent() {
	NameDisplay(2);
}

function OpponentPic() {
	GUI.BringWindowToBack(21);
	PicDisplay(2);
}

function OpponentBox() {
	ScoreStats(2);
}

function OpponentStats () {
	FullStats(2);
}

function TargetBox() {
	GUI.BringWindowToBack(11);
	GUILayout.BeginVertical();
	GUILayout.FlexibleSpace();
	GUILayout.BeginHorizontal();
	GUILayout.FlexibleSpace();
	
	var boxString : String;
	var nameString : String = FindName(gameController.viewTarget);	
	boxString = "" + nameString + "\n" + gameController.currentHealths[gameController.viewTarget].ToString("F0") + "/" + gameController.maxHealths[gameController.viewTarget].ToString("F0") + 
	"\nAS : " + gameController.attackSpeeds[gameController.viewTarget].ToString("F2") + "\nAD : " + gameController.attackDamages[gameController.viewTarget] + 
	"\nDR : " + gameController.damageReductions[gameController.viewTarget].ToString() + "\nMS : " + gameController.movementSpeeds[gameController.viewTarget].ToString("F1");

	GUILayout.Box(boxString);
	GUILayout.FlexibleSpace();
	GUILayout.EndHorizontal();
	GUILayout.FlexibleSpace();
	GUILayout.EndVertical();
}

function FindName (unitNumber : int) {
	if(unitNumber == 0) {
		return "Devourer";
	}
	else if(unitNumber == 2) {
		return unitData.characterNames[gameController.characterSelected[2]];
	}
	else if(unitNumber == 6)
	{
		return "Treasure";
	}
	else if(unitNumber == 4)
	{
		return "Tower";
	}
	else if(unitNumber == 8)
	{
		return "Guardian";
	}
	else if(unitNumber < 21) {
		return "M. Minion";
	}
	else if(unitNumber < 33) {
		return "R. Minion";
	}
	else if(unitNumber == 34) {
		return "Spider";
	}
	else {
		return "Wasserbar";
	}
}

function FPSBox () {
	timeleft -= Time.deltaTime;
    accum += Time.timeScale/Time.deltaTime;
    ++frames;
 
    // Interval ended - update GUI text and start new interval
    if( timeleft <= 0.0 )    {
        // display two fractional digits (f2 format)       
        fpsText = "" + (accum/frames).ToString("f0");
        timeleft = updateInterval;
        accum = 0.0;
        frames = 0;
    }
    GUILayout.Box("FPS\n" + fpsText);
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
	
	RefreshCo();
}

function RefreshCo () {
	for(var i : int = 0; i < 3; i++) {
		if(i < 2) {	yield WaitForEndOfFrame();		}
		else { RefreshLite(); break; }
	}
}

function Refresh () {
	SetScale();
	SetPaddings();
	SetLocations();
	SetRects();	
	SetMatrix();	
}

var refreshCheck : int = 400;
function RefreshLite () {
	var camCheck : int = camera.pixelWidth/2;
	if(camCheck != refreshCheck) {
		SetPaddings();
		SetLocations();
		SetRects();	
		SetMatrix();	
		refreshCheck = camCheck;
	}
}

function SetSizes () {
	windowX = 0;
	topBarY = 0;
	
	padding = 80; //camera.pixelWidth/100.0;	
	
	topBarHeight = 120; //camera.pixelHeight/5.0;
	bottomBarHeight = 150; //camera.pixelHeight/4.0;
	
	playerWidth = 200; //camera.pixelWidth/4.0;
	pauseWidth = 200; //camera.pixelWidth/4.0;
    skillsWidth = 400; //camera.pixelWidth/2.0;    
	picWidth = 160; //camera.pixelWidth/5.0;	
	uiScaleWidth = 23.0; //camera.pixelWidth/35.0;	
	levelSize = 53; //camera.pixelWidth/15.0;				
}

function SetScale () {
	//min 60%, max 100%
	scale.x = 0.5 + playerData.uiScale * 0.1;
	scale.y = 0.5 + playerData.uiScale * 0.1;
	scale.z = 1.0;
}

function SetPaddings () {
	playerData.topScrollPadding = topBarHeight * (1 + (playerData.uiScale - 5)/10.0);
	playerData.botScrollPadding = bottomBarHeight; //* (1 + (playerData.uiScale - 5)/10.0);
	playerData.topScrollDistance = playerData.topScrollPadding + camera.pixelHeight/(2+playerData.mouseScrollSize);
	playerData.botScrollDistance = playerData.botScrollPadding + camera.pixelHeight/(2+playerData.mouseScrollSize);
	playerData.sideScrollDistance = camera.pixelWidth/playerData.mouseScrollSize;
}

function SetLocations () { 
	var uiScaleValue : float = (1 + (playerData.uiScale - 5)/10.0);
	var uiScaleMiddleValue : float = (1 + (playerData.uiScale - 5)/16.0); 	
	var halfCameraWidth : int = camera.pixelWidth/2;
	var tenthCameraHeight : int = camera.pixelHeight/10;
	
	minimapBackground.pixelInset = Rect(halfCameraWidth, 75, 1, 1);	
	opponentX = (camera.pixelWidth - playerWidth)/uiScaleValue + (playerWidth/uiScaleValue - playerWidth);
	skillsX = (halfCameraWidth - skillsWidth/2.0)/uiScaleValue + (skillsWidth/uiScaleMiddleValue - skillsWidth);		
	visionX = (camera.pixelWidth - pauseWidth)/uiScaleValue + (pauseWidth/uiScaleValue - pauseWidth);
	skillLevelUpsY = topBarHeight/3 * 1.95;
	bottomBarY = (camera.pixelHeight - bottomBarHeight)/uiScaleValue + (bottomBarHeight/uiScaleValue - bottomBarHeight);
	if(playerData.displayingFPS) {
		fpsBoxX = (halfCameraWidth - 50)/uiScaleValue + (100/uiScaleMiddleValue - 100);
		fpsBoxY = (camera.pixelHeight - 220)/uiScaleValue + (70/uiScaleValue - 70);
	}
	if(gameController.isMonsterRespawning) {
//		monsterTimeX = (halfCameraWidth - 27.5)/uiScaleValue + (55 - uiScaleMiddleValue - 55);
//		monsterTimeY = (camera.pixelHeight - 133)/uiScaleValue + (40/uiScaleValue - 40);

		monsterTimeX = (halfCameraWidth - 27);
		monsterTimeY = (camera.pixelHeight - 133);
	}
}

function SetRects () {
	var halfBottomBarHeight : float = bottomBarHeight/2.0;
	var statsY : int = bottomBarY-bottomBarHeight/1.85;
	var statsHeight : int = bottomBarHeight*1.58;
	pauseRect = Rect (windowX,topBarY,pauseWidth,topBarHeight);
	skillsRect = Rect (skillsX,topBarY,skillsWidth,skillLevelUpsY);
	skillLevelUpsRect = Rect (skillsX,skillLevelUpsY,skillsWidth,topBarHeight/3.0);
	visionRect = Rect (visionX,topBarY,pauseWidth,topBarHeight);	
	playerRect = Rect (windowX,bottomBarY,playerWidth,bottomBarHeight/2.0);
	playerPicRect = playerRect;
	playerStatsRect = Rect (windowX,statsY,playerWidth,statsHeight);
	playerBoxRect = Rect (windowX,bottomBarY+halfBottomBarHeight,playerWidth,halfBottomBarHeight);
	opponentRect = Rect (opponentX,bottomBarY,playerWidth,halfBottomBarHeight);
	opponentPicRect = opponentRect;
	opponentStatsRect = Rect (opponentX,statsY,playerWidth,statsHeight);
	opponentBoxRect = Rect (opponentX,bottomBarY+halfBottomBarHeight,playerWidth,halfBottomBarHeight);
	if(displayingStats) { targetBoxRect = Rect(targetBoxX, targetBoxY, 123, 120); }
	if(playerData.displayingFPS) { fpsBoxRect = Rect(fpsBoxX, fpsBoxY, 100, 70); }
}

function SetMatrix () {
	guiMatrix.SetTRS(Vector3.one, Quaternion.identity, scale);
}

function DrawHealthBars () {
	//dont scale stuff below here
	GUI.matrix = guiMatrixNoScale;
	//draw floating health bars
	for(var unit : int = 0; unit < gameController.TOTAL_TARGET_OBJECTS-2; unit++)	{
		//dont draw if its an unattackble chest or guardian
		if(!gameController.gameOver && !(unit == 5 && !gameController.playerGuardianDown) && !(unit == 6 && !gameController.enemyGuardianDown)
		&& !(unit == 7 && !gameController.playerTowerDown) && !(unit == 8 && !gameController.enemyTowerDown) && gameController.currentHealths[unit] >= 1)		{
			var healthPercent = Mathf.Clamp(((gameController.currentHealths[unit])/gameController.maxHealths[unit])*100.0, 0, 100.0f);
			var unitLoc : Vector3;
			var minimap : Camera = gameController.minimap;
			var mapRect : Rect;
			var teamColor : Color;			
			//standard offset, minions, chests, spiders
			var offset : Vector3 = Vector3(0,4,0);
			//neutral monster
			if(unit == 0)			{
				teamColor = Color(0.94,0.63,0.55);
				offset = Vector3(0,6,0);
			}
			//enemy team
			else if(unit%2 == 0)			{
				teamColor = Color(1,0.5,0);
			}
			//player team
			else			{
				teamColor = Color.yellow;
			}
			
			//if its a tower
			if(unit == 3 || unit == 4)			{
				offset = Vector3(0,7,0);
			}
			//else if its a guardian
			else if(unit == 7 || unit == 8)			{
				offset = Vector3(0,5,0);
			}
			
			var uiScaleValue : float = (1 + (playerData.uiScale - 5)/10.0);
			//if its a character
			if(unit == 1 || unit == 2)			{
				if(!(unit == 1 && !playerData.playerHealthBar) && !(unit == 2 && !playerData.enemyHealthBar))				{
					offset = Vector3(0,5,0);
					unitLoc = camera.WorldToScreenPoint(gameController.targetObjects[unit].transform.position + offset); //check for null for results screen load
					mapRect = minimap.pixelRect;
					mapRect.x -= 60;
					mapRect.width += 120;
					mapRect.y -= 10;
					mapRect.height += 40;
					
					if(!mapRect.Contains(unitLoc)) {
						if(unit == gameController.viewTarget) {
							//hightlight	
							DrawLine(Vector2(unitLoc.x - 53, camera.pixelHeight-unitLoc.y-3),Vector2(unitLoc.x+53, camera.pixelHeight-unitLoc.y-3), 
								Color.white, 26);								
							mapRect = minimap.pixelRect;
							mapRect.x -= 60;
							mapRect.width += 120;
							mapRect.y -= 10;
							mapRect.height += 147;
							
							if(!mapRect.Contains(unitLoc)) {
								targetBoxAvailable = true;
								targetBoxX = (unitLoc.x - 63)/uiScaleValue + (62/uiScaleValue - 62);		
								targetBoxY = (camera.pixelHeight - unitLoc.y + 14)/uiScaleValue + (12/uiScaleValue - 12);
							}
							else { targetBoxAvailable = false; }				
						}
						//empty health bar
						DrawLine(Vector2(unitLoc.x-50, camera.pixelHeight-unitLoc.y),Vector2(unitLoc.x+50, camera.pixelHeight-unitLoc.y), Color(0.45,0,0), 10);
						//health percent bar
						DrawLine(Vector2(unitLoc.x-50, camera.pixelHeight-unitLoc.y),Vector2(unitLoc.x-50 + healthPercent, camera.pixelHeight-unitLoc.y), teamColor, 10);
						//if its not ralph
						var charSelected : int = gameController.characterSelected[unit];
						if(!(charSelected == 0))					{
							var manaColor : Color;
							var manaPercent : int = Mathf.Clamp(((gameController.currentResources[unit])/gameController.maxResources[unit])*100.0, 0, 100.0f);
							if(charSelected == 1)						{
								manaColor = Color.red;
							}
							else if(charSelected == 2) {
								manaColor = Color.blue;
							}
							else {
								manaColor = gravitonManaColor;;
							}
							//empty mana bar
							DrawLine(Vector2(unitLoc.x-50, camera.pixelHeight-unitLoc.y+10),Vector2(unitLoc.x+50, camera.pixelHeight-unitLoc.y+10), Color.gray, 10);
							//health percent bar
							DrawLine(Vector2(unitLoc.x-50, camera.pixelHeight-unitLoc.y+10),Vector2(unitLoc.x-50 + manaPercent, camera.pixelHeight-unitLoc.y+10), manaColor, 10);
						}
						else {
							//empty/full mana bar
							DrawLine(Vector2(unitLoc.x-50, camera.pixelHeight-unitLoc.y+10),Vector2(unitLoc.x+50, camera.pixelHeight-unitLoc.y+10), Color.green, 10);
						}
					}
					else { targetBoxAvailable = false; }
				}
			}
			else			{
				unitLoc = camera.WorldToScreenPoint(gameController.targetObjects[unit].transform.position + offset);
				mapRect = minimap.pixelRect;				
				mapRect.x -= 60;
				mapRect.width += 120;
				mapRect.y -= 10;
				mapRect.height += 24;				

				if(!mapRect.Contains(unitLoc)) {
					if(unit == gameController.viewTarget) {
						//hightlight
						DrawLine(Vector2(unitLoc.x - 53, camera.pixelHeight-unitLoc.y-3),Vector2(unitLoc.x+53, camera.pixelHeight-unitLoc.y-3), 
							Color.white, 12);
						mapRect = minimap.pixelRect;
						mapRect.x -= 60;
						mapRect.width += 120;
						mapRect.y -= 10;
						mapRect.height += 130;
						
						if(!mapRect.Contains(unitLoc)) {
							targetBoxAvailable = true;
							targetBoxX = (unitLoc.x - 63)/uiScaleValue + (62/uiScaleValue - 62);
							targetBoxY = (camera.pixelHeight - unitLoc.y)/uiScaleValue + (12/uiScaleValue - 12);
						}
						else { targetBoxAvailable = false; }
					}
					//empty bar
					DrawLine(Vector2(unitLoc.x-50, camera.pixelHeight-unitLoc.y),Vector2(unitLoc.x-50 + 100, camera.pixelHeight-unitLoc.y), Color(0.45,0,0), 6);
					//health percent bar
					DrawLine(Vector2(unitLoc.x-50, camera.pixelHeight-unitLoc.y),Vector2(unitLoc.x-50 + healthPercent, camera.pixelHeight-unitLoc.y), teamColor, 6);				
				}	
				else { targetBoxAvailable = false; }		
			}					
		}		
	}
	//rescale
	GUI.matrix = guiMatrixOrig;
}

//credit unifycommunity, original author: capnbishop, fix by Isaks
//****************************************************************************************************
//  static function DrawLine(rect : Rect) : void
//  static function DrawLine(rect : Rect, color : Color) : void
//  static function DrawLine(rect : Rect, width : float) : void
//  static function DrawLine(rect : Rect, color : Color, width : float) : void
//  static function DrawLine(pointA : Vector2, pointB : Vector2) : void
//  static function DrawLine(pointA : Vector2, pointB : Vector2, color : Color) : void
//  static function DrawLine(pointA : Vector2, pointB : Vector2, width : float) : void
//  static function DrawLine(pointA : Vector2, pointB : Vector2, color : Color, width : float) : void
//  
//  Draws a GUI line on the screen.
//  
//  DrawLine makes up for the severe lack of 2D line rendering in the Unity runtime GUI system.
//  This function works by drawing a 1x1 texture filled with a color, which is then rotated by altering the GUI matrix.  The matrix is restored afterwards.
//****************************************************************************************************

static function DrawLine(rect : Rect) { DrawLine(rect, GUI.contentColor, 1.0); }
static function DrawLine(rect : Rect, color : Color) { DrawLine(rect, color, 1.0); }
static function DrawLine(rect : Rect, width : float) { DrawLine(rect, GUI.contentColor, width); }
static function DrawLine(rect : Rect, color : Color, width : float) { DrawLine(Vector2(rect.x, Camera.main.pixelHeight - rect.y), Vector2(rect.x + rect.width, Camera.main.pixelHeight - (rect.y + rect.height)), color, width); }
static function DrawLine(pointA : Vector2, pointB : Vector2) { DrawLine(pointA, pointB, GUI.contentColor, 1.0); }
static function DrawLine(pointA : Vector2, pointB : Vector2, color : Color) { DrawLine(pointA, pointB, color, 1.0); }
static function DrawLine(pointA : Vector2, pointB : Vector2, width : float) { DrawLine(pointA, pointB, GUI.contentColor, width); }
static function DrawLine(pointA : Vector2, pointB : Vector2, color : Color, width : float) {
    // Save the current GUI matrix, since we're going to make changes to it.
    var matrix = GUI.matrix;
 
    // Generate a single pixel texture if it doesn't exist
    if (!lineTex) {
    	lineTex = Texture2D(1, 1);
    	lineTex.SetPixel(0, 0, Color.white);
    	lineTex.Apply();
    }
 
    // Store current GUI color, so we can switch it back later,
    // and set the GUI color to the color parameter
    var savedColor = GUI.color;
    GUI.color = color;
 
    // Determine the angle of the line.
    var angle = Vector3.Angle(pointB-pointA, Vector2.right);
 
    // Vector3.Angle always returns a positive number.
    // If pointB is above pointA, then angle needs to be negative.
    if (pointA.y > pointB.y) { angle = -angle; }
 
    // Set the rotation for the line.
    //  The angle was calculated with pointA as the origin.
    GUIUtility.RotateAroundPivot(angle, pointA);
 
    // Finally, draw the actual line.
    // We're really only drawing a 1x1 texture from pointA.
    // The matrix operations done with ScaleAroundPivot and RotateAroundPivot will make this
    //  render with the proper width, length, and angle.
	GUI.DrawTexture(new Rect(pointA.x, pointA.y, (pointB - pointA).magnitude, width), lineTex);
 
    // We're done.  Restore the GUI matrix and GUI color to whatever they were before.
    GUI.matrix = matrix;
    GUI.color = savedColor;
}

