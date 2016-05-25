#pragma strict

import System.Collections.Generic;

//camera movement
private var cameraMovement : CameraMovement;
//camera movement detectors
static var leftCamera : boolean;
static var rightCamera : boolean;
static var bottomCamera : boolean;
static var topCamera : boolean;

//hashing
var unitNameToNumber : Dictionary.<String,int> = new Dictionary.<String,int>();
//hud target view
var viewTarget : int;
//minimap
var minimap : Camera;
var targetMarker : Transform;
var marked : boolean;
var invisible : boolean[];

//start positions
static var playerTowerPosition : Vector3 = Vector3(-30,0,0);
static var enemyTowerPosition : Vector3 = Vector3(30,0,0);
static private var playerChestPosition : Vector3 = Vector3(-70,0.4,0);
static private var enemyChestPosition : Vector3 = Vector3(70,0.4,0);
static var playerGuardianPosition : Vector3 = Vector3(-64,0.05,0);
static private var playerMeleeMinionPosition : Vector3 = Vector3(-78,0.05,4.5);
static private var playerRangedMinionPosition : Vector3 = Vector3(-78,0.05,-4.5);
static var enemyGuardianPosition : Vector3 = Vector3(64,0.05,0);
static private var enemyMeleeMinionPosition : Vector3 = Vector3(78,0.05,4.5);
static private var enemyRangedMinionPosition : Vector3 = Vector3(78,0.05,-4.5);

//pathing
var clickTarget : Transform; 
var aiPaths : AIPath[];
var astarPath : AstarPath;
var clickLayer : LayerMask;
var teleporting : boolean[]; 

//objects
static var targetObjects : GameObject[];
//37 plus some trash collection
static var TOTAL_TARGET_OBJECTS : int = 39;

//particles that interact with characters
var flames : GameObject[];
var fogs : GameObject[];
var blackholes : GameObject[];
var gravityfields : GameObject[];

//skills
var useSkill : Function[,];
private var skills : Skills;
private var opponentSkills : OpponentSkills;
var skillLevels : int[,];
var skillTargetLocations : Vector3[];
var skillsExecuting : boolean[,];
var skillCooldowns : int[,];
var skillCosts : int[,];
var skillCostGrowths : int[,];
var cooldowns : boolean[,];
var cooldownTimers : float[,];
var playerAiming : boolean;
var stances : int[];
var poisonStacks : int[];
var hasRalphDefense : boolean[];
var bobRunts : int[];
var bobAtMonster : boolean[];

//animation handling
var anims : CharacterAnimation[]; //normal unit animations
var animationUnits : GameObject[];
var unitAnimations : CharacterAnimation[]; //animation unit animations
var startedRun : boolean[];

//ai brain scripts
var brains : Brain[];
//data scripts
private var playerData : PlayerData;
private var unitData : UnitData;
//character objects
private static var ralph : GameObject;
private static var rosalind : GameObject;
private static var leonardo : GameObject;
private static var graviton : GameObject;
private static var animationRalph : GameObject;
private static var animationRosalind : GameObject;
private static var animationLeonardo : GameObject;
private static var animationGraviton : GameObject;
private static var characters : GameObject[];
private static var animationCharacters : GameObject[];
//basic attacks
var basicAttacks : AIBasicAttack[];

//gem management
private var currentGem : int;

//monster vars
static var monsterRespawnTime : int = 120;
static var guardianRespawnTime : int = 120;
var hasMonsterBuff : boolean[];
var monsterSpeedBuffs : float[];

//game vars
static var gameClock : float;
static var paused : boolean;
static var waveTwo : boolean;
var gameOver : boolean;
var endText : GameObject;
var isLowHealth : boolean;
//aggro vars
//if true, the monster is mad at unit
var monsterAggro : boolean[];
//each units current aggro state, hashable with ID#s
//if true, unit aggroed to enemy player
var unitAggro : boolean[];
//status effects
//freeze chars to perform skills without interrupting 
var frozen : boolean[];
//stun chars to interrupt skills and freeze
var stunned : boolean[];
//attacking vars
var seekingTarget : boolean[];
var attacking : boolean[];
var inRange : boolean[];
//targetting and movement
//monster,player,opponent
static private var respawnPositions : Vector3[] = [Vector3(0,0.05,35),Vector3(-75,0.05,0),Vector3(75,0.05,0),playerTowerPosition,enemyTowerPosition,playerChestPosition,enemyChestPosition,
	playerGuardianPosition, enemyGuardianPosition];
var moveTarget : Vector3[];
var moving : boolean[];
var currentTargets : int[];
var originalTarget : int;
//gating
var playerTowerDown : boolean;
var enemyTowerDown : boolean;
var playerGuardianDown : boolean;
var enemyGuardianDown : boolean;
//respawning
var respawnDurations : int[];
var isMonsterRespawning : boolean;
//player skill points
static var skillPointAvailable : boolean;
static var skillPoints : int;

//death position
var holdingAreaPosition : Vector3 = Vector3(500,0,0);

//stat arrays
//player numbers are odd, opponents are even
//37 total
//0-monster,1-player,2-opponent,3-playerTower,4-enemyTower,5-playerChest,6-enemyChest,7-playerGuardian,8-enemyGuardian,
//9:20playerMeleeMinions1:6 alternated with enemyMeleeMinions1:6,
//21:32-playerRangedMinions1:6 alternated with enemyRangedMinions1:6,
//33-playerSpider,34-enemySpider,35-playerbob,36-enemybob
var characterSelected : int[];
//xp
static var levels : int[];
var levelUpSparkle : Transform[];
var experiences : int[];
//experience needed
static var playerExperienceNeeded : int;
static var opponentExperienceNeeded : int;
//xp values
static private var lastHitValues : int[];
static private var globalValues : int[];
static private var areaValues : int[];

static var kills : int[];
static private var killingSprees : int[];
static var deaths : int[];

var currentHealths : float[];
static var maxHealths : float[];
static var healthRegens : float[];
static private var healthGrowths : int[];
static var healthRegenGrowths : int[];
static var currentResources : float[];
static var maxResources : float[];
static var resourceRegens : float[];
private var resourceGrowths : int[];
static var resourceRegenGrowths : int[];
static var attackDamages : int[];
private var attackDamageGrowths : int[];
static var attackSpeeds : float[];
static var attackRanges : float[];
static var damageReductions : int[];
private var damageReductionGrowths : int[];
static var movementSpeeds : float[];
private var movementSpeedGrowths : float[];
var lifeSteals : int[];

//audio sources
static var soundEffects : AudioSource[];
static var attackSoundEffects : AudioSource[];
static var deathSoundEffects : AudioSource[];
static var teleportSoundEffects : AudioSource[];

function Awake () {
	Physics.gravity = Vector3(0,-1,0);
	//hashing
	for(var i : int = 0; i < 37; i++)	{
		unitNameToNumber[unitData.unitNames[i]] = i;
	}
	//add one for ground
	unitNameToNumber["Ground"] = 37;
	unitNameToNumber["Bush"] = 37;
	//walls
	unitNameToNumber["Untagged"] = 41;
	//particles
	unitNameToNumber["Flame"] = 43;
	unitNameToNumber["FreezingFog"] = 45;
	//trash tags
	//assign prefabs dead keys to catch accidental collisions offscreen
	unitNameToNumber["Guardian"] = 47;
	unitNameToNumber["MeleeMinion"] = 49;
	unitNameToNumber["RangedMinion"] = 51;
	unitNameToNumber["Spider"] = 53;
	unitNameToNumber["BlackHole"] = 55;
	unitNameToNumber["GravityField"] = 55;
	unitNameToNumber["PlayerBase"] = 57;
	unitNameToNumber["EnemyBase"] = 57;
	unitNameToNumber["SightBounce"] = 57;
	unitNameToNumber["Ralph"] = 59;
	unitNameToNumber["Rosalind"] = 59;
	unitNameToNumber["Leonardo"] = 59;
	unitNameToNumber["Graviton"] = 59;
	
	ResetGame();	
}

function Start (){		
	if(!playerData.musicMuted) { StartMusic(); }
	//set char skills
	for(var ssv : int = 0; ssv < 4; ssv++)	{
		//player
		useSkill[1,ssv] = skills.skillFunctions[characterSelected[1], ssv];
		//opponent
		useSkill[2,ssv] = opponentSkills.skillFunctions[characterSelected[2], ssv];
	}
	
	//set skill costs
	for(var scs : int = 0; scs < 4; scs++)	{
		//player
		skillCosts[1, scs] = skills.skillCosts[characterSelected[1],scs];
	    skillCostGrowths[1, scs] = skills.skillCostGrowths[characterSelected[1],scs];	    
	    //opponent
	    skillCosts[2, scs] = opponentSkills.skillCosts[characterSelected[2],scs];
	    skillCostGrowths[2, scs] = opponentSkills.skillCostGrowths[characterSelected[2],scs];
	}

	//START GAME ------------------------------------------------------------------- < START GAME
	Application.runInBackground = false;
	gameClock = 0;
	
	//start timed coroutines
	MatchStart();
	
	//turn on monster, opponent, tower and guardian brains
	//refresh brains of non instantiated stage ai
	brains[0].brainOn = true;
	brains[0].RefreshBrain();
	brains[2].brainOn = true;
	brains[3].brainOn = true;
	brains[3].RefreshBrain();
	brains[4].brainOn = true;
	brains[4].RefreshBrain();
	brains[7].brainOn = true;
	brains[8].brainOn = true;	
	if(characterSelected[1] == 1) { 
		//save ms boost
		skills.msBonus= movementSpeeds[1] * (0.05);	
		//add movespeed boost
		movementSpeeds[1] += skills.msBonus;
		aiPaths[1].speed += skills.msBonus;
		skills.PlayParticle(targetObjects[1].transform.Find("Grace"), 0.9, false);
	}		
}

function StartMusic () {
	var battleMusic : AudioSource = GameObject.Find("BattleMusic").audio;
	if(!battleMusic.isPlaying) {
		battleMusic.volume = playerData.musicVolume/100.0;//0.01;	
		battleMusic.Play();	
		//BattleMusicVolume(battleMusic, 0.3);
	}
}

//function BattleMusicVolume (musicSource : AudioSource, speedFloat : float) {
//	while(musicSource.volume < 1*playerData.musicVolume/100.0) {
//		musicSource.volume += speedFloat * Time.deltaTime;
//		yield;
//	}
//}

function Update () {
	if(!paused && !gameOver)	{
		gameClock += Time.deltaTime;
		CheckSkillLevelUp();		
		if(!frozen[1] && !stunned[1] && currentHealths[1] >= 1)		{
			CheckTeleport();
			CheckClick();
			CheckSkill();
			if(!moving[1])		{
				if(playerData.autoAttack)			{
					//auto attack target checking/picking stuffs
					AutoAttack();
				}
			}
		}
		CheckTargetClick();	
	}	
}

function CheckTeleport () {
	if(Input.GetKeyDown(playerData.keySettings[18]))	{
		if(!teleporting[1]) {
			StartTeleport(1);
		}
	}
}



function StartTeleport (unitNumber : int) {
	var telePart : Transform;
	var startingHealth : int;
	var timer : float;
	for(;;) {
		if(!teleporting[unitNumber]) {
			var unitTransform : Transform = targetObjects[unitNumber].transform;
			teleporting[unitNumber] = true;
			startingHealth = currentHealths[unitNumber];
			timer = 0;			
			frozen[unitNumber] = true;
			StopBasicAttack(unitNumber);			
			aiPaths[unitNumber].canMove = false;
			aiPaths[unitNumber].canSearch = false;			
			moveTarget[unitNumber] = unitTransform.position;
			anims[unitNumber].Idle();
			if(!playerData.effectMuted) {
				teleportSoundEffects[unitNumber].transform.position = targetObjects[unitNumber].transform.position;
				teleportSoundEffects[unitNumber].volume = playerData.effectVolume/100.0;
				teleportSoundEffects[unitNumber].Play();
			}
			telePart = unitTransform.Find("Teleport");
			telePart.particleSystem.startColor = unitData.primaryColors[characterSelected[unitNumber]];
			telePart.Find("Telemini").particleSystem.startColor = unitData.primaryColors[characterSelected[unitNumber]];			
			telePart.particleSystem.Play();
			yield;
		}
		//success
		else if(timer > 3) {
			Teleport(unitNumber, telePart);
			break;
		}
		//failure
		else if((unitNumber == 1 && (Input.GetMouseButtonDown(1) || Input.GetKeyDown(playerData.keySettings[14]))) || (currentHealths[unitNumber] < startingHealth)) { 			
			teleportSoundEffects[unitNumber].Stop();
			frozen[unitNumber] = false;
			telePart.particleSystem.Stop();
			telePart.particleSystem.Clear();
			teleporting[unitNumber] = false;
			break;		
		}
		else { timer += Time.deltaTime;	yield; }
	}
}

function Teleport (unitNumber : int, teleportParticle : Transform) {
	var targetTransform : Transform = targetObjects[unitNumber].transform;
	targetTransform.position = respawnPositions[unitNumber];
	if(unitNumber == 1) { targetTransform.rotation = Quaternion.Euler(0f,90f,0f); }
	else { targetTransform.rotation = Quaternion.Euler(0f,270f,0f); }
	aiPaths[unitNumber].canMove = false;
	aiPaths[unitNumber].canSearch = false;
	moveTarget[unitNumber] = respawnPositions[unitNumber];
	frozen[unitNumber] = false;
	teleportParticle.particleSystem.Stop();
	teleportParticle.particleSystem.Clear();
	if(unitNumber == 1) {	cameraMovement.CameraJump(respawnPositions[unitNumber]);	}
	teleporting[unitNumber] = false;
}

function AutoAttack () {
	//if i dont have a target
	if(!seekingTarget[1] && !frozen[1] && !skills.seeking && currentHealths[1] >= 1 && !teleporting[1])	{
		//Debug.Log("Checking for target");
		var aggroRange : int = attackRanges[1] + 1;
		var myPos : Vector3 = targetObjects[1].transform.position;
		var targetFound : boolean = false;
		//look for enemy minions,spiders,bobs to attack
		for(var i : int = 10; i < 37; i+=2)		{
			targetFound = CheckRange(myPos, aggroRange, i);
			if(targetFound) {	break;	}
		}
		//if no minions, look for enemy character to attack
		if(!targetFound)		{
			targetFound = CheckRange(myPos, aggroRange, 2);
			//if still no target, look for monster
			if(!targetFound)		{
				targetFound = CheckRange(myPos, aggroRange, 0);
				//if still nothing, look for tower, guardian, or chest
				if(!targetFound) {
					if(enemyTowerDown) {
						if(enemyGuardianDown) {
							targetFound = CheckRange(myPos, aggroRange, 6);
						}
						else {
							targetFound = CheckRange(myPos, aggroRange, 8);
						}
					}
					else {
						targetFound = CheckRange(myPos, aggroRange, 4);
					}					
				}
			}
		}		
		
		//if somethings in range
		if(targetFound && currentHealths[1] >= 1 && !skills.seeking && !frozen[1])		{
			if(currentHealths[currentTargets[1]] >= 1) {
				//attack it
				seekingTarget[1] = true;
				EngageTarget(1);
				//Debug.Log("Engaging " + currentTargets[1]);
			}
			else { currentTargets[1] = 38; viewTarget = 38; }
		}		
	}	
}

function CheckRange (myPos : Vector3, aggroRange : int, target : int) {
	var targetDistance : float = Vector3.Distance(myPos, targetObjects[target].collider.ClosestPointOnBounds(myPos));
	//if the minion is in range
	if(targetDistance < aggroRange)			{
		currentTargets[1] = target;
		viewTarget = target;
		//Debug.Log(target + " Found");
		return true;
	}
	return false;
}

function FixedUpdate () {
	if(!paused  && !gameOver)	{
		//for each unit
		for(var thisUnit : int = 0; thisUnit < TOTAL_TARGET_OBJECTS-2; thisUnit++)	{
			//check for freeze or stun
			if(!frozen[thisUnit] && !stunned[thisUnit] && currentHealths[thisUnit] >= 1)			{
				//check to see if the unit is moving 
				if(moving[thisUnit])		{
					Move(thisUnit);
				}
				if(!(thisUnit == 1 && skills.seeking) && !(thisUnit == 2 && opponentSkills.seeking)) {
					//check to see if unit needs to move toward their currently sought target and its not a tower or bob, and the target isnt nothingness
					if(seekingTarget[thisUnit] && thisUnit != 3 && thisUnit != 4 && thisUnit < 35 && currentTargets[thisUnit] != 38)			{
						var targetDist : float = Vector3.Distance(targetObjects[thisUnit].collider.ClosestPointOnBounds(targetObjects[currentTargets[thisUnit]].transform.position), 
							targetObjects[currentTargets[thisUnit]].collider.ClosestPointOnBounds(targetObjects[thisUnit].transform.position));
						//unit was not in range and now it is
						if(!inRange[thisUnit] && targetDist <= attackRanges[thisUnit])				{
							inRange[thisUnit] = true;
							moving[thisUnit] = false;
							aiPaths[thisUnit].canMove = false;
							aiPaths[thisUnit].canSearch = false;
						}
						//unit was in range and now its not ............... buffer range for smoothness
						else if(inRange[thisUnit] && targetDist > attackRanges[thisUnit] && !attacking[thisUnit])			{
							moving[thisUnit] = true;
							if(currentHealths[thisUnit] >= 1) { 		
								aiPaths[thisUnit].canSearch = true;
								aiPaths[thisUnit].canMove = true; 
							}
							inRange[thisUnit] = false;
							moveTarget[thisUnit] = targetObjects[currentTargets[thisUnit]].transform.position;
						}
						//unit was not in range and still isnt
						else if(!inRange[thisUnit] && targetDist > attackRanges[thisUnit])			{
							moving[thisUnit] = true;
							if(currentHealths[thisUnit] >= 1) { 		
								aiPaths[thisUnit].canSearch = true;
								aiPaths[thisUnit].canMove = true; 								
							}
							inRange[thisUnit] = false;
							moveTarget[thisUnit] = targetObjects[currentTargets[thisUnit]].transform.position;
						}
						//unit was in range and still is
						else {
							//keep on keepin on	
							inRange[thisUnit] = true;
							moving[thisUnit] = false;
							aiPaths[thisUnit].canMove = false;
							aiPaths[thisUnit].canSearch = false;
						}				
					}
					
					
					//if its attacking something
					if(seekingTarget[thisUnit])				{
						//if this unit is in range and not already attacking
						if(inRange[thisUnit] && !attacking[thisUnit] && currentHealths[currentTargets[thisUnit]] >= 1)			{
							//player
							if(thisUnit == 1)		{
								if(currentHealths[1] >= 1) {	
									attacking[thisUnit] = true;
									StartCoroutine("BasicAttack", thisUnit); 
								}
							}
							//most other units
							else if(thisUnit < 35 && currentHealths[thisUnit] >= 1)			{
								attacking[thisUnit] = true;
								basicAttacks[thisUnit].StartCoroutine("AIBasicAttack", thisUnit);
							}
							//bob
							else if(currentHealths[thisUnit] >= 1 && currentTargets[thisUnit] != 38)	{
								attacking[thisUnit] = true;
								//Debug.Log("StartingBobAttack");
								var targetLocation : Vector3 = targetObjects[currentTargets[thisUnit]].transform.position;
								var attackInfo : Vector4 = Vector4(thisUnit, targetLocation.x, targetLocation.y, targetLocation.z);
								if(targetLocation.x < 200) {
									basicAttacks[thisUnit].StartCoroutine("BobAttack", attackInfo);	
								}						
							}																						
						}
					}
				}
			}
		}	
	}
}

function MatchStart (){
	for(var startVar : int = 0; startVar < 2; startVar++)	{
		if(startVar == 1)	{
			MinionWaves();
			NCULevelUp();
			CrazyCatcher();
		}
		else	{
			HealthRegen();
			ResourceRegen();
			yield WaitForSeconds(10);
		}
	}
}

//catch people falling off the level and other shenanigans 
function CrazyCatcher (){
	for(;;)	{
		SetYPositions();
		yield WaitForSeconds(1.5);
	}
}

function SetYPositions () {
	//for each unit thats not a struture, spider or bob
	for(var i : int = 0; i < 3; i++)	{
		targetObjects[i].transform.position.y = 0.05;				
	}
	for(var j : int = 7; j < 33; j++)	{
		targetObjects[j].transform.position.y = 0.05;
	}		
}

function HealthRegen (){
	for(;;)	{
		//for each unit thats not a struture, spider or bob
		for(var i : int = 0; i < 3; i++)	{
			if(currentHealths[i] >= 1) {
				currentHealths[i] = Mathf.Min(Mathf.Max(currentHealths[i] + healthRegens[i], 1), maxHealths[i]);
			}
		}
		for(var j : int = 7; j < 33; j++)	{
			if(currentHealths[j] >= 1) {
				currentHealths[j] = Mathf.Min(Mathf.Max(currentHealths[j] + healthRegens[j], 1), maxHealths[j]);
			}
		}	
		
		yield WaitForSeconds(1);
	}
}

function ResourceRegen () {
	for(;;)	{
		//for both chars
		for(var i : int = 1; i < 3; i++)	{
			if(currentHealths[i] >= 1) {
				currentResources[i] = Mathf.Min(currentResources[i] + resourceRegens[i], maxResources[i]);
			}
		}
	
		yield WaitForSeconds(1);
	}
}

function NCULevelUp () {
	//for each level
	for(var nculu : int = 0; nculu < 10; nculu++)	{
		//wait for second wave
		if(nculu != 0)		{	
			//level monster
			LevelUp(0);
			//level minions
			for(var mcount : int = 0; mcount < 12; mcount++)			{
				//melee minions
				LevelUp(9+mcount);
				//ranged minions
				LevelUp(21+mcount);
			}
			yield WaitForSeconds(60);
		}
		else 		{		
			yield WaitForSeconds(59);
		}
	}
}

function MinionWaves () {
	for(;;)	{
		var waveAdd : int = 0;
		//if its time for the second wave
		if(waveTwo)		{
			waveAdd = 6;
			waveTwo = false;
		}
		else	{	waveTwo = true;		}		
		MeleeMinions(waveAdd);
		RangedMinions(waveAdd);		
		yield WaitForSeconds(60);
	}
}

function MeleeMinions (waveNum : int) {
	var targetTransform : Transform;
	for(var mmw : int = 0; mmw < 6; mmw+=2)	{	
		//if the player's minion is dead
		if(Vector3.Distance(targetObjects[9+waveNum + mmw].transform.position, holdingAreaPosition) < 50 && !gameOver)		{
			targetTransform = targetObjects[9+waveNum+mmw].transform;
			targetTransform.rotation.x = 0;
			targetTransform.rotation.z = 0;
			targetTransform.position = playerMeleeMinionPosition;
			currentHealths[9+waveNum+mmw] = maxHealths[9+waveNum+mmw];
			brains[9+waveNum+mmw].StartMinionBrain();
		}
		
		//if the enemy's minion is dead
		if(Vector3.Distance(targetObjects[10+waveNum+mmw].transform.position, holdingAreaPosition) < 50 && !gameOver)		{
			targetTransform = targetObjects[10+waveNum+mmw].transform;
			targetTransform.rotation.x = 0;
			targetTransform.rotation.z = 0;
			targetTransform.position = enemyMeleeMinionPosition;			
			currentHealths[10+waveNum+mmw] = maxHealths[10+waveNum+mmw];
			brains[10+waveNum+mmw].StartMinionBrain();
		}		
		yield WaitForSeconds(2);
	}
}

function RangedMinions (rWaveNum : int) {
	for(var rmw : int = 0; rmw < 6; rmw+=2)	{
		//if the player's minion is dead
		if(Vector3.Distance(targetObjects[21+rWaveNum+rmw].transform.position, holdingAreaPosition) < 50 && !gameOver)		{
			targetObjects[21+rWaveNum+rmw].transform.rotation.x = 0;
			targetObjects[21+rWaveNum+rmw].transform.rotation.z = 0;
			targetObjects[21+rWaveNum+rmw].transform.position = playerRangedMinionPosition;			
			currentHealths[21+rWaveNum+rmw] = maxHealths[21+rmw];
			brains[21+rWaveNum+rmw].StartMinionBrain();
		}
		
		//if the player's minion is dead
		if(Vector3.Distance(targetObjects[22+rWaveNum+rmw].transform.position, holdingAreaPosition) < 50 && !gameOver)		{
			targetObjects[22+rWaveNum+rmw].transform.rotation.x = 0;
			targetObjects[22+rWaveNum+rmw].transform.rotation.z = 0;
			targetObjects[22+rWaveNum+rmw].transform.position = enemyRangedMinionPosition;			
			currentHealths[22+rWaveNum+rmw] = maxHealths[22+rmw];
			brains[22+rWaveNum+rmw].StartMinionBrain();
		}
		yield WaitForSeconds(2);
	}
}

//takes player mouse input for primary gameplay - right click
function CheckClick () {
	if((Input.GetMouseButtonDown(1) || Input.GetKeyDown(playerData.keySettings[14])) && currentHealths[1] >= 1)	{
		//if((Input.mousePosition.y < Camera.main.pixelHeight - playerData.topScrollPadding) && (Input.mousePosition.y > playerData.botScrollPadding))
		if(minimap.pixelRect.Contains(Input.mousePosition)) {
			PlayerTarget(minimap);
		}
		else {
			PlayerTarget(Camera.main);
		}
	}
}

function CheckTargetClick () {
	if(Input.GetMouseButton(0) || Input.GetKeyDown(playerData.keySettings[13]))	{
		//if((Input.mousePosition.y < Camera.main.pixelHeight - playerData.topScrollPadding) && (Input.mousePosition.y > playerData.botScrollPadding))		{
		if(minimap.pixelRect.Contains(Input.mousePosition)) {
			CameraTarget();
		}
	}
//	if(Input.GetMouseButtonDown(0) || Input.GetKeyDown(playerData.keySettings[13])) {
//		if(!minimap.pixelRect.Contains(Input.mousePosition)) {
//		//	ViewTarget(Camera.main);
//		}
//	}
}

function CameraTarget() {
	if(!playerData.cameraLocked) {
		var targetLoc : Vector3;
		var ray : Ray = minimap.ScreenPointToRay (Input.mousePosition);		
		var moverPlane : Plane = Plane(Vector3.up, targetObjects[1].transform.position);
		var hitSpot : float = 0.0f;
		if (moverPlane.Raycast(ray, hitSpot)) {				
			targetLoc = ray.GetPoint(hitSpot);
		}
		cameraMovement.CameraJump(targetLoc);
	}		
}

function CheckSkill () {
	if(!playerAiming && !skills.seeking) {
		//check for skill uses 1-4
		for(var i : int = 0; i < 4; i++) 	{
			if(Input.GetKeyDown(playerData.keySettings[i]) && (skillLevels[1,i] >= 1 || (characterSelected[1] == 1 && i == 2)))	{
				TrySkill(i, false);	
			}
		}
	}
}

var playerAimingNumber : int;

function TrySkill (skillNumber : int, fromButton : boolean) {
	//if the skill is an active
	if(unitData.skillTypes[playerData.characterSelected, skillNumber] == "Active")	{
		//if the player has enough mana
		if(currentResources[1] >= skillCosts[1,skillNumber])	{	
			//if the skill isnt on cooldown
			if(!cooldowns[1,skillNumber])			{
				//if not transformed leo
				if(!(characterSelected[1] == 2 && skillsExecuting[1,3]))	{		
					var targetType : String = unitData.skillTargets[playerData.characterSelected, skillNumber];
					//if the skill needs to be aimed
					if(targetType != "Self")	{
						var numbers : Vector3;
						//aim the skill
						playerAimingNumber = skillNumber;
						playerAiming = true;
						if(targetType == "GroundArea")		{							
							numbers.x = skillNumber;
							if(fromButton) { numbers.y = 1; }
							else { numbers.y = 0; }
							numbers.z = 0;
						}
						else if(targetType == "Summon")		{
							numbers.x = skillNumber;
							if(fromButton) { numbers.y = 1; }
							else { numbers.y = 0; }
							numbers.z = 1;
						}
						else if(targetType == "EnemyUnit")	{
							numbers.x = skillNumber;
							if(fromButton) { numbers.y = 1; }
							else { numbers.y = 0; }
							numbers.z = 2;
						}
						else if(targetType == "EnemyCharacter")	{
							numbers.x = skillNumber;
							if(fromButton) { numbers.y = 1; }
							else { numbers.y = 0; }
							numbers.z = 3;
						}
						StartCoroutine("TargetSkill", numbers);
					}
					else	{
						originalTarget = currentTargets[1];
						StopBasicAttack(1);
						useSkill[1,skillNumber](1);
					}
				}
				else { soundEffects[1].Play(); }
			}
			else { soundEffects[1].Play(); }
		}
		else { soundEffects[1].Play(); }
	}
}

function PlayerTarget (cameraUsed : Camera) {
	var hit : RaycastHit;
	var ray : Ray = cameraUsed.ScreenPointToRay (Input.mousePosition);
	var oldTarget : int = currentTargets[1];
	var engage : boolean = false;
	
	var attemptedTarget : int;
	
	if (Physics.Raycast (ray, hit, 100.0, clickLayer)){
		attemptedTarget = unitNameToNumber[hit.collider.tag];		
		//if they clicked the ground
		if(attemptedTarget == 37)	{		
			MoveToRayPoint(ray, 1);
			//no target	
			currentTargets[1] = 38;	
			viewTarget = 38;
		}
		//else if its the monster or an enemy unit
		else if(attemptedTarget % 2 == 0)		{
			if(!(attemptedTarget == "EnemyChest" && !enemyGuardianDown) && !(attemptedTarget == "EnemyGuardian" && !enemyTowerDown))			{
				engage = true;
				currentTargets[1] = attemptedTarget;
				viewTarget = attemptedTarget;
			}
		}
		
		//if its an enemy, engage
		if(engage) {
			if(oldTarget != currentTargets[1] || !seekingTarget[1])		{
				EngageTarget(1);
			}
			if(marked) {  StopCoroutine("Marker");  }
			StartCoroutine("Marker", targetObjects[currentTargets[1]].transform.position); 
		}		
	}
}

function Marker (tempPosition : Vector3) {
	for(var i : int = 0; i < 2; i++) {
		if(i == 0) {marked = true; targetMarker.position = tempPosition; targetMarker.position.y = 0.2; yield WaitForSeconds(0.75); }
		else { marked = false; targetMarker.position = Vector3(1000, 0, 1000);  }
	}
}

function ViewTarget (cameraUsed : Camera) {
	var hit : RaycastHit;
	var ray : Ray = cameraUsed.ScreenPointToRay (Input.mousePosition);
	var engage : boolean = false;
	
	var attemptedTarget : int;
	
	if (Physics.Raycast (ray, hit, 100.0))	{
		attemptedTarget = unitNameToNumber[hit.collider.tag];
		
		//not something unviewable
		if(attemptedTarget < 35)		{
		 viewTarget = attemptedTarget;
		}
	}
}

function TargetSkill (numbers : Vector3) {
	var skillNumber : int = numbers.x;
	var fromButton : int = numbers.y;
	var type : int = numbers.z;
	while(playerAiming)	{
		if((playerData.quickCast && !fromButton) || ((Input.GetMouseButtonDown(0) || Input.GetKeyDown(playerData.keySettings[13])) && !minimap.pixelRect.Contains(Input.mousePosition)))	{
			//if(playerData.quickCat || !minimap.pixelRect.Contains(Input.mousePosition)) {
			var hit : RaycastHit;
			var ray : Ray = Camera.main.ScreenPointToRay (Input.mousePosition);
			var attemptedTarget : int;
			if (!GUIUtility.hotControl && Physics.Raycast (ray, hit, 100.0, clickLayer))			{
				attemptedTarget = unitNameToNumber[hit.collider.tag];								
				//if the skill can activate
				if(CheckSkillClick(skillNumber, attemptedTarget, type, hit)) { 
					playerAiming = false;
					skills.seeking = true;
					//stop basic attack
					StopBasicAttack(1);
					useSkill[1,skillNumber](1);	
				}
				//else if they clicked on a structure or wall
				else if(playerData.quickCast) { playerAiming = false; break; }
				else			{		yield;			}				
			}
			//else its something untargetable
			else if(playerData.quickCast) { playerAiming = false; break; }
			else			{		yield;			}
		}
		else if(Input.GetMouseButtonDown(1) || Input.GetKeyDown(playerData.keySettings[14]))		{		playerAiming = false;		}
		else		{
			//target indicator goes here
			yield;
		}
	}
}

function CheckSkillClick (skillNumber : int, attemptedTarget : int, type : int, hit : RaycastHit) {
	var relativePos : Vector3;
	var targetRotation : Quaternion;
	switch(type) {
	//ground area
	case 0:
		if(attemptedTarget < 38 && (attemptedTarget < 3 || attemptedTarget > 6))	{
			skillTargetLocations[1] = hit.point;
			moveTarget[1] = skillTargetLocations[1];
			clickTarget.position = moveTarget[1];
			skillTargetLocations[1].y = 0.2;					
			relativePos = hit.point - targetObjects[1].transform.position;
			if(relativePos.z != 0) {
				targetRotation = Quaternion.LookRotation(relativePos);
				targetObjects[1].transform.rotation = targetRotation;
				targetObjects[1].transform.rotation.x = 0;
				targetObjects[1].transform.rotation.z = 0;
			}	
			originalTarget = currentTargets[1];
			currentTargets[1] = 38; 			
			return true;
		}
		else { return false; }
		break;
	//summon
	case 1:
		//if its unit thats not a structure or its the ground
		if(attemptedTarget < 38 && (attemptedTarget < 3 || attemptedTarget > 6))	{
			if(attemptedTarget == 0)	{
				bobAtMonster[1] = true;
				var monsterSpot = Vector3(0,0,28);
				skillTargetLocations[1] = hit.collider.ClosestPointOnBounds(targetObjects[1].transform.position);
			}
			else		{
				bobAtMonster[1] = false;
				skillTargetLocations[1] = hit.point;						
			}
			originalTarget = currentTargets[1];	
			currentTargets[1] = 38; 		
			return true;			
		}
		else { return false; }
		break;
	//enemy, non structure
	case 2:
		//if its an enemy unit thats not a structure
		if(attemptedTarget % 2 == 0 && attemptedTarget < 37 && (attemptedTarget < 3 || attemptedTarget > 6))				{
			currentTargets[1] = attemptedTarget;
			seekingTarget[1] = true;
			viewTarget = attemptedTarget;
			skillTargetLocations[1] = hit.point;								
			relativePos = skillTargetLocations[1]  - targetObjects[1].transform.position;
			if(relativePos.z != 0) {
				targetRotation = Quaternion.LookRotation(relativePos);
				targetObjects[1].transform.rotation = targetRotation;
				targetObjects[1].transform.rotation.x = 0;
				targetObjects[1].transform.rotation.z = 0;
			}
			originalTarget = currentTargets[1];			
			return true;
		}
		else { return false; }
		break;
	//opponenet character only
	case 3:
		//if its the enemy character
		if(attemptedTarget == 2)				{
			currentTargets[1] = attemptedTarget;
			seekingTarget[1] = true;
			viewTarget = attemptedTarget;
			skillTargetLocations[1] = hit.point;					
			relativePos = skillTargetLocations[1]  - targetObjects[1].transform.position;
			if(relativePos.z != 0) {
				targetRotation = Quaternion.LookRotation(relativePos);
				targetObjects[1].transform.rotation = targetRotation;
				targetObjects[1].transform.rotation.x = 0;
				targetObjects[1].transform.rotation.z = 0;
			}
			originalTarget = currentTargets[1];	
			return true;
		}
		else { return false; }
		break;
	}
}

function CheckSkillLevelUp () {
	if(skillPointAvailable)	{
		for(var i : int = 0; i < 4; i++) {
			//add four to find the right keys
			if((Input.GetKeyDown(playerData.keySettings[i+4])) && skillLevels[1, i] < 3 && !(i == 3 && (skillLevels[1, i] >= 1 || levels[1] < 5))) {
				SkillLevelUp(1, i);
			}
		}
	}
}

function SkillLevelUp (charNumber : int, skillNumber : int) {
	if(charNumber == 1)	{
		skillPoints -= 1;
		if(skillPoints < 1)	{
			skillPointAvailable = false;
		}
	}
	
	//if its rosalind
	if(characterSelected[charNumber] == 1)	{
		//if its her 3
		if(skillNumber == 2) {
			if(charNumber == 1) {
				//if movespeed stance
				if(stances[charNumber] == 0) {
					//remove current boost
					movementSpeeds[charNumber] -= skills.msBonus;	
					aiPaths[charNumber].speed -= skills.msBonus;					
					//save new ms boost
					skills.msBonus	= movementSpeeds[charNumber] * (0.15 * (skillLevels[charNumber,2]+1) + 0.05);											
					//apply new boost
					movementSpeeds[charNumber] += skills.msBonus;
					aiPaths[charNumber].speed += skills.msBonus;		
				}
				//if in attackspeed stance
				else {
					//remove current boost
					attackSpeeds[charNumber] -= skills.asBonus;
					//save new boost
					skills.asBonus = attackSpeeds[charNumber] * (0.15 * (skillLevels[charNumber,2]+1) + 0.05);
					//apply new boost
					attackSpeeds[charNumber] += skills.asBonus;
				}
			}
			else { 
				//if movespeed stance
				if(stances[charNumber] == 0) {
					//remove current boost
					movementSpeeds[charNumber] -= opponentSkills.msBonus;	
					aiPaths[charNumber].speed -= opponentSkills.msBonus;					
					//save new ms boost
					opponentSkills.msBonus	= movementSpeeds[charNumber] * (0.15 * (skillLevels[charNumber,2]+1) + 0.05);											
					//apply new boost
					movementSpeeds[charNumber] += opponentSkills.msBonus;
					aiPaths[charNumber].speed += opponentSkills.msBonus;		
				}
				//if in attackspeed stance
				else {
					//remove current boost
					attackSpeeds[charNumber] -= opponentSkills.asBonus;
					//save new boost
					opponentSkills.asBonus = attackSpeeds[charNumber] * (0.15 * (skillLevels[charNumber,2]+1) + 0.05);
					//apply new boost
					attackSpeeds[charNumber] += opponentSkills.asBonus;
				}
			}
		}
	}
	
	//if its not the first level
	if(skillLevels[charNumber, skillNumber] > 0) { 
		skillCosts[charNumber, skillNumber] += skillCostGrowths[charNumber, skillNumber];
	}
	skillLevels[charNumber, skillNumber] += 1;
	if(characterSelected[charNumber] == 2)	{
		if(charNumber == 1) {
			skills.RemoveAllAuras(charNumber);
		}
		else { opponentSkills.RemoveAllAuras(charNumber); }
	}	
	unitData.UpdateTooltips();
}

function OpponentSkillLevelUp (charNumber : int, skillNumber : int) {
	if(charNumber == 1)	{
		skillPoints -= 1;
		if(skillPoints < 1)	{
			skillPointAvailable = false;
		}
	}
	
	//if its rosalind
	if(characterSelected[charNumber] == 1)	{
		//if its her 3
		if(skillNumber == 2) {
			//if movespeed stance
			if(stances[charNumber] == 0) {
				//remove current boost
				movementSpeeds[charNumber] -= opponentSkills.msBonus;	
				aiPaths[charNumber].speed -= opponentSkills.msBonus;					
				//save new ms boost
				opponentSkills.msBonus	= movementSpeeds[charNumber] * (0.15 * (skillLevels[charNumber,2]+1) + 0.05);											
				//apply new boost
				movementSpeeds[charNumber] += opponentSkills.msBonus;
				aiPaths[charNumber].speed += opponentSkills.msBonus;		
			}
			//if in attackspeed stance
			else {
				//remove current boost
				attackSpeeds[charNumber] -= opponentSkills.asBonus;
				//save new boost
				opponentSkills.asBonus = attackSpeeds[charNumber] * (0.15 * (skillLevels[charNumber,2]+1) + 0.05);
				//apply new boost
				attackSpeeds[charNumber] += opponentSkills.asBonus;
			}
		}
	}
	
	//if its not the first level
	if(skillLevels[charNumber, skillNumber] > 0) { 
		skillCosts[charNumber, skillNumber] += skillCostGrowths[charNumber, skillNumber];
	}
	skillLevels[charNumber, skillNumber] += 1;
	if(characterSelected[charNumber] == 2)	{
		opponentSkills.RemoveAllAuras(charNumber);
	}	
	unitData.UpdateTooltips();
}

function MoveToRayPoint (moveRay : Ray, theMover : int) {
	var moverPlane : Plane = Plane(Vector3.up, targetObjects[theMover].transform.position);
	var hitSpot : float = 0.0f;	

	if (moverPlane.Raycast(moveRay, hitSpot)) {				
		moveTarget[theMover] = moveRay.GetPoint(hitSpot);
		clickTarget.position = moveTarget[theMover];
		aiPaths[theMover].target = clickTarget;
		if(!frozen[theMover]) {	
			aiPaths[theMover].canSearch = true;
			aiPaths[theMover].canMove = true; 
			aiPaths[theMover].SearchPath(); 
			if(marked) {  StopCoroutine("Marker");  }
			StartCoroutine("Marker", moveTarget[theMover]); 			
		}
		moving[theMover] = true;				
	}
	
	seekingTarget[theMover] = false;
	if(attacking[theMover])	{
		StopCoroutine("BasicAttack");
		//if ranged
		if(characterSelected[1] == 0 || (characterSelected[1] == 2 && skillsExecuting[1, 3] && stances[1] == 1) || characterSelected[1] == 3) {
			//stop old particles
			skills.StopParticle(targetObjects[1].transform.Find("Basic Attack"));	
		}
		attacking[theMover]= false;
	}
	inRange[theMover] = false;
}

function Move (mover : int) {
	var destinationDistance = Vector3.Distance(moveTarget[mover], targetObjects[mover].transform.position);
	if(startedRun[mover] && destinationDistance < 2 && !frozen[mover]){
		anims[mover].SoftIdle();
		moving[mover] = false;
		startedRun[mover] = false;
	}
	else if(destinationDistance >= 1 && !frozen[mover]){
		anims[mover].Run(movementSpeeds[mover]);
		startedRun[mover] = true;	
	}
}

function EngageTarget (theAttacker : int) {
	if(currentTargets[theAttacker] != theAttacker){
		if(theAttacker < 35){
			moveTarget[theAttacker] = targetObjects[currentTargets[theAttacker]].transform.position;
			aiPaths[theAttacker].target = targetObjects[currentTargets[theAttacker]].transform;
		}
		StopBasicAttack(theAttacker);
		inRange[theAttacker] = false;
		seekingTarget[theAttacker] = true;
	}
}

function StopBasicAttack (theAttacker : int) {	
	if(theAttacker == 38) { return; }
	if(attacking[theAttacker]) {
		if(theAttacker == 1) {
			StopCoroutine("BasicAttack");
			//if ranged
			if(characterSelected[1] == 0 || (characterSelected[1] == 2 && skillsExecuting[1, 3] && stances[1] == 1) || characterSelected[1] == 3) {
				//stop old particles
				skills.StopParticle(targetObjects[1].transform.Find("Basic Attack"));	
			}
			anims[1].Idle();
		}
		else if(theAttacker == 2) {
			basicAttacks[theAttacker].StopCoroutine("AIBasicAttack");
			//if ranged
			if(characterSelected[2] == 0 || (characterSelected[2] == 2 && skillsExecuting[2, 3] && stances[2] == 1) || characterSelected[2] == 3) {
				//stop old particles
				skills.StopParticle(targetObjects[2].transform.Find("Basic Attack"));	
			}
		}
		else if(theAttacker < 35) {
			basicAttacks[theAttacker].StopCoroutine("AIBasicAttack");
			//if ranged
			if((theAttacker > 20 && theAttacker < 33) || theAttacker == 3 || theAttacker == 4 || theAttacker == 7 || theAttacker == 8) {
				//stop old particles
				skills.StopParticle(targetObjects[theAttacker].transform.Find("Basic Attack"));	
			}
		}
		else if(theAttacker < 37) {		basicAttacks[theAttacker].StopCoroutine("BobAttack");		}
		if(attackSoundEffects[theAttacker] != null) { attackSoundEffects[theAttacker].Stop(); }
		attacking[theAttacker]= false;
	}
}

function BasicAttack (attacker : int)	{	
	for(var attackVar : int = 0; attackVar < 2; attackVar++)	{
		var relativePos : Vector3 = targetObjects[currentTargets[attacker]].transform.position - targetObjects[attacker].transform.position;
		var attackSoundEffect : AudioSource;
		if(relativePos.z != 0) {
			var targetRotation : Quaternion = Quaternion.LookRotation(relativePos);
			targetObjects[attacker].transform.rotation = targetRotation;
			targetObjects[attacker].transform.rotation.x = 0;
			targetObjects[attacker].transform.rotation.z = 0;
		}
		//check if animation is finished
		if(attackVar == 1 && attacking[attacker] && currentHealths[currentTargets[attacker]] >= 1)		{
			//if(inRange[attacker])			{
				var consume : boolean = false;				
				var basicDamageAmount : int = attackDamages[attacker] * (1-(damageReductions[currentTargets[attacker]]/100.0));
				if(characterSelected[attacker] == 3) {
					if(currentResources[attacker] >= 50) {
						//drain mana
						currentResources[attacker] -= 50;
						if(skills.fluctuating)  {
							//add extra damage
							basicDamageAmount += maxHealths[currentTargets[attacker]] * 0.05 * (1-(damageReductions[currentTargets[attacker]]/100.0));
						}
						skills.CheckFluctuate(1);
					}
					else {
						basicDamageAmount = (basicDamageAmount + maxHealths[currentTargets[attacker]] * 0.05) * currentResources[attacker]/50.0;
						currentResources[attacker] = 0;
					}
				}

				Damage(basicDamageAmount, attacker, currentTargets[attacker]);
				//if its rosalind, give insight
				if(playerData.characterSelected == 1)				{
					currentResources[attacker] = Mathf.Min(currentResources[attacker] + 10, 100);
				}
				//else if its leo and he's transformed
				else if(characterSelected[attacker] && skillsExecuting[attacker, 3] && currentTargets[attacker] < 37)				{
					//if enemy has correct debuff
					if(skills.elementalDebuffCounts[currentTargets[attacker], stances[attacker]] > 0)				{
						//apply extra effect
						if(!playerData.effectMuted) {
							attackSoundEffect = skills.skillSoundEffects[4];
							attackSoundEffect.volume = playerData.effectVolume/100.0;
							attackSoundEffect.transform.position = targetObjects[currentTargets[attacker]].transform.position;	
							attackSoundEffect.Play();	
						}
						skills.ConsumeElementalDebuff(attacker, currentTargets[attacker], stances[attacker], basicDamageAmount);
						consume = true;
					}
				}
				
				//if ranged
				if(characterSelected[attacker] == 0 || (characterSelected[attacker] == 2 && skillsExecuting[attacker, 3] && stances[attacker] == 1) || characterSelected[attacker] == 3) {
					//stop old particles
					skills.StopParticle(targetObjects[attacker].transform.Find("Basic Attack"));
					//play particles
					var parTran : Transform = targetObjects[attacker].transform.Find(targetObjects[attacker].tag + " Basic Attack Hit");
					if(consume) {
						parTran.particleSystem.startSize = 6;
						parTran.particleSystem.startSpeed = 7;
						
					}
					else if(characterSelected[attacker] == 2 && skillsExecuting[attacker, 3] && stances[attacker] == 1) {
						parTran.particleSystem.startSize = 2;
						parTran.particleSystem.startSpeed = 1.5;
					}
//					Debug.Log(targetObjects[attacker].tag + " is attacking " + targetObjects[currentTargets[attacker]].tag + "-" 
//							+ targetObjects[currentTargets[attacker]] + " at Time = " + Time.time);					
					if(currentTargets[attacker] != 38) { ParticleHit(attacker, parTran);	}	
					if(characterSelected[attacker] == 2 && skillsExecuting[attacker, 3]	&& !playerData.effectMuted) {
						attackSoundEffect = skills.skillSoundEffects[5];
						attackSoundEffect.volume = playerData.effectVolume/100.0;
						attackSoundEffect.transform.position = targetObjects[attacker].transform.position;	
						attackSoundEffect.Play();	
					}	
				}
			//}
			attacking[attacker] = false;
		}
		else		{
			//play sound
			if(!playerData.effectMuted && attackSoundEffects[attacker] != null) {
				attackSoundEffect = attackSoundEffects[attacker];
				attackSoundEffect.volume = playerData.effectVolume/100.0;
				attackSoundEffect.transform.position = targetObjects[attacker].transform.position;
//				if(attacker == 0) {
//					SoundDelay(attacker, attackSoundEffect, 0.3);
//				}
//				else {	attackSoundEffect.Play();	}
				attackSoundEffect.Play();
			}
			anims[attacker].Attack(attackSpeeds[attacker]);
			//if ranged
			if(characterSelected[attacker] == 0 || characterSelected[attacker] == 3) {
				//play particles
				skills.PlayParticle(targetObjects[attacker].transform.Find("Basic Attack"), 0.95, true);
			}
			else if(characterSelected[attacker] == 2 && skillsExecuting[attacker,3] && stances[attacker] == 1) {
				//play particles
				skills.PlayParticle(targetObjects[attacker].transform.Find("Basic Attack"), 0.27, true);
			}
			yield WaitForSeconds((1.0/attackSpeeds[attacker]));
		}
		
	}
}

//plays hit particle on current target of attacker
function ParticleHit (attacker : int, parTran : Transform) {
	for(var i : int = 0; i < 2; i++)	{
		if(i == 0) {
			if(currentHealths[currentTargets[attacker]] < 1) { i = 100; break; }
			var target : int = currentTargets[attacker];
			try {				
				if(target > 36) { i = 3; break; }
			//	Debug.Log("Target = " + targetObjects[target].tag);
			//	Debug.Log("Particle = " + parTran);
			//	Debug.Log("Particle parent = " + parTran.parent);			
				parTran.parent = targetObjects[target].transform;
				if(target < 3 || (target > 6 && target < 37)) {
					parTran.localPosition = parTran.parent.Find("Poison").transform.localPosition;
				}
				else if(target < 37) { parTran.position = targetObjects[target].collider.ClosestPointOnBounds(targetObjects[target].transform.TransformPoint(Vector3.up*5)); }
				parTran.particleSystem.Play();
				
			}
			catch (e) { Debug.LogError(targetObjects[attacker].tag + " has no particle." + " Error : " + e); i = 100; }
			if((attacker == 1 && characterSelected[1] == 2) || (attacker == 2 && characterSelected[2] == 2)) { yield WaitForSeconds(0.3); }
			else { yield WaitForSeconds(0.43); }
		}
		else {
			parTran.particleSystem.Stop();
			parTran.particleSystem.Clear();
			parTran.parent = targetObjects[attacker].transform;
		}
	}
}

function Damage (damageAmount : int, attackerNumber : int, targetNumber : int) { Damage(damageAmount, attackerNumber, targetNumber, 0); }
function Damage (damageAmount : int, attackerNumber : int, targetNumber : int, tempLifesteal : int)	{
	if(currentHealths[targetNumber] < 1 || targetNumber == 38) {		return;		}
	//generate monster aggro
	if(targetNumber == 0)	{
		var engaged : boolean = false;
		for(var i : int = 0; i < TOTAL_TARGET_OBJECTS; i++)		{
			if(monsterAggro[i])		{
				engaged = true;
				break;
			}
		}
		
		if(!engaged)	{
			currentTargets[0] = attackerNumber;
			EngageTarget(0);
		}
		monsterAggro[attackerNumber] = true;		
		if(attackerNumber == 33 || attackerNumber == 35)	{	monsterAggro[1] = true;		}		
		if(attackerNumber == 34 || attackerNumber == 36)	{	monsterAggro[2] = true;		}
	}
	
	//if its a character being attacked by a character, generate aggro to allied units nearby
	if((targetNumber == 1 || targetNumber == 2) && (attackerNumber == 1 || attackerNumber == 2))	{
		//for each potential ally
		for(var j : int = 2+targetNumber; j < TOTAL_TARGET_OBJECTS-2; j+=2)		{
			//if not already targeting a character
			if(currentTargets[j] != 1 && currentTargets[j] != 2)			{
				//if close enough
				var allyDist : float = Vector3.Distance(targetObjects[attackerNumber].transform.position, targetObjects[j].transform.position);
				if(allyDist < 16)				{
					unitAggro[j] = true;
					currentTargets[j] = attackerNumber;
					//if its not a structure
					if(j > 6)	{	EngageTarget(j);	}
					//if its not a chest/is a tower
					else if(j < 5)					{
						seekingTarget[j] = true;
						inRange[j] = true;
					}
				}
			}
		}
	}
	if(currentHealths[targetNumber] < 1) {		return;		}
	//if its Ralph or Bob attacking and not attacking a structure 
	if(((attackerNumber == 1 && playerData.characterSelected == 0) || (attackerNumber == 2 && playerData.opponentSelected == 0) 
		|| attackerNumber > 34) && (targetNumber < 3 || targetNumber > 6)) 	{
		//if less than max stacks
		if(poisonStacks[targetNumber] < 5)		{
			poisonStacks[targetNumber] += 1;
			//apply poison
			//player bob
			if(attackerNumber == 35)			{
				DamageOverTime(1, targetNumber, levels[1]*2, 3.0f, true);
			}
			//enemy bob
			else if(attackerNumber == 36)			{
				DamageOverTime(2, targetNumber, levels[2]*2, 3.0f, true);
			}
			//ralphs
			else			{
				DamageOverTime(attackerNumber, targetNumber, levels[attackerNumber]*2, 3.0f, true);
			}
		}		
	}
	//if its rosalind and not attacking a structure 
	else if(((attackerNumber == 1 && playerData.characterSelected == 1) || (attackerNumber == 2 && playerData.opponentSelected == 1)) && (targetNumber < 3 || targetNumber > 6)) 	{
		//apply lifesteal
		currentHealths[attackerNumber] += damageAmount*((lifeSteals[attackerNumber] + tempLifesteal + (currentResources[attackerNumber]*0.1))/100.0);
	}	
	if(currentHealths[targetNumber] < 1) {		return;		}	
	//everything else
	else	{
		//do the damage
		currentHealths[targetNumber] = Mathf.Max(currentHealths[targetNumber] -(damageAmount * (1 - damageReductions[targetNumber]/100.0)), 0);
	}	
	
	if(currentHealths[targetNumber] < 1)	{
		if(currentHealths[targetNumber] < 0)		{
			currentHealths[targetNumber] = 0;
		}
		KillUnit(attackerNumber, targetNumber);
	}
	else {	
		CheckRalphShield(targetNumber);	
		if(targetNumber == 1) { CheckPlayerHealth(); }
	}
}

function CheckPlayerHealth () {
	var healthPercent = Mathf.Clamp(((currentHealths[1])/maxHealths[1])*100.0, 0, 100.0);
	if(!isLowHealth && healthPercent < 35) {
		isLowHealth = true;
		if(!playerData.effectMuted) {
			soundEffects[2].volume = playerData.effectVolume/100.0;
			StartCoroutine("PlayHeartbeat");	
		}
		RenderSettings.fogDensity = 0.001;
		RenderSettings.fogColor = Color.red;
		RenderSettings.fog = true;
		PlayerLowHealth();
	}
}

function PlayerLowHealth () {
	var healthPercent : float;
	for(;;) {
		healthPercent = Mathf.Clamp(((currentHealths[1])/maxHealths[1])*100.0, 0, 100.0);
		if(healthPercent > 36) {
			StopCoroutine("PlayHeartbeat");	
			isLowHealth = false;
			RenderSettings.fog = false;
			break;
		}
		else if(currentHealths[1] < 1) { 			
			StopCoroutine("PlayHeartbeat");	
			soundEffects[2].Stop();
			isLowHealth = false;
			break;
		}
		else {
			RenderSettings.fogDensity = Map(healthPercent, 0, 35, 0.03, 0.005);
			yield WaitForSeconds(0.5);
		}
	}
}

function PlayHeartbeat () {
	var healthPercent : float;
	for(;;) {
		healthPercent = Mathf.Clamp(((currentHealths[1])/maxHealths[1])*100.0, 0, 100.0);
		soundEffects[2].pitch = 1 + Map(healthPercent, 0, 35, 1, 0);
		soundEffects[2].Play();
		yield WaitForSeconds(1 - Map(healthPercent, 0, 35, 0.5, 0));
	}
}

function Map (number : float, origMin : float, origMax : float, newMin : float, newMax : float) : float {
	return newMin + (number-origMin)*(newMax-newMin)/(origMax-origMin);
}

function DamageOverTime (attacker : int, target : int, damage : int, duration : float){ DamageOverTime (attacker, target, damage, duration, false); }
function DamageOverTime (attacker : int, target : int, damage : int, duration : float, isPoison : boolean) {
	for(var i : int = 0; i < duration+1; i++)	{
		if(i == duration)	{
			if(currentHealths[target] < 1)	{	break;	}		
			currentHealths[target] = Mathf.Max(currentHealths[target] - (damage * (1 - damageReductions[target]/100.0)), 0);	 
			if(currentHealths[target] < 1) {
				if(currentHealths[target] < 0){
					currentHealths[target] = 0;
				}
				KillUnit(attacker, target);
			}	
			else {	CheckRalphShield(target);	}		
			if(isPoison) {
				 poisonStacks[target] -= 1;
				 if(poisonStacks[target] < 1) {
					 targetObjects[target].transform.Find("Poison").particleSystem.Stop();
					 targetObjects[target].transform.Find("Poison").particleSystem.Clear();
				 }
		    }
		}
		else if(i == 0)	{
			if(currentHealths[target] < 1)	{	i = 100;	break;	}
			if(isPoison) { targetObjects[target].transform.Find("Poison").particleSystem.Play(); }
			//generate monster aggro
			if(target == 0)	{
				var engaged : boolean = false;
				for(var j : int = 0; j < TOTAL_TARGET_OBJECTS; j++)		{
					if(monsterAggro[j])		{
						engaged = true;
						break;
					}
				}
				
				if(!engaged)	{
					currentTargets[0] = attacker;
					EngageTarget(0);
				}
				monsterAggro[attacker] = true;				
				if(attacker == 33 || attacker == 35)		{	monsterAggro[1] = true;		}				
				if(attacker == 34 || attacker == 36)		{	monsterAggro[2] = true;		}
			}
			yield WaitForSeconds(1);
		}
		else	{
			if(currentHealths[target] < 1)	{	i = 100;	break;	}
			currentHealths[target] = Mathf.Max(currentHealths[target] - (damage * (1 - damageReductions[target]/100.0)), 0);
			if(currentHealths[target] < 1)	{
				if(currentHealths[target] < 0) {
					currentHealths[target] = 0;
				}
				KillUnit(attacker, target);
		    	i = 100;
			}
			else {	CheckRalphShield(target);		}
			yield WaitForSeconds(1);
		}
	}
}

function CheckRalphShield (charNumber : int) {
	//if the target is Ralph, his skill3 isn't active and his health is below his passive threshold
	if(((charNumber == 1 && playerData.characterSelected == 0) || (charNumber == 2 && playerData.opponentSelected == 0)) && 
		!hasRalphDefense[charNumber] && currentHealths[charNumber]/maxHealths[charNumber] <= 0.15 && skillLevels[charNumber,2] > 0)	{
		if(charNumber == 1) {	skills.RalphSkillThree(charNumber, true); }
		else { opponentSkills.RalphSkillThree(charNumber, true); }
	}
}

function KillUnit (killerNumber : int, deadNumber : int) {
	switch(deadNumber) {	
	case 1:
		viewTarget = 38;
		RenderSettings.fogDensity = 0.05;
		RenderSettings.fogColor = Color.gray;
		RenderSettings.fog = true;
		playerAiming = false;
		break;	
	case 3:
		playerTowerDown = true;
		break;
	case 4:
		enemyTowerDown = true;
		break;
	case 5: 
		EndGame(false);	
		return;
		break;
	case 6:
		EndGame(true);	
		return;
		break;
	case 7:
		playerGuardianDown = true;
		break;
	case 8:
		enemyGuardianDown = true;
		break;
	case 38:
		return;
		break;
	}
	
	currentHealths[deadNumber] = 0;
	
	//prevent attacks from finishing
	StopBasicAttack(deadNumber);
	
	// if the dead is a character
	if(deadNumber == 1 || deadNumber == 2)	{			
		if(deadNumber == 1)		{
			//interrupt skills	
			skills.InterruptSkills(deadNumber, currentTargets[deadNumber]);
			kills[2] += 1;
		}
		else		{
			//interrupt skills	
			opponentSkills.InterruptSkills(deadNumber, currentTargets[deadNumber]);
			kills[1] += 1;
		}
		//award kill
		deaths[deadNumber] += 1;
		killingSprees[deadNumber] = 0;		
	}	
	
	var deathPoint : Vector3 = targetObjects[deadNumber].transform.position;
	var deathRotation : Quaternion = targetObjects[deadNumber].transform.rotation;
	var newBounds : Bounds;
	if(deadNumber == 3 || deadNumber == 4) { newBounds = targetObjects[deadNumber].collider.bounds; }
	var teamNumber : int = 1;
	var enemyNumber : int = 2;
	if(deadNumber == 2) { teamNumber = 0; enemyNumber = 1;}			
	//if the dead is ralph or bob
	if((deadNumber == 1 && playerData.characterSelected == 0) || (deadNumber == 2 && playerData.opponentSelected == 0) || deadNumber > 34) 	{
		//explode			
		//for each enemy around the dead, no structures
		//if close enough to death location
		//monster
		var enemyDist : float = Vector3.Distance(deathPoint, targetObjects[0].collider.ClosestPointOnBounds(deathPoint));
		if(enemyDist < 5)	{
			MaxPoisonStacks(deadNumber,0);
		}
		//enemy char
		//if in range of target
		enemyDist = Vector3.Distance(deathPoint, targetObjects[enemyNumber].collider.ClosestPointOnBounds(deathPoint));
		if(enemyDist < 5)	{
			MaxPoisonStacks(deadNumber,enemyNumber);
		}
		//everything else but bobs
		for(var j : int = 7+teamNumber; j < 35; j+=2)	{
			//if in range of target
			enemyDist = Vector3.Distance(deathPoint, targetObjects[j].collider.ClosestPointOnBounds(deathPoint));
			if(enemyDist < 5)	{
				MaxPoisonStacks(deadNumber,j);
			}
		}
		//bobs
		//if exists
		if(characterSelected[enemyNumber] == 0)		{
			//if in range of target
		    enemyDist = Vector3.Distance(deathPoint, targetObjects[35+teamNumber].collider.ClosestPointOnBounds(deathPoint));
			if(enemyDist < 5){	MaxPoisonStacks(deadNumber,35+teamNumber);	}
		}			
	}
	//else if the dead is a leonardo
	else if((deadNumber == 1 && playerData.characterSelected == 2) || (deadNumber == 2 && playerData.opponentSelected == 2)) 	{
		if(currentHealths[32+deadNumber] >= 1) { 
			brains[32+deadNumber].brainOn = false;
			KillUnit(38,32+deadNumber);	
		}
	}
	
	//if the dead is not the player or a chest
	if(deadNumber != 1 && deadNumber != 5 && deadNumber !=6) {
		//turn off dead brain (that sounds disturbing doesn't it?)
		brains[deadNumber].brainOn = false;
	}
	
	// if the dead is not a monster,character, spider or bob
	if(deadNumber > 2 && deadNumber < 33) 	{
		AreaExperience(deadNumber);
	}
	
	//move dead unit off battlefield
	if((deadNumber == 3) || (deadNumber == 4)) {	targetObjects[deadNumber].transform.position = Vector3(350, 0, 250); }
	else { targetObjects[deadNumber].transform.position = holdingAreaPosition; }
		
	if(gameOver) { 
		//show death animation
		AnimateDeath(deadNumber, deathPoint, deathRotation, newBounds);
	}
	else {		
		//reset anyone targeting dead except bobs
		for(var i : int = 0; i < TOTAL_TARGET_OBJECTS-4; i++)	{
			//if target is dead
			if(currentTargets[i] == deadNumber)	{
				if(i == 1) { viewTarget = 38; }
				seekingTarget[i] = false;	
				inRange[i] = false;
				if(i < 35) { StopBasicAttack(i); }	
				if((i < 3 || i > 6) && i < 35) {
					aiPaths[i].canMove = false;
					aiPaths[i].canSearch = false;
					moveTarget[i] = targetObjects[i].transform.position;
				}							
				
				//if it was the monster's target
				if(i == 0)	{
					//check for more targets
					for(var mdt : int = 0; mdt < TOTAL_TARGET_OBJECTS-2; mdt++)	{
						if(monsterAggro[mdt])	{
							currentTargets[0] = mdt;
							EngageTarget(0);
							break;
						}
					}		
				}			
			}	
		}
			
		//reset dead units movement, attacking and targeting
		if((deadNumber < 3 || deadNumber > 6) && deadNumber < 35){
			moving[deadNumber] = false;
			aiPaths[deadNumber].canMove = false;
			aiPaths[deadNumber].canSearch = false;
		}
		currentTargets[deadNumber] = 38;
		seekingTarget[deadNumber] = false;
		inRange[deadNumber] = false;
		//reset monster aggro
		monsterAggro[deadNumber] = false;
		StopBasicAttack(deadNumber);
		anims[deadNumber].StopAnims();	
		
		//reset anim and poison if not tower or chest
		if(deadNumber < 3 || deadNumber > 6){
			anims[deadNumber].Idle();
			poisonStacks[deadNumber] = 0;
			var parSys : Transform = targetObjects[deadNumber].transform.Find("Poison");
			parSys.particleSystem.Stop();
			parSys.particleSystem.Clear();
		}
		
		//if the dead is a character, tower. or guardian
		if(deadNumber == 1 || deadNumber == 2 || deadNumber == 3 || deadNumber == 4 || deadNumber == 7 || deadNumber == 8)	{
			GlobalExperience(deadNumber);
		}
		//if the killer is a character
		if(killerNumber == 1 || killerNumber == 2 || killerNumber > 32)	{
			var xpGainer : int = killerNumber;
			if(killerNumber > 32) { xpGainer = xpGainer % 2; if(xpGainer == 0) { xpGainer = 2; } } 
			//last hit xp
			experiences[xpGainer] += lastHitValues[deadNumber];
			//Debug.Log("Last Hit XP to " + targetObjects[xpGainer].tag + " = " + lastHitValues[deadNumber] + " for killing " + targetObjects[deadNumber].tag + ".");
			// if the dead is a character
			if(deadNumber == 1 || deadNumber == 2)		{
				killingSprees[xpGainer] += 1;
				//shut down bonus xp
				experiences[xpGainer] += (10*levels[deadNumber]*killingSprees[deadNumber]);
				//Debug.Log("Spree Shutdown XP to " + targetObjects[xpGainer].tag + " = " + (10*levels[deadNumber]*killingSprees[deadNumber]) + " for killing " + targetObjects[deadNumber].tag + ".");			
				//if the dead has the monster buff
				if(hasMonsterBuff[deadNumber]) {
					//give it to killer
					MonsterBuff(xpGainer);
					//remove it	
					RemoveMonsterBuff(deadNumber);
				}
			}		
		}
		
		//if a dead character still has the monster buff
		if(hasMonsterBuff[deadNumber]) {
			//remove it	
			RemoveMonsterBuff(deadNumber);
		}
		
		//check for level up
		CheckLevelUp();
		
		// if the dead needs a respawn timer 
		if(deadNumber < 3 || deadNumber == 7 || deadNumber == 8)	{
			var respawnTimer : int; 	
			if(deadNumber == 0)		{	respawnTimer = monsterRespawnTime;		isMonsterRespawning = true;}
			else if(deadNumber < 3) {
				var killTimeBonus : float = (deaths[deadNumber] - kills[deadNumber])/2.0;
				if(killTimeBonus < 0) { killTimeBonus = 0; }
				respawnTimer = killTimeBonus + levels[deadNumber] + 5;		
			}		
			else { respawnTimer = guardianRespawnTime; }
			Respawn(deadNumber, respawnTimer);
		}
		//if monster is dead
		if(deadNumber == 0)	{
			//if the killer is a character or skill
			if(killerNumber < 3 || killerNumber > 32) {
				//give buff to character
				var myChar : int = 1;
				if(killerNumber % 2 == 0) { myChar = 2; }
				MonsterBuff(myChar);
			}
			//and reset all his aggros
			for(var mdr : int = 0; mdr < TOTAL_TARGET_OBJECTS; mdr++)		{
				monsterAggro[mdr] = false;					
			}
		}
		//show death animation
		AnimateDeath(deadNumber, deathPoint, deathRotation, newBounds);
	}
}

function AnimateDeath (deadUnit : int, deathPoint : Vector3, deathRotation : Quaternion, newBounds : Bounds) {
	var animationBody : Transform;	
	for(var i : int = 0; i < 2; i++) {
		if(i == 0) {		
			//play death sound
			if(!playerData.effectMuted && deathSoundEffects[deadUnit] != null) {
				deathSoundEffects[deadUnit].volume = playerData.effectVolume/100.0;
				deathSoundEffects[deadUnit].transform.position = deathPoint;
				if(deadUnit > 6 && deadUnit < 33) {		StartDeathSounds(deathSoundEffects[deadUnit]);		}
				else { deathSoundEffects[deadUnit].Play(); }
			}
			
			//place animation body
			animationBody = animationUnits[deadUnit].transform;
			animationBody.rotation = deathRotation;
			animationBody.position = deathPoint;
			
			unitAnimations[deadUnit].Die(deadUnit);
			if((deadUnit == 1 && characterSelected[1] == 0) || (deadUnit == 2 && characterSelected[2] == 0) || deadUnit > 34) {
				animationUnits[deadUnit].transform.Find("PoisonCloud").particleSystem.Clear();
				animationUnits[deadUnit].transform.Find("PoisonCloud").particleSystem.Play();
			}
			else if((deadUnit == 3) || (deadUnit == 4)) {
				animationUnits[deadUnit].transform.Find("Explosion").particleSystem.Clear();
				animationUnits[deadUnit].transform.Find("Explosion").particleSystem.Play();
				if(!playerData.effectMuted) { StartTowerExplosionSound(deadUnit, animationUnits[deadUnit].transform.position); }
			}
			yield WaitForSeconds(2.5);
		}
		else {
			//move anim off field			
			if((deadUnit == 3) || (deadUnit == 4)) {
				var expPar : GameObject = animationUnits[deadUnit].transform.Find("Explosion").gameObject;
				expPar.transform.parent = null;
				FinishExplosion(expPar);
			}				
			animationBody.position = holdingAreaPosition;
			if((deadUnit == 1 && characterSelected[1] == 0) || (deadUnit == 2 && characterSelected[2] == 0) || deadUnit > 34) {
				animationUnits[deadUnit].transform.Find("PoisonCloud").particleSystem.Stop();
				animationUnits[deadUnit].transform.Find("PoisonCloud").particleSystem.Clear();				
			}
			unitAnimations[deadUnit].Idle();
			//if its a tower, redo pathing
			if(deadUnit == 3 || deadUnit == 4) { 
				newBounds.center = Vector3(newBounds.center.x, 0, newBounds.center.z);
				var xVal : float = newBounds.size.x*2;
				var zVal : float = newBounds.size.z*2;
				newBounds.size = Vector3(xVal, 0.5f, zVal);
				var guo : GraphUpdateObject = new GraphUpdateObject (newBounds);
				guo.updatePhysics = false;
				guo.modifyWalkability = true;
				guo.setWalkability = true;
				guo.resetPenaltyOnPhysics = false;
				AstarPath.active.UpdateGraphs (guo);
			}
		}
	}
}

function StartDeathSounds (deadSound : AudioSource) {
	for(var i : int = 0; i < 3; i++) {
		switch(i) {
		case 0:
			deadSound.pitch = 0.8;
			deadSound.Play();
			yield WaitForSeconds(1);
			break;
		case 1:
			deadSound.pitch = 1.5;
			deadSound.Play();
			yield WaitForSeconds(0.5);
			break;		
		case 2:
			deadSound.pitch = 1;
			deadSound.Play();	
			break;	
		}
	}
}

function StartTowerExplosionSound (deadTower : int, towerPosition : Vector3) {
	var soundNum : int = 0;
	for(var i : int = 0; i < 4; i++) {
		if(deadTower == 4) { soundNum = 4; }
		switch(i) { 
		case 0:
			soundEffects[3+soundNum].transform.position = towerPosition;
			soundEffects[4+soundNum].transform.position = towerPosition;
			soundEffects[5+soundNum].transform.position = towerPosition;
			soundEffects[6+soundNum].transform.position = towerPosition;
			//fire sound
			soundEffects[6+soundNum].Play();
			yield WaitForSeconds(0.72);
			break;
		case 1:
			soundEffects[6+soundNum].Stop();
			soundEffects[3+soundNum].Play();
			yield WaitForSeconds(0.75);
			break;
		case 2:
			soundEffects[4+soundNum].Play();
			yield WaitForSeconds(1);
			break;
		case 3:
			soundEffects[5+soundNum].Play();
			break;	
		}
	}
}

function FinishExplosion (explosionObject  : GameObject) {
	for(var timeCount : int; timeCount < 2; timeCount++) {
		if(timeCount == 0) {
			yield WaitForSeconds(1);
		}
		else {
			explosionObject.transform.position = holdingAreaPosition;
			explosionObject.particleSystem.Stop();
			explosionObject.particleSystem.Clear();
		}
	}
}

function MonsterBuff (buffedUnit : int) {	
	if(!playerData.effectMuted) {
		soundEffects[11].volume = playerData.effectVolume/100.0;
		soundEffects[11].transform.position = targetObjects[buffedUnit].transform.position;
		soundEffects[11].Play();
	}
	hasMonsterBuff[buffedUnit] = true;
	monsterSpeedBuffs[buffedUnit] = movementSpeeds[buffedUnit] * 0.1;
	movementSpeeds[buffedUnit] += monsterSpeedBuffs[buffedUnit];
	aiPaths[buffedUnit].speed += monsterSpeedBuffs[buffedUnit];
	damageReductions[buffedUnit] += 5;
	healthRegens[buffedUnit] += 10;
	//show effects
	targetObjects[buffedUnit].transform.Find("MonsterBuff").particleSystem.Play();
	//Debug.Log("Applied Monster Buff");
}

function RemoveMonsterBuff (buffedUnit : int) {
	hasMonsterBuff[buffedUnit] = false;
	movementSpeeds[buffedUnit] -= monsterSpeedBuffs[buffedUnit];
	aiPaths[buffedUnit].speed -= monsterSpeedBuffs[buffedUnit];
	damageReductions[buffedUnit] -= 5;
	healthRegens[buffedUnit] -= 10;
	//stop effects
	targetObjects[buffedUnit].transform.Find("MonsterBuff").particleSystem.Stop();
	targetObjects[buffedUnit].transform.Find("MonsterBuff").particleSystem.Clear();
}

function MaxPoisonStacks (attackerNumber : int, target : int) {
	//if less than max poison stacks
	while(poisonStacks[target] < 5)	{
		//apply poison
		poisonStacks[target] += 1;
		//player bob
		if(attackerNumber == 35)		{
			DamageOverTime(1, target, levels[1]*2, 3.0f, true);
		}
		//enemy bob
		else if(attackerNumber == 36)		{
			DamageOverTime(2, target, levels[2]*2, 3.0f, true);
		}
		//ralphs
		else		{
			DamageOverTime(attackerNumber, target, levels[attackerNumber]*2, 3.0f, true);
		}
	}	
}

function GlobalExperience (globalGiver : int){
	//if the dead thing is on the opponents team
	if(globalGiver % 2 == 0)	{
		//give the player the global xp
		experiences[1] += globalValues[globalGiver];
		//Debug.Log("Global XP for " + targetObjects[1].tag + " = " + globalValues[globalGiver] + " for the death of " + targetObjects[globalGiver].tag);
	}
	else	{
		experiences[2] += globalValues[globalGiver];
	//Debug.Log("Global XP for " + targetObjects[2].tag + " = " + globalValues[globalGiver] + " for the death of " + targetObjects[globalGiver].tag);
	}
}

function AreaExperience (areaGiver : int)	{
	//if the dead thing is on the opponents team
	if(areaGiver % 2 == 0)	{
		//if the player is close enough
		if(Vector3.Distance(targetObjects[1].transform.position, targetObjects[areaGiver].transform.position) < 25)		{
			//give the player the area xp
			//Debug.Log("Area XP to " + targetObjects[1].tag + " = " + areaValues[areaGiver] + " for the death of " + targetObjects[areaGiver].tag);
			experiences[1] += areaValues[areaGiver];
		}
	}
	else	{
		//if the opponent is close enough
		if(Vector3.Distance(targetObjects[2].transform.position, targetObjects[areaGiver].transform.position) < 25)		{
			//give the opponent the area xp
			//Debug.Log("Area XP to " + targetObjects[2].tag + " = " + areaValues[areaGiver] + " for the death of " + targetObjects[areaGiver].tag);
			experiences[2] += areaValues[areaGiver];
		}
	}
}

function Respawn (respawnNumber : int, respawnTime : float)	{	
	for(var respawnVar: int = 0; respawnVar < 2; respawnVar++)	{
		if(!gameOver) {
			if(respawnVar == 1)		{
				anims[respawnNumber].Idle();
				currentHealths[respawnNumber] = maxHealths[respawnNumber];
				targetObjects[respawnNumber].transform.rotation.x = 0;
				targetObjects[respawnNumber].transform.rotation.z = 0;
				targetObjects[respawnNumber].transform.position = respawnPositions[respawnNumber];
				if(respawnNumber != 1) { brains[respawnNumber].brainOn = true; }
				if(respawnNumber == 0)			{
					isMonsterRespawning = false;
					//remove active monster buff
					for(var i : int = 1; i < 3; i++) {
						if(hasMonsterBuff[i]) { RemoveMonsterBuff(i); }	
					}
					targetObjects[respawnNumber].transform.rotation = Quaternion.Euler(0f,180f,0f);
				}
				else if(respawnNumber == 1)			{
					targetObjects[respawnNumber].transform.rotation = Quaternion.Euler(0f,90f,0f);
					currentResources[respawnNumber] = maxResources[respawnNumber];
					RenderSettings.fog = false;
					cameraMovement.CameraJump(targetObjects[1].transform.position);
					if(characterSelected[1] == 1) { 
						if(skillLevels[1, 2] > 0) {
							if(stances[1] == 0) {	skills.PlayParticle(targetObjects[respawnNumber].transform.Find("Grace"), 0.8, false);		}
							else {	skills.PlayParticle(targetObjects[respawnNumber].transform.Find("Finesse"), 0.8, false);	}	
						}	
					}		
				}
				else if(respawnNumber == 2)		{
					targetObjects[respawnNumber].transform.rotation = Quaternion.Euler(0f,270f,0f);
					currentResources[respawnNumber] = maxResources[respawnNumber];
					if(characterSelected[2] == 1) {
						if(skillLevels[2, 2] > 0) { 
							if(stances[2] == 0) {	skills.PlayParticle(targetObjects[respawnNumber].transform.Find("Grace"), 0.8, false);		}
							else {	skills.PlayParticle(targetObjects[respawnNumber].transform.Find("Finesse"), 0.8, false);	}		
						}
					}
				}
				else if(respawnNumber == 7)		{					
					targetObjects[respawnNumber].transform.rotation = Quaternion.Euler(0f,90f,0f);
					playerGuardianDown = false;
					StopChestAttacks(1);
				}
				else if(respawnNumber == 8)		{									
					targetObjects[respawnNumber].transform.rotation = Quaternion.Euler(0f,270f,0f);
					enemyGuardianDown = false;
					StopChestAttacks(0);	
				}
				
			}
			else {
				respawnDurations[respawnNumber] = respawnTime;
				RespawnTimer(respawnNumber, respawnTime+1);
				yield WaitForSeconds(respawnTime);
			}
		}
	}	
}

function RespawnTimer (respawnNumber : int, respawnTime : float) {	
	for(var i : int; i < respawnTime; i++) {
		respawnDurations[respawnNumber] -= 1;
		if(i < respawnTime - 1) {	yield WaitForSeconds(1);	}
		else {		break;		}
	}
}

function StopChestAttacks (teamNumber : int) {
	var necroNumber : int = 1+teamNumber;
	if(currentTargets[necroNumber] == 6-teamNumber) {	
		StopBasicAttack(necroNumber); 
		seekingTarget[necroNumber] = false; 
		aiPaths[necroNumber].canMove = false;
		aiPaths[necroNumber].canSearch = false;
		moveTarget[necroNumber] = targetObjects[necroNumber].transform.position;
		if(necroNumber == 1) { viewTarget = 38; }	
	}
	for(var i : int = 9+teamNumber; i < 35; i+=2) {
		//if the target is attacking the chest
		if(currentTargets[i] == 6-teamNumber) {		
			StopBasicAttack(i);	 
			seekingTarget[i] = false; 
			if((i < 3 || i > 6) && i < 35) {
				aiPaths[i].canMove = false;
				aiPaths[i].canSearch = false;
				moveTarget[i] = targetObjects[i].transform.position;
			}
		}
	}
}

function CheckLevelUp (){
	if(levels[1] < 10)	{
		if(experiences[1] >= playerExperienceNeeded)		{
			LevelUp(1);
		}
	}
	
	if(levels[2] < 10)	{
		if(experiences[2] >= opponentExperienceNeeded)		{
			LevelUp(2);
		}
	}
	
}

function LevelUp (levelingNumber : int){
	levels[levelingNumber] += 1;
	//if its the player
	if(levelingNumber == 1)	{
		if(!playerData.effectMuted) { soundEffects[0].Play(); }
		levelUpSparkle[1].particleSystem.Play();
		skillPointAvailable = true;
		skillPoints += 1;
		playerExperienceNeeded += ((levels[1] + 1) * 100);
		globalValues[1] += 80;
	}
	//else if its the opponent
	else if(levelingNumber == 2)	{
	//	Debug.Log("leveling up");
		levelUpSparkle[2].particleSystem.Play();
		brains[2].LevelUpSkills();
		opponentExperienceNeeded += ((levels[2] + 1) * 100);
		globalValues[2] += 80;
	}
	//increase xp values of ncus
	//if its the monster
	else if(levelingNumber == 0)	{
		globalValues[levelingNumber] += 30;
	}
	//if its a guardian
	else if(levelingNumber == 7 || levelingNumber == 8)	{
		globalValues[levelingNumber] += 50;
		areaValues[levelingNumber] += 20;
		lastHitValues[levelingNumber] += 10;		
	}
	//if its a minion
	else if(levelingNumber > 8 && levelingNumber < 33)	{
		areaValues[levelingNumber] += 3;
		lastHitValues[levelingNumber] += 2;		
	}		
	
	//standard increases for all units
	maxHealths[levelingNumber] += healthGrowths[levelingNumber];
	healthRegens[levelingNumber] += healthRegenGrowths[levelingNumber];
	attackDamages[levelingNumber] += attackDamageGrowths[levelingNumber];
	damageReductions[levelingNumber] += damageReductionGrowths[levelingNumber];
	movementSpeeds[levelingNumber] += movementSpeedGrowths[levelingNumber];
	aiPaths[levelingNumber].speed += movementSpeedGrowths[levelingNumber];	

	//if its a character
	if(levelingNumber == 1 || levelingNumber == 2)	{
		//increase resources
		maxResources[levelingNumber] += resourceGrowths[levelingNumber];
		resourceRegens[levelingNumber] += resourceRegenGrowths[levelingNumber];
		//if alive
		if(currentHealths[levelingNumber] >= 1) {
			//level up heal
			currentHealths[levelingNumber] += healthGrowths[levelingNumber];
			currentResources[levelingNumber] += resourceGrowths[levelingNumber];
		}
	}	
	unitData.UpdateTooltips();
}

function EndGame (win : boolean) {	EndGame(win, false); }
function EndGame (win : boolean, early : boolean) {
	StopAllSoundEffects();
	gameOver = true;
	minimap.enabled = false;
	minimap.transform.Find("Background").guiTexture.enabled = false;
	//turn off stage brains (opponent, tower and guardian)
	brains[0].brainOn = false;
	brains[3].brainOn = false;
	brains[4].brainOn = false;
	brains[7].brainOn = false;
	brains[8].brainOn = false;
	//freeze everyone
	for(var i : int = 0; i < 37; i++) {
		frozen[i] = true;
		if(i < 3 || i > 6 && currentHealths[i] >= 1) { 			
			StopBasicAttack(i);
			anims[i].Idle(); 			
			if(i < 35) { aiPaths[i].canMove = false;	aiPaths[i].canSearch = false; }
		}
	}

	playerData.finalLevel = levels[1];
	playerData.finalKills = kills[1];	
	playerData.finalDeaths = deaths[1];
	playerData.finalClock = gameClock;
	if(win)	{
		if(deaths[1] == 0 && gameClock < 421.00 && !playerTowerDown)		{
			playerData.gemEarned = 3;
		}
		else if(deaths[1] == 0)		{
			playerData.gemEarned = 2;
		}
		else		{
			playerData.gemEarned = 1;
		}
		var challengeNumber : int = (playerData.characterSelected * 20) + (playerData.difficultySelected * 4) + playerData.opponentSelected;
		if(playerData.finalClock < playerData.challengeTimes[challengeNumber] || playerData.challengeTimes[challengeNumber] < 1) {
			 playerData.challengeTimes[challengeNumber] = playerData.finalClock;
		}
	}
	else	{
		playerData.gemEarned = 0;
	}
	var resultString;	
	if(early) { resultString = "Forfeit"; } else if(win) { resultString = "Victory"; } else { resultString = "Defeat"; }
	postingResults = true;
	postResults(unitData.characterNames[playerData.characterSelected], unitData.characterNames[playerData.opponentSelected], unitData.difficultyNames[playerData.difficultySelected], 
					resultString, kills[1].ToString(), kills[2].ToString(), 
						levels[1].ToString(), levels[2].ToString(), gameClock.ToString());
	if(early) { Results(); }	
	else if(win) { RenderSettings.fog = false; Boom(true, "EnemyBase", 6, Vector3(70, 12, -6));  }
	else { Boom(false, "PlayerBase", 5, Vector3(-70, 12, -6));  }	
	
}

private var secretKey="xwd3DD28Gi!"; // Edit this value and make sure it's the same as the one stored on the server
var addScoreUrl="http://monsoongames.com/addResult.php?"; //be sure to add a ? to your url
var postingResults : boolean = true;
function postResults(player : String, opponent : String, difficulty : String, result : String, playerKills : String, enemyKills : String, 
						playerLevel : String, enemyLevel : String, length : String) {
   Debug.Log("started post");
    //This connects to a server side php script that will add the name and score to a MySQL DB.
    // Supply it with a string representing stored variables
    var hash=Md5Sum(player + opponent + difficulty + result + playerKills + enemyKills + playerLevel + enemyLevel + length + secretKey); 
 
    var highscore_url = addScoreUrl + "player=" + player + "&opponent=" + opponent + "&difficulty=" + difficulty + "&result=" + result + 
    	"&playerKills=" + playerKills + "&enemyKills=" + enemyKills + "&playerLevel=" + playerLevel + "&enemyLevel=" + enemyLevel + "&length=" + length + "&hash=" + hash;
 
    // Post the URL to the site and create a download object to get the result.
    var hs_post = WWW(highscore_url);
    Debug.Log("waiting for download");
    yield hs_post; // Wait until the download is done
    if(hs_post.error) {
        print("There was an error posting the high score: " + hs_post.error);
    }
    Debug.Log("returned : " + hs_post.text);
    postingResults = false;
}

static function Md5Sum(strToEncrypt: String)
{
	var encoding = System.Text.UTF8Encoding();
	var bytes = encoding.GetBytes(strToEncrypt);
 
	// encrypt bytes
	var md5 = System.Security.Cryptography.MD5CryptoServiceProvider();
	var hashBytes:byte[] = md5.ComputeHash(bytes);
 
	// Convert the encrypted bytes back to a string (base 16)
	var hashString = "";
 
	for (var i = 0; i < hashBytes.Length; i++)
	{
		hashString += System.Convert.ToString(hashBytes[i], 16).PadLeft(2, "0"[0]);
	}
 
	return hashString.PadLeft(32, "0"[0]);
}

function Boom (win : boolean, baseName : String, chestNumber : int, cameraPosition : Vector3) {
	var expPart : Transform;
	var base : GameObject;
	for(var counter : int = 0; counter < 3; counter++) {
		switch(counter) {
		case 0:
			Camera.main.transform.position = cameraPosition;
			expPart = targetObjects[chestNumber].transform.Find("Explosion");
			expPart.particleSystem.Play();
			if(!playerData.effectMuted) {	ChestExplosionSound(chestNumber, deathSoundEffects[chestNumber]); }
			base = GameObject.Find(baseName);
			base.transform.Find("Bottom").particleSystem.Stop();
			base.transform.Find("Top").particleSystem.Stop();
			yield WaitForSeconds(2.8);
			break;
		case 1:
			base.transform.Find("Bottom").particleSystem.Clear();
			base.transform.Find("Top").particleSystem.Clear();
			expPart.parent = null;			
			targetObjects[chestNumber].transform.position = holdingAreaPosition;
			if(win) { 
				var gems : GameObject = GameObject.Find("Gems");
				switch(playerData.gemEarned) {
				case 1:
					var redGem : Transform = gems.transform.Find("RedGem");
					redGem.position = Vector3(70,2,0);
					redGem.GetComponent(GemSpinner).isSpinning = true;
					break;
				case 2:
					var blueGem : Transform = gems.transform.Find("BlueGem");
					blueGem.position = Vector3(70,2,0);
					blueGem.GetComponent(GemSpinner).isSpinning = true;
					break;
				case 3:
					var purpleGem : Transform = gems.transform.Find("PurpleGem");
					purpleGem.position = Vector3(70,2,0);
					purpleGem.GetComponent(GemSpinner).isSpinning = true;
					break;
				}
			}
			yield WaitForSeconds(1.2);
			break;
		case 2:
			expPart.position = holdingAreaPosition;
			expPart.particleSystem.Stop();				
			if(win) { Victory(); } 
			else { Defeat(); }
			break;		
		}
	}
}

function ChestExplosionSound (chestNumber : int, chestSound : AudioSource) {
	for(var i : int = 0; i < 2; i++) {
		switch(i) {
		case 0:
			yield WaitForSeconds(0.75);
			break;
		case 1:
			chestSound.volume = playerData.effectVolume/100.0;
			chestSound.transform.position = targetObjects[chestNumber].transform.position;
			chestSound.Play();
			break;
		}
	}
}

var origTextSize : int;
function TextSizer () {
	var scaleX : float;
	var scaleY : float;
	var endTexture : GameObject = endText.Find("EndTexture");
	for(;;) {
		if(!Camera.main) { break; }
		scaleX = Camera.main.pixelWidth / 800;
		scaleY = Camera.main.pixelHeight / 600;
		endText.guiText.fontSize = origTextSize * scaleY;
		endTexture.guiTexture.pixelInset.width = 500 * scaleX;
		endTexture.guiTexture.pixelInset.height = 140 * scaleY;
		endTexture.guiTexture.pixelInset.x = -250 * scaleX;
		endTexture.guiTexture.pixelInset.y = -75 * scaleY;
//		endTexture.guiTexture.transform.localScale.x = (1 * scaleX) - 1;	
//		endTexture.guiTexture.transform.localScale.y = (1 * scaleY) - 1;	
		yield WaitForFixedUpdate();
	}
}

function Victory () {
	for(var counter : int = 0; counter < 2; counter++) {
		switch(counter) {
		case 0:				
			if(!playerData.musicMuted) { PlayVictoryMusic(); }
			for(var i : int = 0; i < 37; i++) {
				if(i < 3 || i > 6 && currentHealths[i] >= 1)
				if(i != 0 && i % 2 == 0) {
					KillUnit(38, i);
				}
				else if(i > 8 && i < 33) {
					anims[i].Dance();
				}
			}
			TextSizer();
			endText.guiText.text = "Victory";
			endText.guiText.transform.position.y = 0.2;
			endText.guiText.color = Color.blue;
			endText.guiText.enabled = true;
			var endTexture : GameObject = endText.Find("EndTexture");
			endTexture.guiTexture.color = Color.white;
			endTexture.guiTexture.enabled = true;
			yield WaitForSeconds(3.5);
			break;
		//close up
		case 1:
			//grav
			if(characterSelected[1] == 3 && currentHealths[1] >= 1) {
				targetObjects[1].transform.position = playerGuardianPosition;	
				targetObjects[1].transform.rotation = Quaternion.Euler(0f,90f,0f);	
				if(!playerGuardianDown) {
					targetObjects[1].transform.position.z -= 2.5;					
					targetObjects[7].transform.position = playerGuardianPosition;
					targetObjects[7].transform.position.z += 2.5;
					targetObjects[7].transform.rotation = Quaternion.Euler(0f,90f,0f);
					Camera.main.transform.position = Vector3(-58, 5.25, -1);
					clickTarget.position = playerGuardianPosition;
					Camera.main.transform.LookAt(clickTarget);
					anims[7].Dance();
				}		
				else {
					Camera.main.transform.position = Vector3(-58, 3.5, -3);
					Camera.main.transform.LookAt(targetObjects[1].transform.position);
				}
				anims[1].Dance();
				EndBuffer(.5, 9);
			}
			else if(playerGuardianDown) {		
				EndBuffer(.5, 7);
			}
			else {
				targetObjects[7].transform.position = playerGuardianPosition;
				targetObjects[7].transform.rotation = Quaternion.Euler(0f,90f,0f);
				Camera.main.transform.position = Vector3(-59, 5, -3);
				Camera.main.transform.LookAt(targetObjects[7].transform.position);
				anims[7].Dance();
				EndBuffer(3, 24);
			}
			break;
		}
	}	
}

function PlayVictoryMusic() {
	StopBattleMusic();
	var victoryMusic : AudioSource = GameObject.Find("VictoryMusic").audio;
	victoryMusic.volume = playerData.musicVolume/100.0;
	victoryMusic.Play();
	
}

function StopBattleMusic() {
	var battleMusic : AudioSource = GameObject.Find("BattleMusic").audio;
	battleMusic.Stop();
}

function Defeat () {
	StopBattleMusic();
	TextSizer();
	endText.guiText.text = "Defeat";
	endText.guiText.transform.position.y = 0.5;
	endText.guiText.color = Color.red;
	endText.guiText.enabled = true;
	var endTexture : GameObject = endText.Find("EndTexture");
	endTexture.guiTexture.color = Color.black;
	endTexture.guiTexture.enabled = true;
	//Debug.Log(endText); 
	
	for(var i : int = 0; i < 37; i++) {
		frozen[i] = true;
		if(i < 3 || i > 6 && currentHealths[i] >= 1) { 			
			anims[i].Idle(); 	
			if(i < 35) { aiPaths[i].canMove = false;	aiPaths[i].canSearch = false; }
			if(i != 0 && i % 2 != 0) {
				KillUnit(38, i);
			}
		}
	}
	EndBuffer(2, 3);
}

function StopAllSoundEffects () {
	StopCoroutine("PlayHeartbeat");	
	for(var soundEffect in soundEffects) { 				
		CheckSoundStop(soundEffect);
	}
	for(soundEffect in attackSoundEffects) { 
		CheckSoundStop(soundEffect);
	}
	for(soundEffect in deathSoundEffects) { 
		CheckSoundStop(soundEffect);
	}
	for(soundEffect in teleportSoundEffects) { 
		CheckSoundStop(soundEffect);
	}
	for(soundEffect in skills.skillSoundEffects) { 
		CheckSoundStop(soundEffect);
	}
	for(soundEffect in skills.runtSoundEffects) { 
		CheckSoundStop(soundEffect);
	}
	for(soundEffect in opponentSkills.skillSoundEffects) { 
		CheckSoundStop(soundEffect);
	}
	for(soundEffect in opponentSkills.runtSoundEffects) { 
		CheckSoundStop(soundEffect);
	}
}

function CheckSoundStop (soundEffect : AudioSource) {
	if(soundEffect != null) {
		soundEffect.Stop();
	}
}

//duration : forced, timerDuration : skippable 
function EndBuffer (duration : int, timerDuration : int) {
	for(var i : int = 0; i < duration+1; i++) {
		if(i == duration) {			
			StartCoroutine("EndTimer", timerDuration);
			StartCoroutine("EndEarly");	
		}
		else {
			yield WaitForSeconds(1);
		}
	}
}

function EndTimer (duration : int) {
	for(var i : int = 0; i < duration+1; i++) {
		if(i == duration) {
			StopCoroutine("EndEarly");
			Results();
		}
		else {
			yield WaitForSeconds(1);
		}
	}
}

function EndEarly () {
	for(;;) {
		if(Input.GetMouseButtonUp(0) || Input.GetMouseButtonUp(1) || Input.GetKeyDown(playerData.keySettings[13]) || Input.GetKeyDown(playerData.keySettings[14])) {
			StopCoroutine("EndTimer");
			Results();
			break;
		}
		else { yield; }
	}
}

function Results () {
	currentGem = playerData.gems[playerData.challengeSelected];
	if(playerData.gemEarned > currentGem)	{
		playerData.gems[playerData.challengeSelected] = playerData.gemEarned;
	}
	playerData.SavePowerSettings();
	playerData.SaveSettings();
	LoadResults();	
}

function LoadResults () {
	for(;;) {
		if(Application.CanStreamedLevelBeLoaded("Results") && !postingResults) {
			RenderSettings.fog = false;
			Application.LoadLevel("Results");
			break;
		}
		else {
			yield WaitForFixedUpdate();
		}
	}
}

function ResetGame () {
	Time.timeScale = 1;
	RenderSettings.fog = false;
	//find sounds
	soundEffects = new AudioSource[12];	
	soundEffects[0] = GameObject.Find("LevelUpSound").audio;
	soundEffects[1] = GameObject.Find("SkillFailed").audio;
	soundEffects[2] = GameObject.Find("LowHealthHeartbeat").audio;
	soundEffects[3] = GameObject.Find("TowerExplosionSound").audio;
	soundEffects[4] = Instantiate(GameObject.Find("TowerExplosionSound")).audio;
	soundEffects[5] = Instantiate(GameObject.Find("TowerExplosionSound")).audio;
	soundEffects[6] = Instantiate(GameObject.Find("ScorchSound")).audio;
	soundEffects[7] = Instantiate(GameObject.Find("TowerExplosionSound")).audio;
	soundEffects[8] = Instantiate(GameObject.Find("TowerExplosionSound")).audio;
	soundEffects[9] = Instantiate(GameObject.Find("TowerExplosionSound")).audio;
	soundEffects[10] = Instantiate(GameObject.Find("ScorchSound")).audio;
	soundEffects[11] = Instantiate(GameObject.Find("MonsterBuffSound")).audio;
	attackSoundEffects = new AudioSource[37];
	attackSoundEffects[0] = GameObject.Find("MonsterAttackSound").audio;
	attackSoundEffects[3] = GameObject.Find("TowerShotSound").audio;
	attackSoundEffects[4] = Instantiate(GameObject.Find("TowerShotSound")).audio;
	attackSoundEffects[7] = GameObject.Find("MinionAttackSound").audio;
	attackSoundEffects[8] = Instantiate(GameObject.Find("MinionAttackSound")).audio;
	attackSoundEffects[33] = Instantiate(GameObject.Find("SpiderSound")).audio;
	attackSoundEffects[34] = Instantiate(GameObject.Find("SpiderSound")).audio;
	attackSoundEffects[35] = Instantiate(GameObject.Find("RuntKickSound")).audio;
	attackSoundEffects[36] = Instantiate(GameObject.Find("RuntKickSound")).audio;
	deathSoundEffects = new AudioSource[37];
	deathSoundEffects[0] = Instantiate(GameObject.Find("LeonardoDeathSound")).audio;
	deathSoundEffects[0].pitch = 2.5;
	deathSoundEffects[5] = Instantiate(GameObject.Find("TowerExplosionSound")).audio;
	deathSoundEffects[6] = Instantiate(GameObject.Find("TowerExplosionSound")).audio;
	deathSoundEffects[7] = GameObject.Find("MinionDeathSound").audio;
	deathSoundEffects[8] = Instantiate(GameObject.Find("MinionDeathSound")).audio;
	deathSoundEffects[33] = Instantiate(GameObject.Find("SpiderSound")).audio;
	deathSoundEffects[33].pitch = 0.7;
	deathSoundEffects[34] = Instantiate(GameObject.Find("SpiderSound")).audio;
	deathSoundEffects[34].pitch = 0.7;
	deathSoundEffects[35] = Instantiate(GameObject.Find("RalphDeathSound")).audio;
	deathSoundEffects[36] = Instantiate(GameObject.Find("RalphDeathSound")).audio;
	for(var minionNum : int = 9; minionNum < 33; minionNum++) {
		attackSoundEffects[minionNum] = Instantiate(GameObject.Find("MinionAttackSound")).audio;
		deathSoundEffects[minionNum] = Instantiate(GameObject.Find("MinionDeathSound")).audio;
	}
	switch(playerData.characterSelected) {
	case 0:
		attackSoundEffects[1] = Instantiate(GameObject.Find("RalphAttackSound")).audio;
		deathSoundEffects[1] = Instantiate(GameObject.Find("RalphDeathSound")).audio;
		break;
	case 1:
		attackSoundEffects[1] = Instantiate(GameObject.Find("RosalindAttackSound")).audio;
		deathSoundEffects[1] = Instantiate(GameObject.Find("RosalindDeathSound")).audio;
		break;
	case 2:
		attackSoundEffects[1] = Instantiate(GameObject.Find("LeonardoAttackSound")).audio;
		deathSoundEffects[1] = Instantiate(GameObject.Find("LeonardoDeathSound")).audio;
		break;
	case 3:
		attackSoundEffects[1] = Instantiate(GameObject.Find("GravitonAttackSound")).audio;
		deathSoundEffects[1] = Instantiate(GameObject.Find("GravitonDeathSound")).audio;
		break;
	}	
	switch(playerData.opponentSelected) {
	case 0:
		attackSoundEffects[2] = Instantiate(GameObject.Find("RalphAttackSound")).audio;
		deathSoundEffects[2] = Instantiate(GameObject.Find("RalphDeathSound")).audio;
		break;
	case 1:
		attackSoundEffects[2] = Instantiate(GameObject.Find("RosalindAttackSound")).audio;
		deathSoundEffects[2] = Instantiate(GameObject.Find("RosalindDeathSound")).audio;
		break;
	case 2:
		attackSoundEffects[2] = Instantiate(GameObject.Find("LeonardoAttackSound")).audio;
		deathSoundEffects[2] = Instantiate(GameObject.Find("LeonardoDeathSound")).audio;
		break;
	case 3:
		attackSoundEffects[2] = Instantiate(GameObject.Find("GravitonAttackSound")).audio;
		deathSoundEffects[2] = Instantiate(GameObject.Find("GravitonDeathSound")).audio;
		break;
	}	
	teleportSoundEffects = new AudioSource[3];
	teleportSoundEffects[1] = GameObject.Find("TeleportSound").audio;
	teleportSoundEffects[2] = Instantiate(GameObject.Find("TeleportSound")).audio;
	//reset vars
	gameOver = false;
	endText = Camera.main.transform.parent.Find("EndText").gameObject;
	origTextSize = endText.guiText.fontSize;
	viewTarget = 38;
	//cam vars
	cameraMovement = Camera.main.gameObject.GetComponent(CameraMovement);
	leftCamera = false;
	rightCamera = false;
	minimap = GameObject.FindGameObjectWithTag("Minimap").camera;
	minimap.enabled = true;
	minimap.transform.Find("Background").guiTexture.enabled = true;
	targetMarker = GameObject.FindGameObjectWithTag("TargetMarker").transform;
	targetMarker.position = Vector3(1000, 0, 1000);
	marked = false;
	invisible = new boolean[TOTAL_TARGET_OBJECTS];
	//pause
	paused = false;
	waveTwo = false;
	isLowHealth = false;
	//reset movement and targeting
	//attack vars //targeting
	attacking = new boolean[TOTAL_TARGET_OBJECTS];
	inRange = new boolean[TOTAL_TARGET_OBJECTS];
	seekingTarget = new boolean[TOTAL_TARGET_OBJECTS];
	currentTargets = new int[TOTAL_TARGET_OBJECTS];
	moveTarget = new Vector3[TOTAL_TARGET_OBJECTS];
	moving = new boolean[TOTAL_TARGET_OBJECTS];
	//aggros
	monsterAggro = new boolean[TOTAL_TARGET_OBJECTS];
	unitAggro = new boolean[TOTAL_TARGET_OBJECTS];
	
	//pathing
	clickTarget = GameObject.FindGameObjectWithTag("ClickTarget").transform;
	aiPaths = new AIPath[TOTAL_TARGET_OBJECTS];
	astarPath = GameObject.FindGameObjectWithTag("AstarPath").GetComponent(AstarPath);
	teleporting = new boolean[3];
	
	//status effects
	//freeze for skill use
	frozen = new boolean[TOTAL_TARGET_OBJECTS];
	//stun for combat use
	stunned = new boolean[TOTAL_TARGET_OBJECTS];
	//monster buff
	hasMonsterBuff = new boolean[TOTAL_TARGET_OBJECTS];
	monsterSpeedBuffs = new float[TOTAL_TARGET_OBJECTS];
	
	//reset target objects
	targetObjects = new GameObject[TOTAL_TARGET_OBJECTS];
	
	//reset xp values
	lastHitValues = new int[TOTAL_TARGET_OBJECTS];
	globalValues = new int[TOTAL_TARGET_OBJECTS];
	areaValues = new int[TOTAL_TARGET_OBJECTS];

	//reset levels
	levelUpSparkle = new Transform[3];
	levels = new int[TOTAL_TARGET_OBJECTS];
	experiences = new int[TOTAL_TARGET_OBJECTS];
	playerExperienceNeeded = 200;
	opponentExperienceNeeded = 200;
	
	//skills
	skills = this.GetComponent(Skills);
	opponentSkills = this.GetComponent(OpponentSkills);	
	useSkill = new Function[3,4];
	stances = new int[3];
	bobAtMonster = new boolean[3];
	playerAiming = false;
	playerAimingNumber = 5;
	
	skillTargetLocations = new Vector3[3];
	skillsExecuting = new boolean[3,4];
	skillLevels = new int[3,4];
	skillPointAvailable = true;
	skillPoints = 1;
	skillCosts = new int[3,4];
	skillCostGrowths = new int[3,4];
	
	poisonStacks = new int[37];
	hasRalphDefense = new boolean[3];
	bobRunts = new int[3];
	
	cooldowns = new boolean[3,4];
	cooldownTimers = new float[3,4];
	//k/d
	kills = new int[3];
	killingSprees = new int[3];
	deaths = new int[3];


	//reset starting stat arrays
	currentHealths = new float[TOTAL_TARGET_OBJECTS];
	maxHealths = new float[TOTAL_TARGET_OBJECTS];
	healthRegens = new float[TOTAL_TARGET_OBJECTS];
	healthGrowths = new int[TOTAL_TARGET_OBJECTS];
	healthRegenGrowths = new int[TOTAL_TARGET_OBJECTS];
	currentResources = new float[3];
	maxResources = new float[3];
	resourceRegens = new float[3];
	resourceGrowths = new int[3];
	resourceRegenGrowths = new int[3];
	attackDamages = new int[TOTAL_TARGET_OBJECTS];
	attackDamageGrowths = new int[TOTAL_TARGET_OBJECTS];
	attackSpeeds = new float[TOTAL_TARGET_OBJECTS];
	attackRanges = new float[TOTAL_TARGET_OBJECTS];
	damageReductions = new int[TOTAL_TARGET_OBJECTS];
	damageReductionGrowths = new int[TOTAL_TARGET_OBJECTS];
	movementSpeeds = new float[TOTAL_TARGET_OBJECTS];
	movementSpeedGrowths = new float[TOTAL_TARGET_OBJECTS];
	lifeSteals = new int[TOTAL_TARGET_OBJECTS];	
	
	//respawn vars
	respawnDurations = new int[9];
	isMonsterRespawning = false;
	//stage vars
	playerTowerDown = false;
	enemyTowerDown = false;
	playerGuardianDown = false;
	enemyGuardianDown = false;
	
	//find data
	playerData = GameObject.FindGameObjectWithTag("Data").GetComponent(PlayerData);
	unitData = GameObject.FindGameObjectWithTag("Data").GetComponent(UnitData);
	
	//find chars
	ralph = GameObject.FindGameObjectWithTag("Ralph");
	rosalind = GameObject.FindGameObjectWithTag("Rosalind");
	leonardo = GameObject.FindGameObjectWithTag("Leonardo");
	graviton = GameObject.FindGameObjectWithTag("Graviton");
	var gTempAnim : Animator = graviton.GetComponent(Animator);
	gTempAnim.enabled = true;
	animationRalph = GameObject.FindGameObjectWithTag("AnimationRalph");
	animationRosalind = GameObject.FindGameObjectWithTag("AnimationRosalind");
	animationLeonardo = GameObject.FindGameObjectWithTag("AnimationLeonardo");
	animationGraviton = GameObject.FindGameObjectWithTag("AnimationGraviton");
	
	//reload anims
	anims = new CharacterAnimation[TOTAL_TARGET_OBJECTS];
	animationUnits = new GameObject[TOTAL_TARGET_OBJECTS];
    unitAnimations = new CharacterAnimation[TOTAL_TARGET_OBJECTS];
    startedRun = new boolean[35];
    
	//reload brains
	brains = new Brain[TOTAL_TARGET_OBJECTS];	
	
	//find towers, chest,monster and corresponding brains, anims, paths
	targetObjects[0] = Instantiate(GameObject.FindGameObjectWithTag("Monster"), respawnPositions[0], Quaternion.Euler(0f,180,0f));
	animationUnits[0] = Instantiate(GameObject.FindGameObjectWithTag("AnimationMonster"), holdingAreaPosition, Quaternion.Euler(0f,180,0f));
	targetObjects[0].transform.rotation = Quaternion.Euler(0f,180f,0f);
	aiPaths[0] = targetObjects[0].GetComponent(AIPath);
	brains[0] = targetObjects[0].GetComponent(Brain);
	anims[0] = targetObjects[0].GetComponent(CharacterAnimation);
	unitAnimations[0] = animationUnits[0].GetComponent(CharacterAnimation);
	targetObjects[3] = Instantiate(GameObject.FindGameObjectWithTag("PlayerTower"), playerTowerPosition, Quaternion.Euler(0f,270,0f));
	targetObjects[3].collider.enabled = true;
	animationUnits[3] = Instantiate(GameObject.FindGameObjectWithTag("AnimationPlayerTower"), holdingAreaPosition, Quaternion.Euler(0f,270,0f));
	brains[3] = targetObjects[3].GetComponent(Brain);
	anims[3] = targetObjects[3].GetComponent(CharacterAnimation);
	targetObjects[4] = Instantiate(GameObject.FindGameObjectWithTag("EnemyTower"), enemyTowerPosition, Quaternion.Euler(0f,90,0f));
	targetObjects[4].collider.enabled = true;
	animationUnits[4] = Instantiate(GameObject.FindGameObjectWithTag("AnimationEnemyTower"), holdingAreaPosition, Quaternion.Euler(0f,90,0f));
	brains[4] = targetObjects[4].GetComponent(Brain);
	anims[4] = targetObjects[4].GetComponent(CharacterAnimation);
	targetObjects[5] = Instantiate(GameObject.FindGameObjectWithTag("PlayerChest"), playerChestPosition, Quaternion.Euler(0f,270,0f));
	targetObjects[6] = Instantiate(GameObject.FindGameObjectWithTag("EnemyChest"), enemyChestPosition, Quaternion.Euler(0f,90,0f));
	targetObjects[7] = Instantiate(GameObject.FindGameObjectWithTag("Guardian"), playerGuardianPosition, Quaternion.Euler(0f,90f,0f));
	animationUnits[7] = Instantiate(GameObject.FindGameObjectWithTag("AnimationGuardian"), holdingAreaPosition, Quaternion.Euler(0f,90f,0f));
	aiPaths[7] = targetObjects[7].GetComponent(AIPath);
	brains[7] = targetObjects[7].GetComponent(Brain);
	anims[7] = targetObjects[7].GetComponent(CharacterAnimation);
	targetObjects[7].tag = "PlayerGuardian";
	targetObjects[7].transform.rotation = Quaternion.Euler(0f,90f,0f);
	targetObjects[8] = Instantiate(GameObject.FindGameObjectWithTag("Guardian"), enemyGuardianPosition, Quaternion.Euler(0f,270f,0f));
	animationUnits[8] = Instantiate(GameObject.FindGameObjectWithTag("AnimationGuardian"), holdingAreaPosition, Quaternion.Euler(0f,90f,0f));
	aiPaths[8] = targetObjects[8].GetComponent(AIPath);
	brains[8] = targetObjects[8].GetComponent(Brain);
	anims[8] = targetObjects[8].GetComponent(CharacterAnimation);
	targetObjects[8].tag = "EnemyGuardian";
	targetObjects[8].transform.rotation = Quaternion.Euler(0f,270f,0f);
	
	//create/save minions
	//player melee minions
	for(var pmm : int = 0; pmm < 12; pmm+=2)	{
		targetObjects[pmm+9] = Instantiate(GameObject.FindGameObjectWithTag("MeleeMinion"), holdingAreaPosition, Quaternion.Euler(0f,90f,0f));
		animationUnits[pmm+9] = Instantiate(GameObject.FindGameObjectWithTag("AnimationMeleeMinion"), holdingAreaPosition, Quaternion.Euler(0f,180,0f));
		aiPaths[pmm+9] = targetObjects[pmm+9].GetComponent(AIPath);
		aiPaths[pmm+9].canMove = false;
		aiPaths[pmm+9].canSearch = false;
		anims[pmm+9] = targetObjects[pmm+9].GetComponent(CharacterAnimation);
		brains[pmm+9] = targetObjects[pmm+9].GetComponent(Brain);
		targetObjects[pmm+9].tag = "PlayerMeleeMinion" + (1+pmm/2.0);
		
		areaValues[pmm+9] = 42;
		lastHitValues[pmm+9] = 11;
		levels[pmm+9] = 1;
		maxHealths[pmm+9] = unitData.baseHealthNCU[0];
		currentHealths[pmm+9] = 0;
		healthRegens[pmm+9] = unitData.baseHealthRegenNCU[0];
		healthGrowths[pmm+9] = unitData.growthHealthNCU[0];
		healthRegenGrowths[pmm+9] = unitData.growthHealthRegenNCU[0];
		attackDamages[pmm+9] = unitData.baseAttackDamageNCU[0];
		attackDamageGrowths[pmm+9] = unitData.growthAttackDamageNCU[0];
		attackSpeeds[pmm+9] = unitData.baseAttackSpeedNCU[0];
		attackRanges[pmm+9] = unitData.baseAttackRangeNCU[0];
		damageReductions[pmm+9] = unitData.baseDamageReductionNCU[0];
		damageReductionGrowths[pmm+9] = unitData.growthDamageReductionNCU[0];
		movementSpeeds[pmm+9] = unitData.baseMovementSpeedNCU[0];
		movementSpeedGrowths[pmm+9] = unitData.growthMovementSpeedNCU[0];
		aiPaths[pmm+9].speed = movementSpeeds[pmm+9];
	
	}
	//enemy melee minons
	for(var emm : int = 1; emm < 13; emm+=2)	{
		targetObjects[emm+9] = Instantiate(GameObject.FindGameObjectWithTag("MeleeMinion"), holdingAreaPosition, Quaternion.Euler(0f,270f,0f));
		animationUnits[emm+9] = Instantiate(GameObject.FindGameObjectWithTag("AnimationMeleeMinion"), holdingAreaPosition, Quaternion.Euler(0f,180,0f));
		aiPaths[emm+9] = targetObjects[emm+9].GetComponent(AIPath);
		aiPaths[emm+9].canMove = false;
		aiPaths[emm+9].canSearch = false;
		anims[emm+9] = targetObjects[emm+9].GetComponent(CharacterAnimation);
		brains[emm+9] = targetObjects[emm+9].GetComponent(Brain);
		targetObjects[emm+9].tag = "EnemyMeleeMinion" + (1+emm/2);
		
		areaValues[emm+9] = 42;
		lastHitValues[emm+9] = 11;
		levels[emm+9] = 1;
		maxHealths[emm+9] = unitData.baseHealthNCU[0];
		healthRegens[emm+9] = unitData.baseHealthRegenNCU[0];
		currentHealths[emm+9] = 0;
		healthGrowths[emm+9] = unitData.growthHealthNCU[0];
		healthRegenGrowths[emm+9] = unitData.growthHealthRegenNCU[0];
		attackDamages[emm+9] = unitData.baseAttackDamageNCU[0];
		attackDamageGrowths[emm+9] = unitData.growthAttackDamageNCU[0];
		attackSpeeds[emm+9] = unitData.baseAttackSpeedNCU[0];
		attackRanges[emm+9] = unitData.baseAttackRangeNCU[0];
		damageReductions[emm+9] = unitData.baseDamageReductionNCU[0];
		damageReductionGrowths[emm+9] = unitData.growthDamageReductionNCU[0];
		movementSpeeds[emm+9] = unitData.baseMovementSpeedNCU[0];
		movementSpeedGrowths[emm+9] = unitData.growthMovementSpeedNCU[0];
		aiPaths[emm+9].speed = movementSpeeds[emm+9];
	
	}
	//player ranged minions
	for(var prm : int = 0; prm < 12; prm+=2)	{
		targetObjects[prm+21] = Instantiate(GameObject.FindGameObjectWithTag("RangedMinion"), holdingAreaPosition, Quaternion.Euler(0f,90f,0f));
		animationUnits[prm+21] = Instantiate(GameObject.FindGameObjectWithTag("AnimationRangedMinion"), holdingAreaPosition, Quaternion.Euler(0f,180,0f));
		aiPaths[prm+21] = targetObjects[prm+21].GetComponent(AIPath);
		aiPaths[prm+21].canMove = false;
		aiPaths[prm+21].canSearch = false;
		anims[prm+21] = targetObjects[prm+21].GetComponent(CharacterAnimation);
		brains[prm+21] = targetObjects[prm+21].GetComponent(Brain);
		targetObjects[prm+21].tag = "PlayerRangedMinion" + (1+prm/2);
		
		areaValues[prm+21] = 27;
		lastHitValues[prm+21] = 6;
		levels[prm+21] = 1;
		maxHealths[prm+21] = unitData.baseHealthNCU[1];
		healthRegens[prm+9] = unitData.baseHealthRegenNCU[0];
		currentHealths[prm+21] = 0;
		healthGrowths[prm+21] = unitData.growthHealthNCU[1];
		healthRegenGrowths[prm+9] = unitData.growthHealthRegenNCU[0];
		attackDamages[prm+21] = unitData.baseAttackDamageNCU[1];
		attackDamageGrowths[prm+21] = unitData.growthAttackDamageNCU[1];
		attackSpeeds[prm+21] = unitData.baseAttackSpeedNCU[1];
		attackRanges[prm+21] = unitData.baseAttackRangeNCU[1];
		damageReductions[prm+21] = unitData.baseDamageReductionNCU[1];
		damageReductionGrowths[prm+21] = unitData.growthDamageReductionNCU[1];
		movementSpeeds[prm+21] = unitData.baseMovementSpeedNCU[1];
		movementSpeedGrowths[prm+21] = unitData.growthMovementSpeedNCU[1];
		aiPaths[prm+21].speed = movementSpeeds[prm+21];
	
	}
	//enemy ranged minions
	for(var erm : int = 1; erm < 13; erm+=2)	{
		targetObjects[erm+21] = Instantiate(GameObject.FindGameObjectWithTag("RangedMinion"), holdingAreaPosition, Quaternion.Euler(0f,270f,0f));
		animationUnits[erm+21] = Instantiate(GameObject.FindGameObjectWithTag("AnimationRangedMinion"), holdingAreaPosition, Quaternion.Euler(0f,180,0f));
		aiPaths[erm+21] = targetObjects[erm+21].GetComponent(AIPath);
		aiPaths[erm+21].canMove = false;
		aiPaths[erm+21].canSearch = false;
		anims[erm+21] = targetObjects[erm+21].GetComponent(CharacterAnimation);
		brains[erm+21] = targetObjects[erm+21].GetComponent(Brain);
		targetObjects[erm+21].tag = "EnemyRangedMinion" + (1+erm/2);		
		areaValues[erm+21] = 27;
		lastHitValues[erm+21] = 6;
		levels[erm+21] = 1;
		maxHealths[erm+21] = unitData.baseHealthNCU[1];
		healthRegens[erm+9] = unitData.baseHealthRegenNCU[0];
		currentHealths[erm+21] = 0;
		healthGrowths[erm+21] = unitData.growthHealthNCU[1];
		healthRegenGrowths[erm+9] = unitData.growthHealthRegenNCU[0];
		attackDamages[erm+21] = unitData.baseAttackDamageNCU[1];
		attackDamageGrowths[erm+21] = unitData.growthAttackDamageNCU[1];
		attackSpeeds[erm+21] = unitData.baseAttackSpeedNCU[1];
		attackRanges[erm+21] = unitData.baseAttackRangeNCU[1];
		damageReductions[erm+21] = unitData.baseDamageReductionNCU[1];
		damageReductionGrowths[erm+21] = unitData.growthDamageReductionNCU[1];
		movementSpeeds[erm+21] = unitData.baseMovementSpeedNCU[1];
		movementSpeedGrowths[erm+21] = unitData.growthMovementSpeedNCU[1];
		aiPaths[erm+21].speed = movementSpeeds[erm+21];
	
	}

	targetObjects[33] = Instantiate(GameObject.FindGameObjectWithTag("Spider"), holdingAreaPosition, Quaternion.Euler(0f,90,0f));
	animationUnits[33] = Instantiate(GameObject.FindGameObjectWithTag("AnimationSpider"), holdingAreaPosition, Quaternion.Euler(0f,180,0f));
	aiPaths[33] = targetObjects[33].GetComponent(AIPath);
	aiPaths[33].canMove = false;
	aiPaths[33].canSearch = false;
	anims[33] = targetObjects[33].GetComponent(CharacterAnimation);
	brains[33] = targetObjects[33].GetComponent(Brain);
	targetObjects[33].tag = "PlayerSpider";	
	lastHitValues[33] = 10;
	levels[33] = 1;
	maxHealths[33] = unitData.baseHealthNCU[4];
	currentHealths[33] = 0;
	attackDamages[33] = unitData.baseAttackDamageNCU[4];
	attackSpeeds[33] = unitData.baseAttackSpeedNCU[4];
	attackRanges[33] = unitData.baseAttackRangeNCU[4];
	movementSpeeds[33] = unitData.baseMovementSpeedNCU[4];
	aiPaths[33].speed = movementSpeeds[33];

	targetObjects[34] = Instantiate(GameObject.FindGameObjectWithTag("Spider"), holdingAreaPosition, Quaternion.Euler(0f,270,0f));
	animationUnits[34] = Instantiate(GameObject.FindGameObjectWithTag("AnimationSpider"), holdingAreaPosition, Quaternion.Euler(0f,180,0f));
	aiPaths[34] = targetObjects[34].GetComponent(AIPath);
	aiPaths[34].canMove = false;
	aiPaths[34].canSearch = false;
	anims[34] = targetObjects[34].GetComponent(CharacterAnimation);
	brains[34] = targetObjects[34].GetComponent(Brain);
	targetObjects[34].tag = "EnemySpider";	
	lastHitValues[34] = 10;
	levels[34] = 1;
	maxHealths[34] = unitData.baseHealthNCU[4];
	currentHealths[34] = 0;
	attackDamages[34] = unitData.baseAttackDamageNCU[4];
	attackSpeeds[34] = unitData.baseAttackSpeedNCU[4];
	attackRanges[34] = unitData.baseAttackRangeNCU[4];
	movementSpeeds[34] = unitData.baseMovementSpeedNCU[4];
	aiPaths[34].speed = movementSpeeds[34];

	targetObjects[35] = Instantiate(GameObject.FindGameObjectWithTag("Ralph"), holdingAreaPosition, Quaternion.Euler(0f,90f,0f));
	animationUnits[35] = Instantiate(GameObject.FindGameObjectWithTag("AnimationRalph"), holdingAreaPosition, Quaternion.Euler(0f,180,0f));
	targetObjects[35].tag = "PlayerBob";
	targetObjects[35].transform.localScale = Vector3(2,0.75,2);	
	animationUnits[35].transform.localScale = Vector3(2,0.75,2);	
	anims[35] = targetObjects[35].GetComponent(CharacterAnimation);
	targetObjects[35].animation.Stop();
	brains[35] = targetObjects[35].GetComponent(Brain);	
	lastHitValues[35] = 10;
	attackSpeeds[35] = 1;
	attackRanges[35] = 10.0;

	targetObjects[36] = Instantiate(GameObject.FindGameObjectWithTag("Ralph"), holdingAreaPosition, Quaternion.Euler(0f,270f,0f));
	animationUnits[36] = Instantiate(GameObject.FindGameObjectWithTag("AnimationRalph"), holdingAreaPosition, Quaternion.Euler(0f,180,0f));
	targetObjects[36].tag = "EnemyBob";
	targetObjects[36].transform.localScale = Vector3(2,0.75,2);	
	animationUnits[36].transform.localScale = Vector3(2,0.75,2);
	anims[36] = targetObjects[36].GetComponent(CharacterAnimation);
	targetObjects[36].animation.Stop();
	brains[36] = targetObjects[36].GetComponent(Brain);
	lastHitValues[36] = 10;
	attackSpeeds[36] = 1;
	attackRanges[36] = 10.0;

	//get chars
	characters = [ralph, rosalind, leonardo, graviton];
	animationCharacters = [animationRalph, animationRosalind, animationLeonardo, animationGraviton];
	characterSelected = new int[3];
	characterSelected[1] = playerData.characterSelected;
	characterSelected[2] = playerData.opponentSelected;	
	
	//set chars to starting spots
	targetObjects[1] = Instantiate(characters[playerData.characterSelected], respawnPositions[1], Quaternion.Euler(0f,90f,0f));
	targetObjects[2] = Instantiate(characters[playerData.opponentSelected], respawnPositions[2], Quaternion.Euler(0f,270f,0f));
	//anim units
	animationUnits[1] = Instantiate(animationCharacters[playerData.characterSelected], holdingAreaPosition, Quaternion.Euler(0f,90f,0f));
	animationUnits[2] = Instantiate(animationCharacters[playerData.opponentSelected], holdingAreaPosition, Quaternion.Euler(0f,180,0f));
	//tag chars
	targetObjects[1].tag = "Player";
	targetObjects[2].tag = "EnemyCharacter";
	//create character anim vars
	anims[1] = targetObjects[1].GetComponent(CharacterAnimation);
	anims[2] = targetObjects[2].GetComponent(CharacterAnimation);
	anims[1].Idle();
	anims[1].Idle();
	//load all anims for animatioin units
	for(var animCounter : int = 0; animCounter < TOTAL_TARGET_OBJECTS-2; animCounter++) {
		if(animCounter != 5 && animCounter != 6 ) {
			unitAnimations[animCounter] = animationUnits[animCounter].GetComponent(CharacterAnimation);
		}
	}
	//remove poisons
	for(var pCounter : int = 0; pCounter < TOTAL_TARGET_OBJECTS-2; pCounter++) {
		if(pCounter < 3 || pCounter > 6 ) {
			var pSys : Transform = targetObjects[pCounter].transform.Find("Poison");
			pSys.particleSystem.Stop();
			pSys.particleSystem.Clear();
		}
	}
	//paths
	aiPaths[1] = targetObjects[1].GetComponent(AIPath);
	aiPaths[2] = targetObjects[2].GetComponent(AIPath);
	
	//layers
	targetObjects[1].layer = 14;
	
	//get enemy brain
	brains[2] = GameObject.FindGameObjectWithTag("OpponentBrain").GetComponent(Brain);
	
	//set towers,chest,monster to starting spots
	targetObjects[0].transform.position = respawnPositions[0];
	targetObjects[3].transform.position = playerTowerPosition;
	targetObjects[4].transform.position = enemyTowerPosition;
	targetObjects[5].transform.position = playerChestPosition;
	targetObjects[6].transform.position = enemyChestPosition;
		
	
	//reset starting stats
	//player
	//indicates no target
	currentTargets[1] = 38;
	moveTarget[1] = respawnPositions[1];
	
	//starting xp value
	globalValues[1] = 80;
	//level
	levels[1] = 1;
	//stats
	maxHealths[1] = unitData.baseHealth[playerData.characterSelected];
	currentHealths[1] = maxHealths[1];
	healthRegens[1] = unitData.baseHealthRegen[playerData.characterSelected];
	healthGrowths[1] = unitData.growthHealth[playerData.characterSelected];
	healthRegenGrowths[1] = unitData.growthHealthRegen[playerData.characterSelected];
	maxResources[1] = unitData.baseResource[playerData.characterSelected];
	currentResources[1] = maxResources[1];
	resourceRegens[1] = unitData.baseResourceRegen[playerData.characterSelected];
	resourceGrowths[1] = unitData.growthResource[playerData.characterSelected];
	resourceRegenGrowths[1] = unitData.growthResourceRegen[playerData.characterSelected];
	attackDamages[1] = unitData.baseAttackDamage[playerData.characterSelected];
	attackDamageGrowths[1] = unitData.growthAttackDamage[playerData.characterSelected];
	attackSpeeds[1] = unitData.baseAttackSpeed[playerData.characterSelected];
	attackRanges[1] = unitData.baseAttackRange[playerData.characterSelected];
	damageReductions[1] = unitData.baseDamageReduction[playerData.characterSelected];
	damageReductionGrowths[1] = unitData.growthDamageReduction[playerData.characterSelected];
	movementSpeeds[1] = unitData.baseMovementSpeed[playerData.characterSelected];
	movementSpeedGrowths[1] = unitData.growthMovementSpeed[playerData.characterSelected];
	aiPaths[1].speed = movementSpeeds[1];
	
	//opponent
	currentTargets[2] = 38;
	globalValues[2] = 80;
	levels[2] = 1;
	maxHealths[2] = unitData.baseHealth[playerData.opponentSelected];
	currentHealths[2] = maxHealths[2];
	healthRegens[2] = unitData.baseHealthRegen[playerData.opponentSelected];
	healthGrowths[2] = unitData.growthHealth[playerData.opponentSelected];
	healthRegenGrowths[2] = unitData.growthHealthRegen[playerData.opponentSelected];
	maxResources[2] = unitData.baseResource[playerData.opponentSelected];
	currentResources[2]= maxResources[2];
	resourceRegens[2] = unitData.baseResourceRegen[playerData.opponentSelected];
	resourceGrowths[2] = unitData.growthResource[playerData.opponentSelected];
	resourceRegenGrowths[2] = unitData.growthResourceRegen[playerData.opponentSelected];
	attackDamages[2] = unitData.baseAttackDamage[playerData.opponentSelected];
	attackDamageGrowths[2] = unitData.growthAttackDamage[playerData.opponentSelected];
	attackSpeeds[2] = unitData.baseAttackSpeed[playerData.opponentSelected];
	attackRanges[2] = unitData.baseAttackRange[playerData.opponentSelected];
	damageReductions[2] = unitData.baseDamageReduction[playerData.opponentSelected];
	damageReductionGrowths[2] = unitData.growthDamageReduction[playerData.opponentSelected];
	movementSpeeds[2] = unitData.baseMovementSpeed[playerData.opponentSelected];
	movementSpeedGrowths[2] = unitData.growthMovementSpeed[playerData.opponentSelected];
	aiPaths[2].speed = movementSpeeds[2];
	
	//monster
	lastHitValues[0] = 130;
	levels[0] = 1;
	maxHealths[0] = unitData.baseHealthNCU[3];
	currentHealths[0] = maxHealths[0];
	healthRegens[0] = unitData.baseHealthRegenNCU[3];
	healthRegenGrowths[0] = unitData.growthHealthRegenNCU[3];
	healthGrowths[0] = unitData.growthHealthNCU[3];
	attackDamages[0] = unitData.baseAttackDamageNCU[3];
	attackDamageGrowths[0] = unitData.growthAttackDamageNCU[3];
	attackSpeeds[0] = unitData.baseAttackSpeedNCU[3];
	attackRanges[0] = unitData.baseAttackRangeNCU[3];
	damageReductions[0] = unitData.baseDamageReductionNCU[3];
	damageReductionGrowths[0] = unitData.growthDamageReductionNCU[3];
	movementSpeeds[0] = unitData.baseMovementSpeedNCU[3];
	movementSpeedGrowths[0] = unitData.growthMovementSpeedNCU[3];
	aiPaths[0].speed = movementSpeeds[0];
	
	//towers
	//player tower
	globalValues[3] = 500;
	areaValues[3] = 25;
	lastHitValues[3] = 25;
	maxHealths[3] = unitData.towerHealth;
	currentHealths[3] = maxHealths[3];
	attackDamages[3] = unitData.towerBaseAttackDamage;
	attackSpeeds[3] = unitData.towerAttackSpeed;
	attackRanges[3] = unitData.towerAttackRange;
	damageReductions[3] = unitData.towerDamageReduction;
	//enemy tower
	globalValues[4] = 500;
	areaValues[4] = 25;
	lastHitValues[4] = 25;
	maxHealths[4] = unitData.towerHealth;
	currentHealths[4] = maxHealths[4];
	attackDamages[4] = unitData.towerBaseAttackDamage;
	attackSpeeds[4] = unitData.towerAttackSpeed;
	attackRanges[4] = unitData.towerAttackRange;
	damageReductions[4] = unitData.towerDamageReduction;
	
	//chests
	//player chest
	maxHealths[5] = unitData.chestHealth;
	currentHealths[5] = maxHealths[5];
	damageReductions[5] = unitData.chestDamageReduction;
	//enemy chest
	maxHealths[6] = unitData.chestHealth;
	currentHealths[6] = maxHealths[6];
	damageReductions[6] = unitData.chestDamageReduction;
	
	//player guardian
	globalValues[7] = 10;
	areaValues[7] = 20;
	lastHitValues[7] = 50;
	levels[7] = 1;
	maxHealths[7] = unitData.baseHealthNCU[2];
	currentHealths[7] = maxHealths[7];
	healthRegens[7] = unitData.baseHealthRegenNCU[2];
	healthRegenGrowths[7] = unitData.growthHealthRegenNCU[2];
	healthGrowths[7] = unitData.growthHealthNCU[2];
	attackDamages[7] = unitData.baseAttackDamageNCU[2];
	attackDamageGrowths[7] = unitData.growthAttackDamageNCU[2];
	attackSpeeds[7] = unitData.baseAttackSpeedNCU[2];
	attackRanges[7] = unitData.baseAttackRangeNCU[2];
	damageReductions[7] = unitData.baseDamageReductionNCU[2];
	damageReductionGrowths[7] = unitData.growthDamageReductionNCU[2];
	movementSpeeds[7] = unitData.baseMovementSpeedNCU[2];
	movementSpeedGrowths[7] = unitData.growthMovementSpeedNCU[2];
	aiPaths[7].speed = movementSpeeds[7];
	
	//enemy guardian
	globalValues[8] = 10;
	areaValues[8] = 20;
	lastHitValues[8] = 50;
	levels[8] = 1;
	maxHealths[8] = unitData.baseHealthNCU[2];
	currentHealths[8] = maxHealths[8];
	healthRegens[8] = unitData.baseHealthRegenNCU[2];
	healthRegenGrowths[8] = unitData.growthHealthRegenNCU[2];
	healthGrowths[8] = unitData.growthHealthNCU[2];
	attackDamages[8] = unitData.baseAttackDamageNCU[2];
	attackDamageGrowths[8] = unitData.growthAttackDamageNCU[2];
	attackSpeeds[8] = unitData.baseAttackSpeedNCU[2];
	attackRanges[8] = unitData.baseAttackRangeNCU[2];
	damageReductions[8] = unitData.baseDamageReductionNCU[2];
	damageReductionGrowths[8] = unitData.growthDamageReductionNCU[2];
	movementSpeeds[8] = unitData.baseMovementSpeedNCU[2];
	movementSpeedGrowths[8] = unitData.growthMovementSpeedNCU[2];
	aiPaths[8].speed = movementSpeeds[8];	
	
	//particles
	//set flames and fog
	flames = GameObject.FindGameObjectsWithTag("Flame");
	fogs = GameObject.FindGameObjectsWithTag("FreezingFog");
	blackholes = GameObject.FindGameObjectsWithTag("BlackHole");
	gravityfields = GameObject.FindGameObjectsWithTag("GravityField");	
	
	for(var flame in flames)	{		flame.GetComponent(Flame).Connect();	}	
	for(var fog in fogs)	{		fog.GetComponent(FreezingFog).Connect();	}	
	for(var blackhole in blackholes)	{		blackhole.GetComponent(BlackHole).Connect();	}
	for(var gravityfield in gravityfields)	{		gravityfield.GetComponent(GravityField).Connect();	}
	if(characterSelected[1] == 3) {		targetObjects[1].Find("Pull").Find("PullBox").collider.enabled = false;	}
	if(characterSelected[2] == 3) {		targetObjects[2].Find("Pull").Find("PullBox").collider.enabled = false;	}
	
	//bushes
	var gems : GameObject = GameObject.Find("Gems");
	var redGem : Transform = gems.transform.Find("RedGem");
	var blueGem : Transform = gems.transform.Find("BlueGem");
	var purpleGem : Transform = gems.transform.Find("PurpleGem");
	gems.transform.position.y = -96;	
	
	switch(playerData.gems[playerData.challengeSelected]) {
	case 0:
		redGem.localPosition = Vector3(100,0,0);
		blueGem.localPosition = Vector3(100,0,0);
		purpleGem.localPosition = Vector3(100,0,0);
		break;
	case 1:
		redGem.rotation = Quaternion.Euler(270, 80, 0);
		redGem.localPosition = Vector3(0,0,10);
		blueGem.localPosition = Vector3(100,0,0);
		purpleGem.localPosition= Vector3(100,0,0);
		break;
	case 2:
		redGem.rotation = Quaternion.Euler(270, 9, 0);
		blueGem.rotation = Quaternion.Euler(270, 85, 0);
		redGem.localPosition = Vector3(-2.5,0,10);
		blueGem.localPosition = Vector3(2.5,0,10);
		purpleGem.localPosition = Vector3(100,0,0);
		break;
	case 3:
		redGem.rotation = Quaternion.Euler(270, 275, 0);
		blueGem.rotation = Quaternion.Euler(270, 85, 0);
		purpleGem.rotation = Quaternion.Euler(270, 90, 0);
		redGem.localPosition = Vector3(-3.5,0,10);
		blueGem.localPosition = Vector3(0,0,10);
		purpleGem.localPosition = Vector3(3.5,0,10);
		break;
	}
	redGem.GetComponent(GemSpinner).isSpinning = false;
	blueGem.GetComponent(GemSpinner).isSpinning = false;
	purpleGem.GetComponent(GemSpinner).isSpinning = false;
	
	var stars : GameObject = GameObject.Find("Stars");
	stars.transform.position.y = -100;
	stars.transform.position.z = 12;
	stars.Find("Twinkle").particleSystem.Pause();
	//photos
//	stars.Find("Twinkle").particleSystem.Stop();
//	stars.Find("Twinkle").particleSystem.Clear();
//	stars.Find("Main").particleSystem.Stop();
//	stars.Find("Main").particleSystem.Clear();

	levelUpSparkle[1] = targetObjects[1].transform.Find("LevelUpSparkle");
	levelUpSparkle[2] = targetObjects[2].transform.Find("LevelUpSparkle");
	
	//bushes
	var bushes : GameObject[] = GameObject.FindGameObjectsWithTag("Bush");
	for(var bush in bushes) { 	bush.renderer.material.SetColor("_Color", Color.white); bush.GetComponent(Bush).Connect(); }
	
	//sightBouncers
	var clickTriggers : GameObject[] = GameObject.FindGameObjectsWithTag("ClickTrigger");
	for(var trigger in clickTriggers) { trigger.tag = trigger.transform.parent.tag; }	
	
	//ai basic attacks
	basicAttacks = new AIBasicAttack[37];
	for(var i : int = 0; i < 5; i++) {	basicAttacks[i] = targetObjects[i].GetComponent(AIBasicAttack);	basicAttacks[i].Connect();	}
	for(i = 7; i < 37; i++) {	basicAttacks[i] = targetObjects[i].GetComponent(AIBasicAttack);	basicAttacks[i].Connect();	}
	
	//ranged basic attack hit particles
	if(characterSelected[1] != 1) { targetObjects[1].transform.Find("Basic Attack Hit").name = targetObjects[1].tag + " Basic Attack Hit"; }
	if(characterSelected[2] != 1) { targetObjects[2].transform.Find("Basic Attack Hit").name = targetObjects[2].tag + " Basic Attack Hit"; }
	for(i = 3; i < 5; i++) { targetObjects[i].transform.Find("Basic Attack Hit").name = targetObjects[i].tag + " Basic Attack Hit"; }
	for(i = 7; i < 9; i++) { targetObjects[i].transform.Find("Basic Attack Hit").name = targetObjects[i].tag + " Basic Attack Hit"; }
	for(i = 21; i < 33; i++) { targetObjects[i].transform.Find("Basic Attack Hit").name = targetObjects[i].tag + " Basic Attack Hit"; }
	
	ralph.animation.Stop();
	rosalind.animation.Stop();
	leonardo.animation.Stop();
	gTempAnim.enabled = false;
	
	//trash collection
	targetObjects[38] = Instantiate(GameObject.FindGameObjectWithTag("Ralph"), Vector3(1000,0,1000), Quaternion.Euler(0,115,0));
	targetObjects[38].name = "TrashMan";
	targetObjects[38].animation.Stop();
	globalValues[38] = 0;
	areaValues[38] = 0;
	lastHitValues[38] = 0;
	levels[38] = 1;
	maxHealths[38] = unitData.baseHealthNCU[2];
	currentHealths[38] = maxHealths[38];
	healthRegens[38] = unitData.baseHealthRegenNCU[2];
	healthRegenGrowths[38] = unitData.growthHealthRegenNCU[2];
	healthGrowths[38] = unitData.growthHealthNCU[2];
	attackDamages[38] = unitData.baseAttackDamageNCU[2];
	attackDamageGrowths[38] = unitData.growthAttackDamageNCU[2];
	attackSpeeds[38] = unitData.baseAttackSpeedNCU[2];
	attackRanges[38] = unitData.baseAttackRangeNCU[2];
	damageReductions[38] = unitData.baseDamageReductionNCU[2];
	damageReductionGrowths[38] = unitData.growthDamageReductionNCU[2];
	movementSpeeds[38] = unitData.baseMovementSpeedNCU[2];
	movementSpeedGrowths[38] = unitData.growthMovementSpeedNCU[2];	
	aiPaths[38] = targetObjects[38].GetComponent(AIPath);
	
	astarPath.Scan();
	unitData.UpdateTooltips();
}