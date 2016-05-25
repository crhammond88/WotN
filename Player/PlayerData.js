#pragma strict
//tag = Data
//static var test : boolean = false;
static var firstTitleLoad : boolean = true;
static var fieldLoaded : boolean = false;

//challenge select
static var characterSelected : int;
static var difficultySelected : int;
static var opponentSelected : int;
static var characterDone : boolean;
static var challengeSelected : int;
static var viewing : boolean;
static var difficultyDone : boolean;

//results
static var finalKills : int;
static var finalDeaths : int;
static var finalLevel : int;
static var finalClock : float; 

//help
static var helpTabNumber : int = 0;
static var helpOpen : boolean = false;

//settings
static var tabNumber : int = 0;
static var settingsOpen : boolean = false;

//saved settings
static var firstTimePlaying : boolean;
//visual
static var fullscreen : boolean = false;//not saved
static var displayingFPS : boolean;
static var scrollSpeed : float;
static var cameraLocked : boolean;
static var zoomValue : int;
static var maxZoom : int = 17;//not saved
static var minZoom : int = 7;//not saved
static var zoomLocked : boolean;
static var mouseScrollSize : float;
static var mouseScrollMax : float = 10.0f;//not saved
static var mouseScrollMin: float = 20.0f;//not saved
static var mouseScrollOn : boolean;

//sound
static var musicVolume : int;
static var musicMuted : boolean;
static var effectVolume : int;
static var effectMuted : boolean;

//UI
static var playerHealthBar : boolean;
static var enemyHealthBar : boolean;
static var quickCast : boolean;
static var autoAttack : boolean;
static var statsToggle : boolean;
static var expToggle : boolean;
static var uiToggle : boolean;
static var uiScale : int;
static var minimapScale : int;
static var uiMax : int = 5;//not saved
static var uiMin : int = 1;//not saved
static var hudOpacity : float; 
static var topScrollPadding : float;//not saved
static var botScrollPadding : float;  //not saved
static var topScrollDistance : float; //not saved
static var botScrollDistance : float;//not saved
static var sideScrollDistance : float;//not saved


//keyboard
static var settingKey : boolean = false;//not saved
//0:3skill1-4,4:7skillUp1-4,8cameraLock,9cameraSelf,10cameraTarget,11cameraZoomOut, 12cameraZoomIn, 13mouseOne, 14mouseTwo, 15stats, 16uiToggle, 17pause, 18teleport
static var keySettings : KeyCode[];

//Gems
static var gemEarned : int;
//0-19 Ralph; 20-39 Ros; 40-59 Leon; 60-79 Grav;
//0-3 beg; 4-7 nov; 8-11 inter; 12-15 vet; 16-19 expert; 
static var gems : int[];
static var challengeTimes : int[];
//testing
//gems[0] = 1;
//gems[1] = 2;
//gems[2] = 3;


function Awake () {
	DontDestroyOnLoad (this.gameObject);
	//!!!CAUTION!!!//PlayerPrefs.DeleteAll(); ---- !CAUTION! ---- Deletes ALL Client-side Saved Data
	LoadSettings();
}

function Update () {
	ToggleFS();
}

function ToggleFS () {
	if(Input.GetKeyDown(KeyCode.F11))	{
		FullScreen();
	}
}

function FullScreen () {
	if(!fullscreen) {
		fullscreen = true;
		Screen.SetResolution(Screen.currentResolution.width, Screen.currentResolution.height, true);		
	}
	else {
		fullscreen = false;
		Screen.SetResolution (800, 600, false);
	}
}

function LoadSettings () {
	if(PlayerPrefs.HasKey("firstTimePlaying")) {	firstTimePlaying = PlayerPrefs.GetInt("firstTimePlaying") == 1;	}
	else {	firstTimePlaying = true; } 
	//visual
	if(PlayerPrefs.HasKey("displayingFPS")) {	displayingFPS = PlayerPrefs.GetInt("displayingFPS") == 1;	}
	else {	displayingFPS = false; } 
	if(PlayerPrefs.HasKey("scrollSpeed")) {		scrollSpeed = PlayerPrefs.GetFloat("scrollSpeed");	}
	else {	scrollSpeed = 25.0; } 
	if(PlayerPrefs.HasKey("cameraLocked")) {	cameraLocked = PlayerPrefs.GetInt("cameraLocked") == 1;	}
	else {	cameraLocked = false; } 
	if(PlayerPrefs.HasKey("zoomValue")) {		zoomValue = PlayerPrefs.GetInt("zoomValue");	}
	else {	zoomValue = 17; } 	
	if(PlayerPrefs.HasKey("zoomLocked")) {	zoomLocked = PlayerPrefs.GetInt("zoomLocked") == 1;	}
	else {	zoomLocked = false; } 	
	if(PlayerPrefs.HasKey("mouseScrollOn")) {		mouseScrollOn = PlayerPrefs.GetInt("mouseScrollOn") == 1;	}
	else {	mouseScrollOn = true; } 	
	if(PlayerPrefs.HasKey("mouseScrollSize")) {		mouseScrollSize = PlayerPrefs.GetFloat("mouseScrollSize");	}
	else {	mouseScrollSize = 15.0; } 
	//audio
	if(PlayerPrefs.HasKey("musicMuted")) {		musicMuted = PlayerPrefs.GetInt("musicMuted") == 1;	}
	else {	musicMuted = false; } 	
	if(PlayerPrefs.HasKey("effectMuted")) {		effectMuted = PlayerPrefs.GetInt("effectMuted") == 1;	}
	else {	effectMuted = false; } 
	if(PlayerPrefs.HasKey("musicVolume")) {		musicVolume = PlayerPrefs.GetInt("musicVolume");	}
	else {	musicVolume = 40; } 
	if(PlayerPrefs.HasKey("effectVolume")) {		effectVolume = PlayerPrefs.GetInt("effectVolume");	}
	else {	effectVolume = 50; } 
	//interface
	if(PlayerPrefs.HasKey("playerHealthBar")) {		playerHealthBar = PlayerPrefs.GetInt("playerHealthBar") == 1;	}
	else {	playerHealthBar = true; } 
	if(PlayerPrefs.HasKey("enemyHealthBar")) {		enemyHealthBar = PlayerPrefs.GetInt("enemyHealthBar") == 1;	}
	else {	enemyHealthBar = true; }
	if(PlayerPrefs.HasKey("quickCast")) {		quickCast = PlayerPrefs.GetInt("quickCast") == 1;	}
	else {	quickCast = false; }
	if(PlayerPrefs.HasKey("autoAttack")) {		autoAttack = PlayerPrefs.GetInt("autoAttack") == 1;	}
	else {	autoAttack = true; }
	if(PlayerPrefs.HasKey("statsToggle")) {		statsToggle = PlayerPrefs.GetInt("statsToggle") == 1;	}
	else {	statsToggle = false; }
	if(PlayerPrefs.HasKey("expToggle")) {		expToggle = PlayerPrefs.GetInt("expToggle") == 1;	}
	else {	expToggle = true; }
	if(PlayerPrefs.HasKey("uiToggle")) {		uiToggle = PlayerPrefs.GetInt("uiToggle") == 1;	}
	else {	uiToggle = true; }
	if(PlayerPrefs.HasKey("uiScale")) {		uiScale = PlayerPrefs.GetInt("uiScale");	}
	else {	uiScale = 5; } 
	if(PlayerPrefs.HasKey("minimapScale")) {		minimapScale = PlayerPrefs.GetInt("minimapScale");	}
	else {	minimapScale = 5; } 
	if(PlayerPrefs.HasKey("hudOpacity")) {		hudOpacity = PlayerPrefs.GetFloat("hudOpacity");	}
	else {	hudOpacity = 1.0; } 
	//hot keys
	keySettings = GetKeySettings();
	LoadPowerSettings();
}

function SaveSettings () {
	PlayerPrefs.SetInt("firstTimePlaying", 0);
	PlayerPrefs.SetInt("displayingFPS", displayingFPS?1:0);
	PlayerPrefs.SetFloat("scrollSpeed", scrollSpeed);
	PlayerPrefs.SetInt("cameraLocked", cameraLocked?1:0);
	PlayerPrefs.SetInt("zoomValue", zoomValue);
	PlayerPrefs.SetInt("zoomLocked", zoomLocked?1:0);
	PlayerPrefs.SetInt("mouseScrollOn", mouseScrollOn?1:0);
	PlayerPrefs.SetFloat("mouseScrollSize", mouseScrollSize);
	PlayerPrefs.SetInt("musicMuted", musicMuted?1:0);
	PlayerPrefs.SetInt("effectMuted", effectMuted?1:0);
	PlayerPrefs.SetInt("musicVolume", musicVolume);
	PlayerPrefs.SetInt("effectVolume", effectVolume);
	PlayerPrefs.SetInt("playerHealthBar", playerHealthBar?1:0);
	PlayerPrefs.SetInt("enemyHealthBar", enemyHealthBar?1:0);
	PlayerPrefs.SetInt("quickCast", quickCast?1:0);
	PlayerPrefs.SetInt("autoAttack", autoAttack?1:0);
	PlayerPrefs.SetInt("statsToggle", statsToggle?1:0);
	PlayerPrefs.SetInt("expToggle", expToggle?1:0);
	PlayerPrefs.SetInt("uiToggle", uiToggle?1:0);
	PlayerPrefs.SetInt("uiScale", uiScale);
	PlayerPrefs.SetInt("minimapScale", minimapScale);
	PlayerPrefs.SetFloat("hudOpacity", hudOpacity);
	SetKeySettings();	
	PlayerPrefs.Save();
}

function LoadPowerSettings() {
	if(PlayerPrefs.HasKey("energySaver")) {	gems = EnergyCheck();	}
	else {	gems = new int[80]; } 
	if(PlayerPrefs.HasKey("powerSaver")) {	challengeTimes = PowerCheck();	}
	else {	challengeTimes = new int[80]; } 
}

function SavePowerSettings () {
	var energySaver : String = EnergySaver();
	var powerSaver : String = PowerSaver();
	PlayerPrefs.SetString("energySaver", energySaver);
	PlayerPrefs.SetString("powerSaver", powerSaver);
	PlayerPrefs.Save();
}

function EnergyCheck () {
	var energyStrings : String[] = EnergyLevel(PowerDetector(PlayerPrefs.GetString("energySaver")), 0).Split(","[0]);
	var energyCount : int[] =  new int[80];
	var parseNum : int;
	var counter : int = 0;
	for(var energyVar in energyStrings) {		
		if(energyVar != "") {
			parseNum = parseInt(energyVar);
			energyCount[counter] = parseNum;
		}
		counter++;
	}
	return energyCount;
}

function PowerCheck () {
 	var powerStrings : String[] = PowerLevel(PlayerPrefs.GetString("powerSaver"), 0).Split(","[0]);
	var powerCount : int[] =  new int[80];
	var parseNum : int;
	var counter : int = 0;
	for(var powerVar in powerStrings) {
		if(powerVar != "") {
			parseNum = parseInt(powerVar);
			powerCount[counter] = parseNum;
		}
		counter++;
	}
	return powerCount;
}

function EnergySaver () {
	var energyString : String = "";
	for(var sparkle in gems) { energyString += sparkle.ToString() + ","; }
	return EnergyLevel(energyString, 1);
}

function PowerSaver () {
	var powerString : String = "";
	for(var sparkle in challengeTimes) { powerString += sparkle.ToString() + ","; }
	return PowerLevel(powerString, 1);
}

function EnergyLevel (energySaverString : String, type : int) {
	if(type == 0)	{	return  energySaverString[16:96] + energySaverString[112:];	} 
	else {	return PowerDetector("2310220002001000" + energySaverString[:80] + "0000220000001000" + energySaverString[80:]); }
}

function PowerLevel (powerSaverString : String, type : int) {
	if(type == 0)	{	return PowerDetector(powerSaverString); 	}
	else { return PowerDetector(powerSaverString);  }
}

function PowerDetector (powerVoltage : String)	{
	var standardVoltage : int = 129;
	var voltageMeter : String = "";
	var volt : char;
	for(var i : int = 0; i < powerVoltage.length; i++) {	volt = (parseInt(powerVoltage[i]) ^ standardVoltage)%255; voltageMeter += volt;	}
	return voltageMeter;
}

function GetKeySettings() {	
	var skillOneKey : KeyCode = PlayerPrefs.GetInt("skillOneKey", parseInt(KeyCode.Alpha1));
	var skillTwoKey : KeyCode = PlayerPrefs.GetInt("skillTwoKey", parseInt(KeyCode.Alpha2));
	var skillThreeKey : KeyCode = PlayerPrefs.GetInt("skillThreeKey", parseInt(KeyCode.Alpha3));
	var skillFourKey : KeyCode = PlayerPrefs.GetInt("skillFourKey", parseInt(KeyCode.Alpha4));
	var skillOneLevelKey : KeyCode = PlayerPrefs.GetInt("skillOneLevelKey", parseInt(KeyCode.F1));
	var skillTwoLevelKey : KeyCode = PlayerPrefs.GetInt("skillTwoLevelKey", parseInt(KeyCode.F2));
	var skillThreeLevelKey : KeyCode = PlayerPrefs.GetInt("skillThreeLevelKey", parseInt(KeyCode.F3));
	var skillFourLevelKey : KeyCode = PlayerPrefs.GetInt("skillFourLevelKey", parseInt(KeyCode.F4));
	var cameraLockKey : KeyCode = PlayerPrefs.GetInt("cameraLockKey", parseInt(KeyCode.Y));
	var cameraSelfKey : KeyCode = PlayerPrefs.GetInt("cameraSelfKey", parseInt(KeyCode.Space));
	var cameraTargetKey : KeyCode = PlayerPrefs.GetInt("cameraTargetKey", parseInt(KeyCode.LeftShift));
	var cameraZoomOutKey : KeyCode = PlayerPrefs.GetInt("cameraZoomOutKey", parseInt(KeyCode.R));
	var cameraZoomInKey : KeyCode = PlayerPrefs.GetInt("cameraZoomInKey", parseInt(KeyCode.F));
	var mouseOneKey : KeyCode = PlayerPrefs.GetInt("mouseOneKey", parseInt(KeyCode.Q));
	var mouseTwoKey : KeyCode = PlayerPrefs.GetInt("mouseTwoKey", parseInt(KeyCode.E));
	var statsKey : KeyCode = PlayerPrefs.GetInt("statsKey", parseInt(KeyCode.Tab));
	var uiToggleKey : KeyCode = PlayerPrefs.GetInt("uiToggleKey", parseInt(KeyCode.F12));
	var pauseKey : KeyCode = PlayerPrefs.GetInt("pauseKey", parseInt(KeyCode.P));
	var teleportKey : KeyCode = PlayerPrefs.GetInt("teleportKey", parseInt(KeyCode.B));

	return [skillOneKey,skillTwoKey,skillThreeKey,skillFourKey,skillOneLevelKey,skillTwoLevelKey,skillThreeLevelKey,skillFourLevelKey,
			cameraLockKey,cameraSelfKey,cameraTargetKey,cameraZoomOutKey,cameraZoomInKey,mouseOneKey,mouseTwoKey,statsKey,uiToggleKey,pauseKey,teleportKey];
}

function SetKeySettings() {	
	PlayerPrefs.SetInt("skillOneKey", parseInt(keySettings[0]));
	PlayerPrefs.SetInt("skillTwoKey", parseInt(keySettings[1]));
	PlayerPrefs.SetInt("skillThreeKey", parseInt(keySettings[2]));
	PlayerPrefs.SetInt("skillFourKey", parseInt(keySettings[3]));
	PlayerPrefs.SetInt("skillOneLevelKey", parseInt(keySettings[4]));
	PlayerPrefs.SetInt("skillTwoLevelKey", parseInt(keySettings[5]));
	PlayerPrefs.SetInt("skillThreeLevelKey", parseInt(keySettings[6]));
	PlayerPrefs.SetInt("skillFourLevelKey", parseInt(keySettings[7]));
	PlayerPrefs.SetInt("cameraLockKey", parseInt(keySettings[8]));
	PlayerPrefs.SetInt("cameraSelfKey", parseInt(keySettings[9]));
	PlayerPrefs.SetInt("cameraTargetKey", parseInt(keySettings[10]));
	PlayerPrefs.SetInt("cameraZoomOutKey", parseInt(keySettings[11]));
	PlayerPrefs.SetInt("cameraZoomInKey", parseInt(keySettings[12]));
	PlayerPrefs.SetInt("mouseOneKey", parseInt(keySettings[13]));
	PlayerPrefs.SetInt("mouseTwoKey", parseInt(keySettings[14]));
	PlayerPrefs.SetInt("statsKey", parseInt(keySettings[15]));
	PlayerPrefs.SetInt("uiToggleKey", parseInt(keySettings[16]));
	PlayerPrefs.SetInt("pauseKey", parseInt(keySettings[17]));
	PlayerPrefs.SetInt("teleportKey", parseInt(keySettings[18]));	
}

