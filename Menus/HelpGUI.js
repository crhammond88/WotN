#pragma strict

var mySkin : GUISkin;
var skillIconSkin : GUISkin;

var redGemStyle : GUIStyle;
var blueGemStyle : GUIStyle;
var purpleGemStyle : GUIStyle;

private var padding: int;
private var windowHeight : int;
private var windowWidth : int;
private var windowX : int;
private var windowRect : Rect;

private var keyWidth : int;
private var smallKeyWidth : int;

private var scrollHeight : int;
private var scrollPosition : Vector2[];

private var tabNames : String[] = ["Instructions","Controls","Necromancers","Bestiary","Masters"];
private var bestiaryNames : String[] = ["Monster","Guardian","Minions","Structures"];
private var masterNames : String[] = ["Patton","Musashi","Napoleon","Sun Tzu","  ?  \0"];
var masterTabNumber : int;

private var playerData : PlayerData;
private var unitData : UnitData;

private var tooltipRect : Rect;
private var tooltipString : String;
private var lastTooltip : String;
var drawToolTip : boolean;
private var tooltipY : int;
var tooltipSize : int;
var heightTestGUI : GUISkin;
private static var gemWidth : int = 130;

private var skillIconStyles : GUIStyle[,];

private var buttonPressSound : AudioSource;

function Awake () {
	SetSizes();
	Refresh();
	
	playerData = GameObject.FindGameObjectWithTag("Data").GetComponent(PlayerData);	
	unitData = GameObject.FindGameObjectWithTag("Data").GetComponent(UnitData);
	
	scrollPosition = new Vector2[20];
	
	padding = 8;
	
	windowHeight = 600;
	windowWidth = 800 - padding*2;
	windowX = padding;	
	windowRect = Rect (windowX,0,windowWidth,windowHeight);
	
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
}

function Open () {
	GUI.skin = mySkin;
	//GUI.matrix = guiMatrix;
	
	Refresh();
	windowRect = GUI.Window (0, windowRect, DoMyWindow, "");
}

function SetSizes () {
	keyWidth = 132; //camera.pixelWidth/6.0;
	smallKeyWidth = 100; //camera.pixelWidth/8.0;
}

function Refresh () {
	if(tooltipString != lastTooltip) {	
		if (lastTooltip != "") {
			drawToolTip = false;
		}
		if (tooltipString != "") {
			drawToolTip = true;
		}
		lastTooltip = tooltipString;
	} 
	if(drawToolTip && playerData.helpTabNumber == 2) {	
		//(camera.pixelWidth - playerWidth)/uiScaleValue + (playerWidth/uiScaleValue - playerWidth);
		var tooltipX : float = Input.mousePosition.x * 800 / Camera.main.pixelWidth  - 130;
		tooltipY = 600 - Input.mousePosition.y * 600 / Camera.main.pixelHeight;	
		var tooltipWidth : float = 260;	
		var tooltipHeight : float = 200;
		var nameOfSkill : String = "";				
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
		else if(tooltipY > 600 - tooltipHeight/2.0 -50) { tooltipY = 600 - tooltipHeight*1.5 - 25; }			
		tooltipRect = Rect(tooltipX, tooltipY, tooltipWidth, tooltipHeight);		
		tooltipRect = GUI.Window(13, tooltipRect, DoMyTooltipWindow, nameOfSkill);
	}	
}

function DoMyTooltipWindow (windowID : int) {
	GUILayout.BeginVertical();
	GUILayout.Space(22);
	GUILayout.Label("", "Divider");
	var printedTip : String = tooltipString;
	if(tooltipString.Contains("$")) { 
		var splitSkillStrings : String[] = tooltipString.Split("$"[0]);		
		printedTip =  splitSkillStrings[1] + "\n----------\n" + splitSkillStrings[2];
	}
	GUI.BringWindowToFront(13);
	GUILayout.BeginVertical();		
	GUILayout.FlexibleSpace();
	GUILayout.Box(printedTip);
	GUILayout.FlexibleSpace();
	GUILayout.EndVertical();
	GUILayout.EndVertical();
}

function DoMyWindow (windowID : int) {
	GUILayout.BeginVertical();
	GUILayout.Space(8);
	GUILayout.Label("", "Divider");
	GUILayout.Label("Help");
	GUILayout.BeginHorizontal();
	
	var oldTabNumber : int = playerData.helpTabNumber;
	playerData.helpTabNumber = GUILayout.Toolbar(playerData.helpTabNumber,tabNames);
	if(oldTabNumber != playerData.helpTabNumber) {
		if(!playerData.effectMuted) { buttonPressSound.Play(); }
	}
	GUILayout.EndHorizontal();
	
	if(playerData.helpTabNumber == 0)		{
		Instructions();
	}
	else if(playerData.helpTabNumber == 1)		{
		Controls();
	}
	else if(playerData.helpTabNumber == 2)		{
		Characters();
	}
	else if(playerData.helpTabNumber == 3)		{
		Bestiary();
	}
	else if(playerData.helpTabNumber == 4)		{
		Masters();
	}
		
	//back button
	GUILayout.BeginHorizontal();
	GUILayout.Label("", "Divider");
	if(GUILayout.Button ("Back", "ShortButton")) {
		playerData.helpOpen = false;
		if(!playerData.effectMuted) { buttonPressSound.Play(); }
	}
	GUILayout.Label("", "Divider");
	GUILayout.EndHorizontal();
	GUILayout.EndVertical();		
}

function Instructions () {
	scrollPosition[0] = GUILayout.BeginScrollView(scrollPosition[0], false, false);
	var forcedSpace : int = 25;
	GUILayout.Label("Challenge Select");
	GUILayout.Box("Welcome to War of the Necromancers!\n\nEach Challenge consists of a battle between the player’s chosen Necromancer and the opponent Necromancer selected. The difficulty setting only affects the competence of the opponent Necromancer.");
	GUILayout.FlexibleSpace();
	GUILayout.Space(forcedSpace);
	
	GUILayout.Label("Objective");
	GUILayout.Box("In battle, each Necromancer leads a team of Undead Skeletons in an effort to destroy the enemies Gem Chest. The first team to destroy the opposing Gem Chest wins the Challenge.\n\nNecromancers spawn waves of Skeletons once every minute for their team. Each wave consists of three Melee Skeletons and three Ranged Skeletons. A Necromancer can only maintain a maximum of twelve Skeletons on the field at any time.\n\nThe Gem Chest is guarded by a Skeleton Guardian and a Tower. The Tower must be defeated before the Guardian can be damaged, and the Guardian must be defeated before the Gem Chest can be damaged. The Guardian respawns two minutes after being defeated.");
	GUILayout.FlexibleSpace();
	GUILayout.Space(forcedSpace);
	
	GUILayout.Label("Combat");
	GUILayout.Box("To move, right-click anywhere on the open field. Right-clicking on the minimap allows you to quickly set destinations far away. Basic Attacks can be performed by right-clicking on Enemy Units. Basic Attacks reduce the target’s Health. When the Health of any Unit drops below 1, that Unit is defeated. Necromancers respawn quickly after defeat at their starting locations.\n\nEach Necromancer has a unique set of Skills with a variety of effects. Necromancers have one automatic Skill, three primary Skills and one Ultimate Skill. Automatic Skills are effective at level one and scale automatically. Primary Skills must be learned and improved using Skill Points. A maximum of three Skill Points can be spent on each Primary Skill. Ultimate Skills cannot be learned until level five and cannot be improved with Skill Points once learned. Ultimate Skills automatically scale.\n\nSkills can be either Active or Passive. The tooltips for each Skill give detailed information about the effects. Passive Skills provide a constant bonus. Active Skills can be aimed by left-clicking on the corresponding icon. Left-click an appropriate target while aiming to activate the Skill. Some Active Skills don’t need to be aimed and activate instantly. Skills can also be aimed by pressing the appropriate hotkey (see the Controls section for more information).\n\nAll Units start at level one at the beginning of a Challenge. Units can reach a maximum level of 10. Necromancers level up by defeating Enemy Units and earning experience. Skeletons and the Devourer level up slowly based on the time elapsed on the Game Clock. Structures do not increase in level. Necromancers earn Skill Points with each level increase. Skills Points are used to learn new Skills or boost the effectiveness of current Skills.\n\nAll Units gain stat increases upon reaching a new level. The stats of each unit influence a variety of combat factors. The Necromancer Information and Bestiary sections contain detailed information about the starting and growth stats of each Unit. Real-time stats can be viewed during a Challenge via the Stats Display hotkey. The Stats Display can be set to Hold (default) or Toggle in the Settings menu.");
	GUILayout.FlexibleSpace();
	GUILayout.Space(forcedSpace);

	GUILayout.Label("Devourer");
	GUILayout.Box("The Devourer awaits daring Necromancers at the top-center of the field. The Devourer can be defeated for extra experience and a temporary stat buff. The buff lasts for two minutes and increases Health Regeneration, Damage Reduction and Movement Speed. The Devourer respawns two minutes after being defeated.");
	GUILayout.FlexibleSpace();
	GUILayout.Space(forcedSpace);	

	GUILayout.Label("Gems");
	GUILayout.Box("A Gem is awarded when a Challenge is completed successfully. Gems are used to unlock access to additional Necromancers and Challenges. A standard victory earns a Red Gem. Winning with zero deaths earns a Blue Gem. A Purple Gem can only be earned by achieving flawless victory in under seven minutes on the Game Clock. In addition to zero deaths, the player’s Tower must still be standing for a victory to be flawless.");
	GUILayout.FlexibleSpace();
	
	GUILayout.EndScrollView();	
}

function Controls () {
	scrollPosition[15] = GUILayout.BeginScrollView(scrollPosition[15], false, false);
	GUILayout.BeginHorizontal();
	//GUILayout.FlexibleSpace();
	GUILayout.Label("Battlefield");
	//GUILayout.FlexibleSpace();
	GUILayout.EndHorizontal();
	
	GUILayout.BeginHorizontal();	
	GUILayout.FlexibleSpace();
	GUILayout.BeginVertical();	
	GUILayout.FlexibleSpace();
	
	GUILayout.BeginHorizontal();
	
	GUILayout.BeginVertical();
	
	GUILayout.BeginHorizontal();
	GUILayout.FlexibleSpace();
	GUILayout.Label("Mouse");
	GUILayout.FlexibleSpace();
	GUILayout.EndHorizontal();
	
	GUILayout.BeginHorizontal();
	GUILayout.FlexibleSpace();
	//battlefield mouse
	GUILayout.Box("Left Click - Execute Skill\n" +
		"Right Click - Move, Basic Attack, Cancel Skill\n\n" +
		"Mouse Wheel - Zoom Out & In");
	GUILayout.FlexibleSpace();
	GUILayout.EndHorizontal();
	
	GUILayout.EndVertical();	
	GUILayout.FlexibleSpace();	
	GUILayout.BeginVertical();
	
	GUILayout.BeginHorizontal();
	GUILayout.FlexibleSpace();
	GUILayout.Label("Keyboard");
	GUILayout.FlexibleSpace();
	GUILayout.EndHorizontal();
		
	GUILayout.BeginHorizontal();
	GUILayout.FlexibleSpace();
	//battlefield keyboard
	GUILayout.Box("" + playerData.keySettings[13] + " Key - Execute Skill\n" +
		playerData.keySettings[14] + " Key - Move, Basic Attack, Cancel Skill\n\n" +
		playerData.keySettings[11] + " & " + playerData.keySettings[12] + " Keys - Zoom Out & In\n" +
		"WASD Keys / Arrow Keys - Camera Movement\n" +
		playerData.keySettings[8] + " Key - Camera Lock\n" +
		playerData.keySettings[9] + " Key - Camera Focus on Player\n" +
		playerData.keySettings[10] + " Key - Camera Focus on Target\n\n" +			
		playerData.keySettings[0] + ", " + playerData.keySettings[1] + ", " + playerData.keySettings[2] + " Keys - Skills\n" +
		playerData.keySettings[3] + " Key - Ultimate Skill\n" +		
		playerData.keySettings[4] + ", " + playerData.keySettings[5] + ", " + playerData.keySettings[6] + ", " + playerData.keySettings[7] + " Keys - Level Up Skills\n\n" +		
		playerData.keySettings[18] + " Key - Teleport to base/starting location\n\n" +
		playerData.keySettings[15] + " Key - Display Stats\n" +
		playerData.keySettings[16] + " Key - UI Toggle\n" +
		playerData.keySettings[17] + " Key - Pause\n" +
		"F11 Key - Fullscreen");
	GUILayout.FlexibleSpace();
	GUILayout.EndHorizontal();
	
	GUILayout.EndVertical();
	
	GUILayout.EndHorizontal();	
	
	GUILayout.FlexibleSpace();
	
	GUILayout.BeginHorizontal();
	//GUILayout.Label("", "Divider");
	GUILayout.Label("Minimap");	
	//GUILayout.Label("", "Divider");
	GUILayout.EndHorizontal();	
	
	GUILayout.BeginVertical();
	GUILayout.FlexibleSpace();
	GUILayout.BeginHorizontal();
	GUILayout.FlexibleSpace();
	
	GUILayout.BeginVertical();
	GUILayout.FlexibleSpace();
	
	GUILayout.BeginHorizontal();
	GUILayout.FlexibleSpace();
	GUILayout.Label("Mouse");
	GUILayout.FlexibleSpace();
	GUILayout.EndHorizontal();
	
	GUILayout.BeginHorizontal();
	GUILayout.FlexibleSpace();
	//minimap mouse
	GUILayout.Box("Left Click - Center Camera at Location\n" +
		"Right Click - Move, Basic Attack, Cancel Skill");	//(Hold & Drag to Move Camera)
	GUILayout.FlexibleSpace();
	GUILayout.EndHorizontal();
	
	GUILayout.FlexibleSpace();
	GUILayout.EndVertical();
	
	GUILayout.FlexibleSpace();	
	
	GUILayout.BeginVertical();
	GUILayout.FlexibleSpace();
	
	GUILayout.BeginHorizontal();
	GUILayout.FlexibleSpace();
	GUILayout.Label("Keyboard");
	GUILayout.FlexibleSpace();
	GUILayout.EndHorizontal();
	
	GUILayout.BeginHorizontal();
	GUILayout.FlexibleSpace();
	//minimap keyboard
	GUILayout.Box("" + playerData.keySettings[13] + " Key - Center Camera at Location\n" +
		 playerData.keySettings[14] + " Key - Move, Basic Attack, Cancel Skill");
	GUILayout.FlexibleSpace();
	GUILayout.EndHorizontal();
	
	GUILayout.FlexibleSpace();
	GUILayout.EndVertical();
	
	GUILayout.FlexibleSpace();
	GUILayout.EndHorizontal();
	GUILayout.FlexibleSpace();
	GUILayout.EndVertical();
	
	GUILayout.FlexibleSpace();
	GUILayout.EndVertical();
	GUILayout.FlexibleSpace();	
	GUILayout.EndHorizontal();
	GUILayout.EndScrollView();	
}

var characterViewing : int = 0;
var viewTab : int = 0;
var viewTabNames : String[] = ["Stats", "Story", "Masters"];

function Characters () {	
	GUILayout.BeginVertical();
	GUILayout.Space(8);
	GUILayout.Label("", "Divider");	
	
	//character selected name display/change	
	var oldTabNumber : int = characterViewing;
	characterViewing = GUILayout.Toolbar(characterViewing, unitData.characterNames);
	if(oldTabNumber != characterViewing) {
		if(!playerData.effectMuted) { buttonPressSound.Play(); }
	}
	//GUILayout.Space(20);
	GUILayout.BeginHorizontal();
	GUILayout.FlexibleSpace();
	//for each difficulty, sum gems earned
	var redGems : int = 0;
	var blueGems : int = 0;
	var purpleGems : int = 0;
	for(var o : int = 0; o < 5; o++)	{
		//for each opponent char
		for(var p : int = 0; p < 4; p++)		{	
			var gemFinder : int = characterViewing*20 + o*4 + p;
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
	
	
	var viewTarget : int = characterViewing;
	if(viewTab == 0) {
		scrollPosition[1] = GUILayout.BeginScrollView(scrollPosition[1], false, false);
		var skillTooltips : String[] = new String[5];
	    skillTooltips[0] = unitData.skillTooltips[viewTarget, 0];
	    skillTooltips[1] = unitData.skillTooltips[viewTarget, 1];
	    skillTooltips[2] = unitData.skillTooltips[viewTarget, 2];
	    skillTooltips[3] = unitData.skillTooltips[viewTarget, 3];
	    skillTooltips[4] = unitData.skillTooltips[viewTarget, 4];
	    var skillTooltipNumbers : String[] = new String[5];
	    skillTooltipNumbers[0] = unitData.skillTooltipInfo[viewTarget, 0];
	    skillTooltipNumbers[1] = unitData.skillTooltipInfo[viewTarget, 1];
	    skillTooltipNumbers[2] = unitData.skillTooltipInfo[viewTarget, 2];
	    skillTooltipNumbers[3] = unitData.skillTooltipInfo[viewTarget, 3];
	    skillTooltipNumbers[4] = unitData.skillTooltipInfo[viewTarget, 4];
	    var skillNames : String[] = new String[5];
	    skillNames[0] = unitData.passiveNames[viewTarget];
	    skillNames[1] = unitData.skillOneNames[viewTarget];
	    skillNames[2] = unitData.skillTwoNames[viewTarget];
	    skillNames[3] = unitData.skillThreeNames[viewTarget];
	    skillNames[4] = unitData.ultimateNames[viewTarget];
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
	
	//close layout
	GUILayout.EndVertical();	
	
	tooltipString = GUI.tooltip;
}

function Bestiary () {
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

function Masters () {
	var nameString : String = "General George S. Patton, Jr.";
	var bodyText : String = "\" You shouldn't underestimate an enemy, but it is just as fatal to overestimate him. \"\n\n" +
		"\" Take calculated risks. That is quite different from being rash. \"\n\n" +
		"\" Infantry must move forward to close with the enemy. It must shoot in order to move...\nTo halt under fire is folly. To halt under fire and not fire back is suicide.\nOfficers must set the example. \"\n\n" +
		"\" Never let the enemy pick the battle site. \"\n\n" +		
		"-------\n\n" +	
		"\" Good tactics can save even the worst strategy.\nBad tactics will destroy even the best strategy. \"\n\n" +
		"\" There is only one tactical principle which is not subject to change.\nIt is to use the means at hand to inflict the maximum amount of\nwound, death, and destruction on the enemy in the minimum amount of time. \"\n\n" +	
		"\" In case of doubt, attack. \"\n\n" +
		"\" You’re never beaten until you admit it. \"";
	GUILayout.Label("Masters");
	
	var oldTabNumber : int = masterTabNumber;
	masterTabNumber = GUILayout.Toolbar(masterTabNumber,masterNames);
	if(oldTabNumber != masterTabNumber) {
		if(!playerData.effectMuted) { buttonPressSound.Play(); }
	}
	
	switch(masterTabNumber) {
	case 0:
		scrollPosition[10] = GUILayout.BeginScrollView(scrollPosition[10], false, false);
		break;
	case 1:	
		scrollPosition[11] = GUILayout.BeginScrollView(scrollPosition[11], false, false);
		nameString = "Miyamoto Musashi";
		bodyText = "\" You win battles by knowing the enemy's timing,\nand using a timing which the enemy does not expect. \"\n\n" +
			"\" When your opponent is hurrying recklessly, you must act contrarily and keep calm.\nYou must not be influenced by the opponent. \"\n\n" +		
			"\" The important thing in strategy is to suppress the enemy's useful actions\nbut allow his useless actions. \"\n\n" +
			"\" Do nothing which is of no use. \"\n\n" +
			"-------\n\n" +	
			"\" You should not have a favourite weapon.\nTo become over-familiar with one weapon is as much a fault as not knowing it sufficiently well. \"\n\n" +
			"\" When in a fight to the death, one wants to employ all one's weapons to the utmost.\nI must say that to die with one's sword still sheathed is most regrettable. \"\n\n" +
			"\" Perception is strong and sight weak.\nIn strategy it is important to see distant things as if they were close\nand to take a distanced view of close things. \"\n\n" +
			"\" From one thing, know ten thousand things.\nIf you are to practice the way of strategy, nothing must escape your eyes. Reflect well on this. \"";
		break;
	case 2:
		scrollPosition[12] = GUILayout.BeginScrollView(scrollPosition[12], false, false);
		nameString = "Napoleon Bonaparte";
		bodyText = "\" Never interrupt your enemy when he is making a mistake. \"\n\n" +		
			"\" All great events hang by a single thread.\nThe clever man takes advantage of everything, neglects nothing that may give him some added opportunity;\nthe less clever man, by neglecting one thing, sometimes misses everything. \"\n\n" +
			"\" If the art of war were nothing but the art of avoiding risks,\nglory would become the prey of mediocre minds. \"\n\n" +
			"\" A commander in chief ought to say to himself several times a day:\n'If the enemy should appear on my front, on my right, on my left, what would I do?'\nAnd if the question finds him uncertain, he is not well placed,\nhe is not as he should be, and he should remedy it. \"\n\n" +
			"-------\n\n" +	
			"\" Ability is nothing without opportunity. \"\n\n" +
			"\" Take time to deliberate, but when the time for action has arrived, stop thinking and go in. \"\n\n" +	
			"\" The nature of strategy consists of always having, even with a weaker army,\nmore forces at the point of attack or at the point where one is being attacked than the enemy. \"\n\n" +			
			"\" In war, theory is all right so far as general principles are concerned;\nbut in reducing general principles to practice there will always be danger.\nTheory and practice are the axis about which the sphere of accomplishment revolves. \"";	
		break;
	case 3:
		scrollPosition[13] = GUILayout.BeginScrollView(scrollPosition[13], false, false);
		nameString = "Sun Tzu";
		bodyText = "\" He who is prudent and lies in wait for an enemy who is not, will be victorious. \"\n\n" +
			"\" He who knows when he can fight and when he cannot, will be victorious. \"\n\n" +
			"\" If you know the enemy and know yourself, you need not fear the results of a hundred battles. \"\n\n" +		
			"\" If ignorant both of your enemy and yourself, you are certain to be in peril. \"\n\n" +
			"-------\n\n" +	
			"\" Invincibility lies in the defence; the possibility of victory in the attack. \"\n\n" +
			"\" The good fighters of old first put themselves beyond the possibility of defeat,\nand then waited for an opportunity of defeating the enemy. \"\n\n" +
			"\" Strategy without tactics is the slowest route to victory.\nTactics without strategy is the noise before defeat. \"\n\n" +
			"\" Thus, what is of supreme importance in war is to attack the enemy's strategy. \"";	
		break;
	case 4:
		scrollPosition[14] = GUILayout.BeginScrollView(scrollPosition[14], false, false);
		nameString = "  ?  \0";
		bodyText = "\" Notice that the stiffest tree is most easily cracked,\nwhile the bamboo or willow survives by bending with the wind. \"\n- Bruce Lee" +	
			"\n\n\" Ten soldiers wisely led will beat a hundred without a head. \"\n- Euripides" +		
			"\n\n\" We must expect reverses, even defeats.\nThey are sent to teach us wisdom and prudence, to call forth greater energies,\nand to prevent our falling into greater disasters. \"\n- Robert E. Lee"
			+ "\n\n\" Experience is the teacher of all things. \"\n- Julius Caesar" +
			"\n\n\" Ultimately, you must forget about technique.\nThe further you progress, the fewer teachings there are.\nThe Great Path is really NO PATH. \"\n- Ueshiba Morihei";
		break;	
	}
	GUILayout.BeginHorizontal();
	GUILayout.Label("", "Divider");
	GUILayout.Label(nameString);	
	GUILayout.Label("", "Divider");
	GUILayout.EndHorizontal();
	
	GUILayout.Box(bodyText);
	GUILayout.FlexibleSpace();
	GUILayout.EndScrollView();
}