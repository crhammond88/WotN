#pragma strict

var brainOn : boolean;
var brainType : int;
var brainFunctions : Function[];
var originalTarget : int;

//id hash used in gameController vars
var idNumber : int;
//identifiers
var teamNumber : int;
var allyNumber : int;
var towerPos : Vector3;
var guardianPos : Vector3;
var monsterPos : Vector3;
var lookRotation : Quaternion;

//spawn points
var monsterSpawn : Transform;
var playerGuardianSpawn : Transform;
var enemyGuardianSpawn : Transform;
var guardianSpawn : Transform;
var spiderPathObject : GameObject;
var spiderPath : Transform;
static var opponentPathObject : GameObject;
static var opponentPath : Transform;
	
//hashing
private var unitNameToNumber : Dictionary.<String,int> = new Dictionary.<String,int>();

private var gameController : GameController;
private var unitData : UnitData;
private var playerData : PlayerData;
private var opponentSkills : OpponentSkills;

function Awake () {
	unitData = GameObject.FindGameObjectWithTag("Data").GetComponent(UnitData);
	playerData = GameObject.FindGameObjectWithTag("Data").GetComponent(PlayerData);
		
	brainOn = false;
	brainFunctions = new Function[7];
	brainFunctions[0] = MonsterBrain;
	brainFunctions[1] = OpponentBrain;
	brainFunctions[2] = TowerBrain;
	brainFunctions[3] = GuardianBrain;
	brainFunctions[4] = MinionBrain;
	brainFunctions[5] = SpiderBrain;
	brainFunctions[6] = BobBrain;	
}

function Start () {
	StartChecker();
}

function StartChecker () {
	for(;;) {
		var gameCon : GameObject = GameObject.FindGameObjectWithTag("GameController");
		if(gameCon != null) {
			gameController = GameObject.FindGameObjectWithTag("GameController").GetComponent(GameController); 
			opponentSkills = GameObject.FindGameObjectWithTag("GameController").GetComponent(OpponentSkills);	
			StartBrain(); 
			break; 
		}
		else { yield; }
	}
}

function StartBrain (){
	//hashing
	for(var i : int = 0; i < 37; i++)	{
		unitNameToNumber[unitData.unitNames[i]] = i;
	}
	//enemy char is controlled by OppoonentBrain
	unitNameToNumber["OpponentBrain"] = 2;
	unitNameToNumber["EnemyCharacter"] = 38;
	//assign prefabs dead keys
	unitNameToNumber["Guardian"] = 37;
	unitNameToNumber["MeleeMinion"] = 38;
	unitNameToNumber["RangedMinion"] = 39;
	unitNameToNumber["Spider"] = 40;
	unitNameToNumber["Ralph"] = 41;	
	
	//identify the attached body and save the brain type and hash#
	var tagString : String = this.gameObject.tag;	
	idNumber = unitNameToNumber[tagString];
	
	if(idNumber < 37)	{
		if(idNumber == 0)		{
			brainType = 0;
		}
		else if(idNumber == 2)		{
			brainType = 1;
			opponentPathObject = new GameObject("OpponentPath");
			opponentPath = opponentPathObject.transform;
			if(gameController.characterSelected[2] == 1) { 	
				//save ms boost
				opponentSkills.msBonus = gameController.movementSpeeds[2] * (0.05);	
				//add movespeed boost
				gameController.movementSpeeds[2] += opponentSkills.msBonus;
				gameController.aiPaths[2].speed += opponentSkills.msBonus;
				opponentSkills.PlayParticle(gameController.targetObjects[2].transform.Find("Grace"), 0.9, false);
			}			
			LevelUpSkills();
		}
		else if(idNumber > 2 && idNumber < 5)		{
			brainType = 2;
		}
		else if(idNumber > 6 && idNumber < 9)		{
			brainType = 3;
			enemyGuardianSpawn = GameObject.FindGameObjectWithTag("EnemyGuardianSpawn").transform;
			playerGuardianSpawn = GameObject.FindGameObjectWithTag("PlayerGuardianSpawn").transform;
		}
		else if(idNumber > 8 && idNumber < 33)		{
			brainType = 4;
		}
		else if(idNumber == 33 || idNumber == 34)		{
			brainType = 5;
			spiderPathObject = new GameObject("SpiderPath");
			spiderPath = spiderPathObject.transform;
		}
		else if(idNumber == 35 || idNumber == 36)		{
			brainType = 6;
		}

		//if im the monster
		if(idNumber == 0)		{
			monsterPos = Vector3(0,0,35);
			lookRotation = Quaternion.Euler(0f,180f,0f);
			monsterSpawn = GameObject.FindGameObjectWithTag("MonsterSpawn").transform;
		}
		//if im on enemy's team
		else if(idNumber % 2 == 0)		{
			teamNumber = 0;
			allyNumber = 2;
			towerPos = gameController.enemyTowerPosition;
			guardianPos = gameController.enemyGuardianPosition;
			guardianSpawn = enemyGuardianSpawn;
			lookRotation = Quaternion.Euler(0f,270f,0f);
		}
		//if im on player's team
		else		{
			teamNumber = 1;
			allyNumber = 1;
			towerPos = gameController.playerTowerPosition;
			guardianPos = gameController.playerGuardianPosition;
			guardianSpawn = playerGuardianSpawn;
			lookRotation = Quaternion.Euler(0f,90f,0f);
		}	
	}	
}

function FixedUpdate () {
	if(brainOn && !gameController.paused)	{	brainFunctions[brainType]();	}
}

function RefreshBrain () {
	gameController = GameObject.FindGameObjectWithTag("GameController").GetComponent(GameController);
}

function MonsterBrain ()	{
	//if i dont have a target
	if(!gameController.seekingTarget[idNumber])	{
		//if not home
		if(Vector3.Distance(gameController.targetObjects[idNumber].transform.position, monsterPos) > 1.00f)		{
			//go home
			gameController.moveTarget[idNumber] = monsterPos;
			gameController.aiPaths[idNumber].target = monsterSpawn;
			gameController.moving[idNumber] = true;
			gameController.aiPaths[idNumber].canSearch = true;
			gameController.aiPaths[idNumber].canMove = true;
			gameController.aiPaths[idNumber].SearchPath();
			gameController.currentHealths[idNumber] = gameController.maxHealths[idNumber];
		}
		//at home
		else		{
			//chill
			gameController.anims[idNumber].Idle();
			gameController.moving[idNumber] = false;			
			//look towards the likely approach of my enemies
			gameController.targetObjects[idNumber].transform.rotation = lookRotation;
			gameController.currentHealths[idNumber] = gameController.maxHealths[idNumber];			
			gameController.aiPaths[idNumber].canMove = false;
			gameController.aiPaths[idNumber].canSearch = false;
		}
		
	}
	//if i do have a target
	else	{
		//check to see if it's still in aggression radius
		var targetDistance : float = Vector3.Distance(monsterPos, gameController.targetObjects[gameController.currentTargets[idNumber]].collider.ClosestPointOnBounds(monsterPos));
		if(targetDistance > 20)		{
			gameController.monsterAggro[gameController.currentTargets[idNumber]] = false;
			gameController.inRange[idNumber] = false;
			gameController.seekingTarget[idNumber] = false;
			for(var i : int = 0; i < gameController.TOTAL_TARGET_OBJECTS; i++)			{
				if(gameController.monsterAggro[i])				{
					gameController.currentTargets[idNumber] = i;
					//attack it
					gameController.EngageTarget(idNumber);
					break;
				} 
			}
		}
	}
}

function OpponentBrain () {
	var difficulty : int = playerData.difficultySelected;
	var attackRange : float = gameController.attackRanges[2];
	var xLimit : float = -13 - attackRange;
	var playerMinionAlive : boolean = false;
	var minionAlive : boolean = false;			
	var angryUnits : int;
	var angryRunLimit : int = 2;
	var chestAttacked : boolean = false;
	var skillDelay : int = 4;
	if(gameController.playerGuardianDown) { xLimit = -100; }
	else if(gameController.playerTowerDown) { xLimit = -47 - attackRange; }
	if(gameController.currentTargets[1] == idNumber) { angryUnits += 1; }
	if(gameController.currentTargets[0] == idNumber) { angryUnits += 1; }
	for(var i : int = 9; i < 32; i+=2)		{
		if(gameController.currentHealths[i] >= 1) { 
		  	if(gameController.targetObjects[i].transform.position.x > xLimit) {		playerMinionAlive = true;	}
			if(gameController.currentTargets[i] == idNumber) { angryUnits += 1; }
			else if(gameController.currentTargets[i] == 6 && gameController.inRange[i]) { chestAttacked = true; }
		}
	}
	for(i = 10; i < 32; i+=2)		{
		if(gameController.currentHealths[i] >= 1) {
			minionAlive = true;
			if(playerMinionAlive && difficulty > 0 && !gameController.playerGuardianDown) { 
				var newLimit : float;
				if(gameController.enemyGuardianDown) {		newLimit = gameController.targetObjects[i].transform.position.x - gameController.attackRanges[2] - 3; 			}
				else if(gameController.enemyTowerDown) { newLimit = 64 - attackRange; }
				else { newLimit = 30 - attackRange; }
				if(newLimit < xLimit) { xLimit = newLimit; }
			}
			break;
		}
	}	
	if(playerMinionAlive && !minionAlive && difficulty > 0) {		
		if(gameController.enemyGuardianDown) { xLimit = 59 - attackRange; }
		else if(gameController.enemyTowerDown) { xLimit = 64 - attackRange; }
		else { xLimit = 30 - attackRange; }
	}
	
	if(xLimit > 64) { xLimit = 64;	}
	
	switch(difficulty) {
	case 0:
		xLimit -= 12;
		angryRunLimit = 6;		
		break;
	case 1:
		xLimit -= 8;
		angryRunLimit = 4;
		skillDelay = 3;
		break;	
	case 2:
		xLimit -= 4;
		angryRunLimit = 3;
		skillDelay = 2;
		break;
	}
	
	//
	if(gameController.currentHealths[2] >= 1 && !gameController.frozen[2] && !gameController.stunned[2] && !opponentSkills.seeking) {
		var playerAlive : boolean = gameController.currentHealths[1] >= 1;
		var myHealthPercent : float = gameController.currentHealths[2]/gameController.maxHealths[2];
		var playerHealthPercent : float = gameController.currentHealths[1]/gameController.maxHealths[1];
		var targetHealthPercent : float = gameController.currentHealths[gameController.currentTargets[idNumber]]/gameController.maxHealths[gameController.currentTargets[idNumber]];
		var endRange : float = 70 - gameController.attackRanges[1];
		var canAttack : boolean = ((myHealthPercent > 0.649 || ((myHealthPercent - playerHealthPercent) > 0.1 && gameController.currentHealths[1] >= 1) 
			|| (myHealthPercent > 0.3 && gameController.targetObjects[2].transform.position.x < 70) || gameController.currentTargets[idNumber] == 0
			//|| (myHealthPercent > 0.4 && (gameController.seekingTarget[4] || gameController.seekingTarget[8]))
			|| (gameController.currentHealths[1]/gameController.maxHealths[1] < 0.35 && gameController.currentHealths[1] >= 1 && gameController.targetObjects[1].transform.position.x > xLimit))
			&& (angryUnits < angryRunLimit));
		var inEndRange : boolean = (gameController.enemyGuardianDown && gameController.targetObjects[2].transform.position.x > endRange);
		var isLeoUlted : boolean = gameController.characterSelected[2] == 2 && gameController.skillsExecuting[2,3];
		var defendingChest : boolean = chestAttacked && gameController.currentTargets[idNumber] > 2;
		var myLevel : int = gameController.levels[idNumber];
		if(canAttack || inEndRange || targetHealthPercent < 0.1	|| (gameController.enemyTowerDown && gameController.targetObjects[2].transform.position.x > 73)) {
			if(!gameController.seekingTarget[idNumber])	{		
				var foundTarget : boolean = false;				
				if(playerAlive)		{						
					//if player behind xLimit or chest attacked
					if(gameController.targetObjects[1].transform.position.x < xLimit+3 && !(gameController.currentTargets[4] == idNumber || gameController.currentTargets[8] == idNumber)
						|| (chestAttacked && difficulty > 0)) {		//&& (angryUnits >= angryRunLimit || (chestAttacked && !canAttack))			
						if(gameController.currentTargets[1] == 0 && !chestAttacked) {
							foundTarget = true;
							if(gameController.currentHealths[0]/gameController.maxHealths[0] < 0.2 && difficulty > 1) { gameController.currentTargets[idNumber] = 0;	}
							else { gameController.currentTargets[idNumber] = 1;	}
							gameController.EngageTarget(idNumber);
						}
						if(!foundTarget && difficulty > 0) {	foundTarget = CheckForMinions(xLimit, difficulty);		}
						if(!foundTarget && difficulty > 1) {	foundTarget = CheckForObjective(minionAlive, myHealthPercent, difficulty, isLeoUlted, playerAlive);		}
					}			
					else {
						//attack player
						foundTarget = true;
						gameController.currentTargets[idNumber] = 1;
						gameController.EngageTarget(idNumber);
					}		
				}
				else {
					foundTarget = CheckForMinions(xLimit, difficulty);					
					if(!foundTarget) {	foundTarget = CheckForMonster(myHealthPercent, difficulty);		}				
					if(!foundTarget) {	foundTarget = CheckForObjective(minionAlive, myHealthPercent, difficulty, isLeoUlted, playerAlive);	}			
				}				
				if(!foundTarget) {	GoHome(difficulty, xLimit, angryUnits > 0);	}
			}
			else if(isLeoUlted) {
				//leo ult, deny retreat conditions
			}
			else if(gameController.currentTargets[idNumber] == 1 && playerAlive) {
				if((gameController.targetObjects[1].transform.position.x < xLimit && playerHealthPercent > 0.1)
					|| gameController.targetObjects[1].transform.position.x < xLimit-5 || (chestAttacked && gameController.currentTargets[1] != 6 && playerHealthPercent > 0.35)) {	// || ((chestAttacked && gameController.currentTargets[1] != 6) && playerHealthPercent > 0.4)			
					Disengage();
				}
			}
			else if(gameController.currentTargets[idNumber] != 1 && gameController.currentTargets[idNumber] != 0 && gameController.targetObjects[1].transform.position.x > xLimit 
				&& playerAlive && !(gameController.currentTargets[idNumber] == 5 && gameController.currentHealths[5]/gameController.maxHealths[5] < 0.25)	
				&&!(gameController.currentTargets[idNumber] == 3 && gameController.currentHealths[3]/gameController.maxHealths[3] < 0.25)	
				&& !(inEndRange && (angryUnits >= angryRunLimit || !canAttack)) && !(defendingChest)) {
					Disengage();
					//attack player
					gameController.currentTargets[idNumber] = 1;
					gameController.EngageTarget(idNumber);
			}
			else if(gameController.currentTargets[idNumber] == 3 && ((gameController.currentTargets[3] == idNumber) || 
				(playerAlive && gameController.targetObjects[1].transform.position.x > xLimit))
				&& !(gameController.currentHealths[3]/gameController.maxHealths[3] < 0.15 || (!playerAlive && myLevel > 6))) {
				Disengage();			
			}
			else if(gameController.currentTargets[idNumber] == 7 && ((gameController.currentTargets[7] == idNumber) || 
				(playerAlive && gameController.targetObjects[1].transform.position.x > xLimit))
				&& !(gameController.currentHealths[7]/gameController.maxHealths[7] < 0.15 || (!playerAlive && myLevel > 9))) {
				Disengage();		
			}
			else if(gameController.currentTargets[idNumber] == 0 && gameController.currentHealths[1] >= 1 && gameController.targetObjects[1].transform.position.x > -15 
				&& gameController.currentHealths[0]/gameController.maxHealths[0] > (0.2 + 0.02*gameController.levels[2]) && difficulty > 2) {
				Disengage();
			}
			else if(gameController.currentTargets[1] == 0 && gameController.currentHealths[1] >= 1
				&& !(gameController.currentTargets[idNumber] == 1 || gameController.currentTargets[idNumber] == 0) && difficulty > 1 
				&& Vector3.Distance(gameController.targetObjects[1].transform.position, gameController.targetObjects[0].transform.position) < 16) {
				Disengage();
				if(gameController.currentHealths[0]/gameController.maxHealths[0] < 0.2 && gameController.currentHealths[0] >= 1) { gameController.currentTargets[idNumber] = 0;	}
				else { gameController.currentTargets[idNumber] = 1;	}
				gameController.EngageTarget(idNumber);
			}
			else if(gameController.currentHealths[gameController.currentTargets[idNumber]] < 1) {
				GoHome(difficulty, xLimit, angryUnits > 0);
			}			
		}
		else {
			var canTele : boolean = true;
			if(angryUnits > 0) { canTele = false; }
			GoHome(difficulty, xLimit, canTele);
		}	
		
		
		if((difficulty > 2 || Time.time % skillDelay == 0) && !(defendingChest)) {
			switch(gameController.characterSelected[2]) {
			case 0:
				RalphBrain(xLimit, difficulty);
				break;
			case 1:
				RosalindBrain(xLimit, difficulty);
				break;
			case 2:
				LeonardoBrain(xLimit, difficulty);
				break;
			case 3:
				GravitonBrain(xLimit, difficulty);
				break;
			}
		}
	}
}

function CheckForMinions (xLimit : float, difficulty : int) {
	var canAttack : boolean;
	var lowestHealth : int;
	var minionNumber : int;
	for(var i : int = 9; i < 32; i+=2)	{
		if(gameController.currentHealths[i] >= 1 && ((gameController.targetObjects[i].transform.position.x > xLimit 
			|| (gameController.targetObjects[i].transform.position.x > xLimit-3 && gameController.currentHealths[i]/gameController.maxHealths[i] < 0.15))
			|| gameController.currentTargets[4] == i || gameController.currentTargets[8] == i)) {// || gameController.currentTargets[i] == 5 || gameController.currentTargets[i] == 7 || gameController.currentTargets[i] == 3				
			if(!canAttack) {
				canAttack = true;	minionNumber = i;	lowestHealth = gameController.currentHealths[i];
				if(difficulty < 3) { break; }				
			}
			else if(gameController.currentHealths[i] < lowestHealth){
				minionNumber = i;	lowestHealth = gameController.currentHealths[i];
			}
		}
	}
	if(canAttack) {
		gameController.currentTargets[idNumber] = minionNumber;
		gameController.EngageTarget(idNumber);
		return true;
	}
	return false;
}

function CheckForMonster (myHealthPercent : float, difficulty : int) {
	if(gameController.currentHealths[0] >= 1 && gameController.levels[2] > 4 && myHealthPercent > 0.7 && difficulty > 1 
		&& (gameController.characterSelected[idNumber] < 2 || gameController.currentResources[idNumber]/gameController.maxResources[idNumber] > 0.3))		{
		gameController.currentTargets[idNumber] = 0;
		gameController.EngageTarget(idNumber);
		return true;
	}	
	return false;
}

function CheckForObjective (minionAlive : boolean, myHealthPercent : float, difficulty : int, isLeoUlted : boolean, playerAlive : boolean) {
	var myLevel : int = gameController.levels[2];
	var divePercent : float = 0.1 + gameController.levels[idNumber]/50.0;
	if(!playerAlive) { divePercent *= 1.5; }
	
	if(!gameController.playerTowerDown && (myHealthPercent > 0.4 
		&& ((minionAlive && gameController.currentTargets[3] != 2 && gameController.currentTargets[3] != 38 && gameController.inRange[3]) 
		|| ((gameController.currentHealths[3]/gameController.maxHealths[3] < divePercent && (gameController.characterSelected[2] != 2 || (gameController.characterSelected[2] == 2 
		&& !gameController.cooldowns[2,3] && gameController.stances[2] != 2 && gameController.stances[2] != 0))) 
		|| gameController.currentHealths[3]/gameController.maxHealths[3] < divePercent - 0.1)) || isLeoUlted))	{
		gameController.currentTargets[idNumber] = 3;
		gameController.EngageTarget(idNumber);
		return true;
	}
	else if(gameController.playerTowerDown && (!gameController.playerGuardianDown && myHealthPercent > 0.4 
		&& ((minionAlive && gameController.currentTargets[7] != 2 && gameController.currentTargets[7] != 38 && gameController.inRange[7]) 
		|| gameController.currentHealths[7]/gameController.maxHealths[7] < divePercent) || isLeoUlted))	{
		gameController.currentTargets[idNumber] = 7;
		gameController.EngageTarget(idNumber);
		return true;
	}
	else if(gameController.playerGuardianDown)		{
		gameController.currentTargets[idNumber] = 5;
		gameController.EngageTarget(idNumber);
		return true;
	}
	return false;
}

function Disengage () {
	gameController.StopBasicAttack(idNumber);
	gameController.inRange[idNumber] = false;
	gameController.seekingTarget[idNumber] = false;	
}

function GoHome (difficulty : int, xLimit : float) { GoHome(difficulty, xLimit, true); }
function GoHome (difficulty : int, xLimit : float, canTeleport : boolean) {
	Disengage();
	
	var homeSpot : Vector3 = Vector3(75,0.05,0);
	var minionsClear : boolean = true;
	var healPercent : float = 0.65;
	
	switch(difficulty) {
	case 0:
		healPercent = 0.1;
		break;
	case 1:
		healPercent = 0.3;
		break;
	case 2:
		healPercent = 0.5;
		break;
	}
	
	//find current wait spot
	if(!(gameController.currentHealths[2]/gameController.maxHealths[2] < healPercent || gameController.enemyGuardianDown)) {
//							var zRLoc : float = 3;
//							if(Random.value > .5) { zRLoc = -3; }
		if(gameController.enemyTowerDown) {	homeSpot = Vector3(64,0.05,5);	}
		else { homeSpot = Vector3(30,0.05,5); }
		
		var playerLimitDistance : float = xLimit - gameController.targetObjects[1].transform.position.x;
		if(difficulty > 2 && (gameController.currentHealths[1] < 1 || playerLimitDistance > gameController.attackRanges[1])) { homeSpot = Vector3(xLimit+gameController.attackRanges[idNumber]+10, 0.05, 5); }
		
		switch(difficulty) {
		case 0:
			homeSpot.x -= 15;
			break;
		case 1:
			homeSpot.x -= 10;
			break;
		case 2:
			homeSpot.x -= 5;
			break;
		}
	}	
	
	if(canTeleport && homeSpot.x > 73) {
		for(var i : int = 3; i < 32; i+=2)		{
			if(Vector3.Distance(gameController.targetObjects[idNumber].transform.position, gameController.targetObjects[i].transform.position) < 19) {
				minionsClear = false;
				break;
			}
		}
	}
	//teleport to base if needed;
	if(canTeleport && homeSpot.x > 73 && Vector3.Distance(gameController.targetObjects[idNumber].transform.position, homeSpot) > 20 && !gameController.teleporting[2]
		&& Vector3.Distance(gameController.targetObjects[idNumber].transform.position, gameController.targetObjects[1].transform.position) > 26 && minionsClear)		{		
		opponentPath.position = homeSpot;
		gameController.moveTarget[idNumber] = homeSpot;
		gameController.aiPaths[idNumber].target = opponentPath;
		gameController.StartTeleport(idNumber);
	}
	//if not home
	else if(Vector3.Distance(gameController.targetObjects[idNumber].transform.position, homeSpot) > 1.00f && !gameController.teleporting[2])		{
		opponentPath.position = homeSpot;
		//go home
		gameController.moveTarget[idNumber] = homeSpot;
		gameController.aiPaths[idNumber].target = opponentPath;
		gameController.moving[idNumber] = true;
		gameController.aiPaths[idNumber].canSearch = true;
		gameController.aiPaths[idNumber].canMove = true;
		gameController.aiPaths[idNumber].SearchPath();
	}
	//at home
	else if(!gameController.teleporting[2])		{
		//chill
		gameController.anims[idNumber].Idle();
		gameController.moving[idNumber] = false;			
		//look towards the likely approach of my enemies
		gameController.targetObjects[idNumber].transform.rotation = lookRotation;		
		gameController.aiPaths[idNumber].canMove = false;
		gameController.aiPaths[idNumber].canSearch = false;
	}
}

function RalphBrain(xLimit : float, difficulty : int) {
	var relativePos : Vector3;
	var targetRotation : Quaternion;	
	var shieldPercent : float = 0.2;
	var ultPercent : float = 0.6;
	var areaDistance : float = 8;
	switch(difficulty) {
	case 0:
		shieldPercent = 0.8;
		ultPercent = 1;
		areaDistance = 18;
		break;
	case 1:
		shieldPercent = 0.5;
		ultPercent = 0.8;
		areaDistance = 15;
		break;
	case 2:
		shieldPercent = 0.35;
		ultPercent = 0.7;
		areaDistance = 12;
		break;
	}
	
	if(gameController.currentTargets[idNumber] != 0) {
		//skill2
		if(gameController.skillLevels[2,1] > 0 && gameController.currentHealths[2]/gameController.maxHealths[2] < shieldPercent && !gameController.cooldowns[2,1])	{	
			//stop basic attack
			originalTarget = gameController.currentTargets[2];	
			gameController.StopBasicAttack(2);
			gameController.useSkill[2,1](2);	
		}
		//ult
		else if(gameController.skillLevels[2,3] > 0 && !gameController.cooldowns[2,3] &&
			(gameController.targetObjects[1].transform.position.x > xLimit-3 || (gameController.currentHealths[1]/gameController.maxHealths[1] < 0.2 
			&& gameController.targetObjects[1].transform.position.x > xLimit-8)) && 
			gameController.currentHealths[1]/gameController.maxHealths[1] < ultPercent && gameController.currentHealths[1] > 50
			&& Vector3.Distance(gameController.targetObjects[idNumber].transform.position, gameController.targetObjects[1].transform.position) < areaDistance)	{	
			gameController.skillTargetLocations[2] = gameController.targetObjects[1].transform.position;
			gameController.moveTarget[2] = gameController.skillTargetLocations[2];
			gameController.skillTargetLocations[2].y = 0.2;
			originalTarget = gameController.currentTargets[2];	
			gameController.currentTargets[2] = 38;							
			relativePos = gameController.targetObjects[1].transform.position  - gameController.targetObjects[2].transform.position;
			if(relativePos.z != 0) {
				targetRotation = Quaternion.LookRotation(relativePos);
				gameController.targetObjects[2].transform.rotation = targetRotation;
				gameController.targetObjects[2].transform.rotation.x = 0;
				gameController.targetObjects[2].transform.rotation.z = 0;
			}			
			
			opponentSkills.seeking = true;
			//stop basic attack
			gameController.StopBasicAttack(2);
			gameController.useSkill[2,3](2);	
		}
		//skill1
		else if(gameController.skillLevels[2,0] > 0 && !gameController.cooldowns[2,0] &&
			(gameController.targetObjects[1].transform.position.x > xLimit  || (gameController.currentHealths[1]/gameController.maxHealths[1] < 0.15 
			&& gameController.targetObjects[1].transform.position.x > xLimit-5)) && gameController.currentHealths[1] >= 1 
			&& Vector3.Distance(gameController.targetObjects[idNumber].transform.position, gameController.targetObjects[1].transform.position) < areaDistance)	{	
			
			gameController.skillTargetLocations[2] = gameController.targetObjects[1].transform.position;
			gameController.moveTarget[2] = gameController.skillTargetLocations[2];
			gameController.skillTargetLocations[2].y = 0.2;
			originalTarget = gameController.currentTargets[2];	
			gameController.currentTargets[2] = 38;							
			relativePos = gameController.targetObjects[1].transform.position  - gameController.targetObjects[2].transform.position;
			if(relativePos.z != 0) {
				targetRotation = Quaternion.LookRotation(relativePos);
				gameController.targetObjects[2].transform.rotation = targetRotation;
				gameController.targetObjects[2].transform.rotation.x = 0;
				gameController.targetObjects[2].transform.rotation.z = 0;
			}	
				
			opponentSkills.seeking = true;
			//stop basic attack
			gameController.StopBasicAttack(2);
			gameController.useSkill[2,0](2);	
		}
		//skill1 - guardian
		else if(difficulty > 1 && gameController.skillLevels[2,0] > 0 && !gameController.cooldowns[2,0] && gameController.currentTargets[idNumber] == 7
			&& Vector3.Distance(gameController.targetObjects[idNumber].transform.position, gameController.targetObjects[7].transform.position) < 10)	{	
					
			gameController.skillTargetLocations[2] = gameController.targetObjects[7].transform.position;
			gameController.moveTarget[2] = gameController.skillTargetLocations[2];
			gameController.skillTargetLocations[2].y = 0.2;
			originalTarget = gameController.currentTargets[2];	
			gameController.currentTargets[2] = 38;							
			relativePos = gameController.targetObjects[7].transform.position  - gameController.targetObjects[2].transform.position;
			if(relativePos.z != 0) {
				targetRotation = Quaternion.LookRotation(relativePos);
				gameController.targetObjects[2].transform.rotation = targetRotation;
				gameController.targetObjects[2].transform.rotation.x = 0;
				gameController.targetObjects[2].transform.rotation.z = 0;
			}	
				
			opponentSkills.seeking = true;
			//stop basic attack
			gameController.StopBasicAttack(2);
			gameController.useSkill[2,0](2);	
		}
	}
	//skill1 - monster
	else if(gameController.skillLevels[2,0] > 0 && !gameController.cooldowns[2,0] && gameController.currentTargets[idNumber] == 0
		&& Vector3.Distance(gameController.targetObjects[idNumber].transform.position, gameController.targetObjects[0].transform.position) < 8)	{	
				
		gameController.skillTargetLocations[2] = gameController.targetObjects[0].transform.position;
		gameController.moveTarget[2] = gameController.skillTargetLocations[2];
		gameController.skillTargetLocations[2].y = 0.2;
		originalTarget = gameController.currentTargets[2];	
		gameController.currentTargets[2] = 38;							
		relativePos = gameController.targetObjects[0].transform.position  - gameController.targetObjects[2].transform.position;
		if(relativePos.z != 0) {
			targetRotation = Quaternion.LookRotation(relativePos);
			gameController.targetObjects[2].transform.rotation = targetRotation;
			gameController.targetObjects[2].transform.rotation.x = 0;
			gameController.targetObjects[2].transform.rotation.z = 0;
		}	
			
		opponentSkills.seeking = true;
		//stop basic attack
		gameController.StopBasicAttack(2);
		gameController.useSkill[2,0](2);	
	}
}

function RosalindBrain(xLimit : float, difficulty : int) {
	var relativePos : Vector3;
	var targetRotation : Quaternion;	
	var shieldPercent : float = 0.4;
	var ultPercent : float = 0.35;
	switch(difficulty) {
	case 0:
		shieldPercent = 0.9;
		ultPercent = 0.8;
		break;
	case 1:
		shieldPercent = 0.75;
		ultPercent = 0.7;
		break;
	case 2:
		shieldPercent = 0.6;
		ultPercent = 0.5;
		break;
	}
	
	if(gameController.currentTargets[idNumber] != 0) {
		//skill2
		if(gameController.skillLevels[2,1] > 0 && gameController.currentResources[2] >= gameController.skillCosts[2,1] && !gameController.cooldowns[2,1]
			&& gameController.currentHealths[2]/gameController.maxHealths[2] < shieldPercent)	{	
			//stop basic attack
			originalTarget = gameController.currentTargets[2];	
			gameController.StopBasicAttack(2);
			gameController.useSkill[2,1](2);	
		}
		//ult
		else if(gameController.skillLevels[2,3] > 0 && gameController.currentResources[2] >= gameController.skillCosts[2,3] && !gameController.cooldowns[2,3] &&
			(gameController.targetObjects[1].transform.position.x > xLimit-3 || (gameController.currentHealths[1]/gameController.maxHealths[1] < 0.2 
			&& gameController.targetObjects[1].transform.position.x > xLimit-8)) && 
			gameController.currentHealths[1]/gameController.maxHealths[1] < ultPercent && gameController.currentHealths[1] > 50)	{	
			
			originalTarget = gameController.currentTargets[2];	
			gameController.currentTargets[2] = 1;							
			relativePos = gameController.targetObjects[1].transform.position  - gameController.targetObjects[2].transform.position;
			if(relativePos.z != 0) {
				targetRotation = Quaternion.LookRotation(relativePos);
				gameController.targetObjects[2].transform.rotation = targetRotation;
				gameController.targetObjects[2].transform.rotation.x = 0;
				gameController.targetObjects[2].transform.rotation.z = 0;
			}
			
			opponentSkills.seeking = true;
			//stop basic attack
			gameController.StopBasicAttack(2);
			gameController.useSkill[2,3](2);	
		}
		//skill1
		else if(gameController.skillLevels[2,0] > 0 && gameController.currentResources[2] >= gameController.skillCosts[2,0] && !gameController.cooldowns[2,0] &&
			(gameController.targetObjects[1].transform.position.x > xLimit || (gameController.currentHealths[1]/gameController.maxHealths[1] < 0.15 
			&& gameController.targetObjects[1].transform.position.x > xLimit-5))
			&& gameController.currentHealths[1] >= 1)	{	
			originalTarget = gameController.currentTargets[2];	
			gameController.currentTargets[2] = 1;							
			relativePos = gameController.targetObjects[1].transform.position  - gameController.targetObjects[2].transform.position;
			if(relativePos.z != 0) {
				targetRotation = Quaternion.LookRotation(relativePos);
				gameController.targetObjects[2].transform.rotation = targetRotation;
				gameController.targetObjects[2].transform.rotation.x = 0;
				gameController.targetObjects[2].transform.rotation.z = 0;
			}
				
			opponentSkills.seeking = true;
			//stop basic attack
			gameController.StopBasicAttack(2);
			gameController.useSkill[2,0](2);	
		}
		//skill3
		else if(gameController.skillLevels[2,2] > 0 && gameController.currentResources[2] >= gameController.skillCosts[2,2] && !gameController.cooldowns[2,2])	{	
			if((gameController.stances[2] == 0 && gameController.inRange[2] && difficulty > 2) || (gameController.stances[2] == 1 && !gameController.inRange[2] && difficulty > 1)) { 
				//stop basic attack
				gameController.StopBasicAttack(2);
				gameController.useSkill[2,2](2);	
			}
			else if(difficulty < 3) {
				var useDelay : int = 9; 
				switch(difficulty) {
				case 0:
					useDelay = 15;
					break;
				case 1:
					useDelay = 12;
					break;
				}		
				
				if(Time.time % useDelay == 0) {			
					//stop basic attack
					originalTarget = gameController.currentTargets[2];	
					gameController.StopBasicAttack(2);
					gameController.useSkill[2,2](2);	
				}
			}
		}
	}
}

function LeonardoBrain(xLimit : float, difficulty : int) {
	//if not transformed leo
	if(!gameController.skillsExecuting[2,3])	{
		var relativePos : Vector3;
		var targetRotation : Quaternion;			
		var areaDistance : float = 7;
		var fogDistance : float = 10;
		var spiderDistance : float = 15;
		switch(difficulty) {
		case 0:
			areaDistance = 13;
			fogDistance = 20;
			spiderDistance = 30;
			break;
		case 1:
			areaDistance = 11;
			fogDistance = 17;
			spiderDistance = 23;
			break;
		case 2:
			areaDistance = 9;
			fogDistance = 14;
			spiderDistance = 18;
			break;
		}
		
		if(gameController.currentTargets[idNumber] != 0) {
			var shouldUlt : boolean;
			var canUlt : boolean = gameController.skillLevels[2,3] > 0 && !gameController.cooldowns[2,3] && gameController.currentResources[2] >= gameController.skillCosts[2,3];
			if(canUlt) { 
				var stance : int = gameController.stances[2];
				if(stance == 0) { stance = 2; }
				var targetingStructure : boolean = gameController.currentTargets[2] == 3 || gameController.currentTargets[2] == 7 || gameController.currentTargets[2] == 5;
				var ultDistance : float = 13;
				var ultPercent : float = 0.35;
				var ultLimit: float = xLimit - 13;
				var shieldPercent : float = 0.5;
				switch(stance) {
				case 2:
					ultDistance = 15;
					ultLimit += 8;
					ultPercent = 1;
					break;
				case 3:
					ultDistance = 5;
					ultLimit += 13;
					ultPercent = 1;
					break;
				}
				switch(difficulty) {
					case 0:
						ultDistance += 8;
						ultLimit -= 8;
						ultPercent += 0.4;
						shieldPercent = 0.8;
						break;
					case 1:
						ultDistance += 5;
						ultLimit -= 5;
						ultPercent += 0.25;
						shieldPercent = 0.7;
						break;
					case 2:
						ultDistance += 2;
						ultLimit -= 3;
						ultPercent += 0.15;
						shieldPercent = 0.6;
						break;
				}
				shouldUlt = ((gameController.targetObjects[1].transform.position.x > ultLimit || ((gameController.currentHealths[1]/gameController.maxHealths[1] < 0.15 
					&& gameController.targetObjects[1].transform.position.x > xLimit-8) && stance != 2)) 
					&& ((gameController.currentHealths[1]/gameController.maxHealths[1] < ultPercent && stance != 2) || stance == 2)
					&& (gameController.currentHealths[1] > 50 || stance == 2 || (targetingStructure && stance != 2))
					&& (Vector3.Distance(gameController.targetObjects[idNumber].transform.position, gameController.targetObjects[1].transform.position) < ultDistance) || stance == 2 
					|| (targetingStructure && stance != 2))
					&& ((stance == 2 && gameController.currentHealths[2]/gameController.maxHealths[2] < shieldPercent) || stance != 2);
			}
			else { shouldUlt = false; }
			
			//ult
			if(shouldUlt)	{
				originalTarget = gameController.currentTargets[2];		
				//stop basic attack
				gameController.StopBasicAttack(2);
				gameController.useSkill[2,3](2);	
			}
			//skill2
			else if(gameController.skillLevels[2,1] > 0 && !gameController.cooldowns[2,1] && gameController.currentResources[2] >= gameController.skillCosts[2,1] &&
				(gameController.targetObjects[1].transform.position.x > xLimit-5  || (gameController.currentHealths[1]/gameController.maxHealths[1] < 0.15 
				&& gameController.targetObjects[1].transform.position.x > xLimit-10)) && gameController.currentHealths[1] >= 1 
				&& Vector3.Distance(gameController.targetObjects[idNumber].transform.position, gameController.targetObjects[1].transform.position) < fogDistance)	{	
				
				gameController.skillTargetLocations[2] = gameController.targetObjects[1].transform.position;
				gameController.moveTarget[2] = gameController.skillTargetLocations[2];
				gameController.skillTargetLocations[2].y = 0.2;
				originalTarget = gameController.currentTargets[2];	
				gameController.currentTargets[2] = 38;							
				relativePos = gameController.targetObjects[1].transform.position  - gameController.targetObjects[2].transform.position;
				if(relativePos.z != 0) {
					targetRotation = Quaternion.LookRotation(relativePos);
					gameController.targetObjects[2].transform.rotation = targetRotation;
					gameController.targetObjects[2].transform.rotation.x = 0;
					gameController.targetObjects[2].transform.rotation.z = 0;
				}				
				opponentSkills.seeking = true;			
				//stop basic attack
				gameController.StopBasicAttack(2);
				gameController.useSkill[2,1](2);	
			}
			//skill1
			else if(gameController.skillLevels[2,0] > 0 && !gameController.cooldowns[2,0] && gameController.currentResources[2] >= gameController.skillCosts[2,0] &&
				(gameController.targetObjects[1].transform.position.x > xLimit-6 || (gameController.currentHealths[1]/gameController.maxHealths[1] < 0.15 
				&& gameController.targetObjects[1].transform.position.x > xLimit-10)) && gameController.currentHealths[1] >= 1 
				&& Vector3.Distance(gameController.targetObjects[idNumber].transform.position, gameController.targetObjects[1].transform.position) < areaDistance)	{

				gameController.skillTargetLocations[2] = gameController.targetObjects[1].transform.position;
				gameController.moveTarget[2] = gameController.skillTargetLocations[2];
				gameController.skillTargetLocations[2].y = 0.2;
				originalTarget = gameController.currentTargets[2];	
				gameController.currentTargets[2] = 38;							
				relativePos = gameController.targetObjects[1].transform.position  - gameController.targetObjects[2].transform.position;
				if(relativePos.z != 0) {
					targetRotation = Quaternion.LookRotation(relativePos);
					gameController.targetObjects[2].transform.rotation = targetRotation;
					gameController.targetObjects[2].transform.rotation.x = 0;
					gameController.targetObjects[2].transform.rotation.z = 0;
				}					
				opponentSkills.seeking = true;
				//stop basic attack
				gameController.StopBasicAttack(2);
				gameController.useSkill[2,0](2);	
			}	
			//skill3
			else if(gameController.skillLevels[2,2] > 0 && gameController.currentResources[2] >= gameController.skillCosts[2,2] && !gameController.cooldowns[2,2]
				&& gameController.seekingTarget[2] && gameController.currentHealths[1] >= 1
				&& Vector3.Distance(gameController.targetObjects[idNumber].transform.position, gameController.targetObjects[1].transform.position) < spiderDistance)	{	
				//stop basic attack
				originalTarget = gameController.currentTargets[2];	
				gameController.StopBasicAttack(2);
				gameController.useSkill[2,2](2);	
			}
			//skill3 - guardian
			else if(difficulty > 1 && gameController.currentTargets[2] == 7 && gameController.skillLevels[2,2] > 0 && !gameController.cooldowns[2,2]
				&& gameController.currentResources[2] >= gameController.skillCosts[2,2]
				&& Vector3.Distance(gameController.targetObjects[idNumber].transform.position, gameController.targetObjects[7].transform.position) < 19)	{	
				//stop basic attack
				originalTarget = gameController.currentTargets[2];	
				gameController.StopBasicAttack(2);
				gameController.useSkill[2,2](2);	
			}
			//skill1 - guardian
			else if(difficulty > 1 && gameController.skillLevels[2,0] > 0 && !gameController.cooldowns[2,0] && gameController.currentTargets[idNumber] == 7
				&& gameController.currentResources[2] >= gameController.skillCosts[2,0]
				&& Vector3.Distance(gameController.targetObjects[idNumber].transform.position, gameController.targetObjects[7].transform.position) < 8)	{

				gameController.skillTargetLocations[2] = gameController.targetObjects[7].transform.position;
				gameController.moveTarget[2] = gameController.skillTargetLocations[2];
				gameController.skillTargetLocations[2].y = 0.2;
				originalTarget = gameController.currentTargets[2];	
				gameController.currentTargets[2] = 38;							
				relativePos = gameController.targetObjects[7].transform.position  - gameController.targetObjects[2].transform.position;
				if(relativePos.z != 0) {
					targetRotation = Quaternion.LookRotation(relativePos);
					gameController.targetObjects[2].transform.rotation = targetRotation;
					gameController.targetObjects[2].transform.rotation.x = 0;
					gameController.targetObjects[2].transform.rotation.z = 0;
				}					
				opponentSkills.seeking = true;
				//stop basic attack
				gameController.StopBasicAttack(2);
				gameController.useSkill[2,0](2);	
			}		
		}
		//skill3 - monster
		else if(gameController.skillLevels[2,2] > 0 && !gameController.cooldowns[2,2] && gameController.currentTargets[idNumber] == 0 
			&& gameController.currentResources[2] >= gameController.skillCosts[2,2]
			&& Vector3.Distance(gameController.targetObjects[idNumber].transform.position, gameController.targetObjects[0].transform.position) < 10)	{	
			//stop basic attack
			originalTarget = gameController.currentTargets[2];	
			gameController.StopBasicAttack(2);
			gameController.useSkill[2,2](2);	
		}
		//skill1 - monster
		else if(gameController.skillLevels[2,0] > 0 && !gameController.cooldowns[2,0] && gameController.currentTargets[idNumber] == 0
			&& gameController.currentResources[2] >= gameController.skillCosts[2,0]
			&& Vector3.Distance(gameController.targetObjects[idNumber].transform.position, gameController.targetObjects[0].transform.position) < 8)	{

			gameController.skillTargetLocations[2] = gameController.targetObjects[0].transform.position;
			gameController.moveTarget[2] = gameController.skillTargetLocations[2];
			gameController.skillTargetLocations[2].y = 0.2;
			originalTarget = gameController.currentTargets[2];	
			gameController.currentTargets[2] = 38;							
			relativePos = gameController.targetObjects[0].transform.position  - gameController.targetObjects[2].transform.position;
			if(relativePos.z != 0) {
				targetRotation = Quaternion.LookRotation(relativePos);
				gameController.targetObjects[2].transform.rotation = targetRotation;
				gameController.targetObjects[2].transform.rotation.x = 0;
				gameController.targetObjects[2].transform.rotation.z = 0;
			}					
			opponentSkills.seeking = true;
			//stop basic attack
			gameController.StopBasicAttack(2);
			gameController.useSkill[2,0](2);	
		}		
	}						
}

function GravitonBrain(xLimit : float, difficulty : int) {	
	var relativePos : Vector3;
	var targetRotation : Quaternion;	
	var ultPercent : float = 0.5;
	var areaDistance : float = 14;
	var grabDistance : float = 10;
	var knockDistance : float = 6;
	switch(difficulty) {
	case 0:
		ultPercent = 1;
		areaDistance = 20;
		grabDistance = 18;
		knockDistance = 10;
		break;
	case 1:
		ultPercent = 0.8;
		areaDistance = 18;
		grabDistance = 15;
		knockDistance = 9;
		break;
	case 2:
		ultPercent = 0.65;
		areaDistance = 16;
		grabDistance = 12;
		knockDistance = 7;
		break;
	}
	
	if(gameController.currentTargets[idNumber] != 0) {
		//skill2
		if(gameController.skillLevels[2,1] > 0 && gameController.currentResources[2] >= gameController.skillCosts[2,1] && !gameController.cooldowns[2,1]
			&& Vector3.Distance(gameController.targetObjects[idNumber].transform.position, gameController.targetObjects[1].transform.position) < knockDistance)	{	
			originalTarget = gameController.currentTargets[2];	
			//stop basic attack
			gameController.StopBasicAttack(2);
			gameController.useSkill[2,1](2);	
		}
		//ult
		else if(gameController.skillLevels[2,3] > 0 && !gameController.cooldowns[2,3] && gameController.currentResources[2] >= gameController.skillCosts[2,3]&&
			(gameController.targetObjects[1].transform.position.x > xLimit-3 || (gameController.currentHealths[1]/gameController.maxHealths[1] < 0.2 
			&& gameController.targetObjects[1].transform.position.x > xLimit-8)) 
			&& gameController.currentHealths[1]/gameController.maxHealths[1] < ultPercent && gameController.currentHealths[1] > 50
			&& Vector3.Distance(gameController.targetObjects[idNumber].transform.position, gameController.targetObjects[1].transform.position) < areaDistance)	{	
			gameController.skillTargetLocations[2] = gameController.targetObjects[1].transform.position;
			gameController.moveTarget[2] = gameController.skillTargetLocations[2];
			gameController.skillTargetLocations[2].y = 0.2;
			originalTarget = gameController.currentTargets[2];	
			gameController.currentTargets[2] = 38;							
			relativePos = gameController.targetObjects[1].transform.position  - gameController.targetObjects[2].transform.position;
			if(relativePos.z != 0) {
				targetRotation = Quaternion.LookRotation(relativePos);
				gameController.targetObjects[2].transform.rotation = targetRotation;
				gameController.targetObjects[2].transform.rotation.x = 0;
				gameController.targetObjects[2].transform.rotation.z = 0;
			}			
			
			opponentSkills.seeking = true;
			//stop basic attack
			gameController.StopBasicAttack(2);
			gameController.useSkill[2,3](2);	
		}
		//skill1
		else if(gameController.skillLevels[2,0] > 0 && gameController.currentResources[2] >= gameController.skillCosts[2,0] && !gameController.cooldowns[2,0] &&
			(gameController.targetObjects[1].transform.position.x > xLimit || (gameController.currentHealths[1]/gameController.maxHealths[1] < 0.15 
			&& gameController.targetObjects[1].transform.position.x > xLimit-8)) && gameController.currentHealths[1] >= 1)	{	
			originalTarget = gameController.currentTargets[2];	
			gameController.currentTargets[2] = 1;							
			relativePos = gameController.targetObjects[1].transform.position  - gameController.targetObjects[2].transform.position;
			if(relativePos.z != 0) {
				targetRotation = Quaternion.LookRotation(relativePos);
				gameController.targetObjects[2].transform.rotation = targetRotation;
				gameController.targetObjects[2].transform.rotation.x = 0;
				gameController.targetObjects[2].transform.rotation.z = 0;
			}
				
			opponentSkills.seeking = true;
			//stop basic attack
			gameController.StopBasicAttack(2);
			gameController.useSkill[2,0](2);	
		}
		//skill3
		else if(gameController.skillLevels[2,2] > 0 && !gameController.cooldowns[2,2] && gameController.currentResources[2] >= gameController.skillCosts[2,2] &&
			(gameController.targetObjects[1].transform.position.x > xLimit-8 || (gameController.currentHealths[1]/gameController.maxHealths[1] < 0.15 
			&& gameController.targetObjects[1].transform.position.x > xLimit-10)) && gameController.currentHealths[1] >= 1 
			&& Vector3.Distance(gameController.targetObjects[idNumber].transform.position, gameController.targetObjects[1].transform.position) < grabDistance)	{

			gameController.skillTargetLocations[2] = gameController.targetObjects[1].transform.position;
			gameController.moveTarget[2] = gameController.skillTargetLocations[2];
			gameController.skillTargetLocations[2].y = 0.2;
			originalTarget = gameController.currentTargets[2];	
			gameController.currentTargets[2] = 38;							
			relativePos = gameController.targetObjects[1].transform.position  - gameController.targetObjects[2].transform.position;
			if(relativePos.z != 0) {
				targetRotation = Quaternion.LookRotation(relativePos);
				gameController.targetObjects[2].transform.rotation = targetRotation;
				gameController.targetObjects[2].transform.rotation.x = 0;
				gameController.targetObjects[2].transform.rotation.z = 0;
			}					
			opponentSkills.seeking = true;
			//stop basic attack
			gameController.StopBasicAttack(2);
			gameController.useSkill[2,2](2);	
		}	
		//skill1 - guardian
		else if(difficulty > 1 && gameController.skillLevels[2,0] > 0 && !gameController.cooldowns[2,0] && gameController.currentTargets[idNumber] == 7
			&& gameController.currentResources[2] >= gameController.skillCosts[2,0]
			&& Vector3.Distance(gameController.targetObjects[idNumber].transform.position, gameController.targetObjects[7].transform.position) < 14)	{
				
			originalTarget = gameController.currentTargets[2];	
			gameController.currentTargets[2] = 7;							
			relativePos = gameController.targetObjects[7].transform.position  - gameController.targetObjects[2].transform.position;
			if(relativePos.z != 0) {
				targetRotation = Quaternion.LookRotation(relativePos);
				gameController.targetObjects[2].transform.rotation = targetRotation;
				gameController.targetObjects[2].transform.rotation.x = 0;
				gameController.targetObjects[2].transform.rotation.z = 0;
			}
				
			opponentSkills.seeking = true;
			//stop basic attack
			gameController.StopBasicAttack(2);
			gameController.useSkill[2,0](2);	
		}
		//skill3 - guardian
		else if(difficulty > 1 && gameController.skillLevels[2,2] > 0 && !gameController.cooldowns[2,2] && gameController.currentTargets[idNumber] == 7
			&& gameController.currentResources[2] >= gameController.skillCosts[2,2]
			&& Vector3.Distance(gameController.targetObjects[idNumber].transform.position, gameController.targetObjects[7].transform.position) < 13)	{

			gameController.skillTargetLocations[2] = gameController.targetObjects[7].transform.position;
			gameController.moveTarget[2] = gameController.skillTargetLocations[2];
			gameController.skillTargetLocations[2].y = 0.2;
			originalTarget = gameController.currentTargets[2];	
			gameController.currentTargets[2] = 38;							
			relativePos = gameController.targetObjects[7].transform.position  - gameController.targetObjects[2].transform.position;
			if(relativePos.z != 0) {
				targetRotation = Quaternion.LookRotation(relativePos);
				gameController.targetObjects[2].transform.rotation = targetRotation;
				gameController.targetObjects[2].transform.rotation.x = 0;
				gameController.targetObjects[2].transform.rotation.z = 0;
			}					
			opponentSkills.seeking = true;
			//stop basic attack
			gameController.StopBasicAttack(2);
			gameController.useSkill[2,2](2);	
		}
	}
	//skill1 - monster
	else if(gameController.skillLevels[2,0] > 0 && !gameController.cooldowns[2,0] && gameController.currentTargets[idNumber] == 0
		&& gameController.currentResources[2] >= gameController.skillCosts[2,0]
		&& Vector3.Distance(gameController.targetObjects[idNumber].transform.position, gameController.targetObjects[0].transform.position) < 14)	{
			
		originalTarget = gameController.currentTargets[2];	
		gameController.currentTargets[2] = 0;							
		relativePos = gameController.targetObjects[0].transform.position  - gameController.targetObjects[2].transform.position;
		if(relativePos.z != 0) {
			targetRotation = Quaternion.LookRotation(relativePos);
			gameController.targetObjects[2].transform.rotation = targetRotation;
			gameController.targetObjects[2].transform.rotation.x = 0;
			gameController.targetObjects[2].transform.rotation.z = 0;
		}
			
		opponentSkills.seeking = true;
		//stop basic attack
		gameController.StopBasicAttack(2);
		gameController.useSkill[2,0](2);	
	}
	//skill3 - monster
	else if(gameController.skillLevels[2,2] > 0 && !gameController.cooldowns[2,2] && gameController.currentTargets[idNumber] == 0
		&& gameController.currentResources[2] >= gameController.skillCosts[2,2]
		&& Vector3.Distance(gameController.targetObjects[idNumber].transform.position, gameController.targetObjects[0].transform.position) < 13)	{

		gameController.skillTargetLocations[2] = gameController.targetObjects[0].transform.position;
		gameController.moveTarget[2] = gameController.skillTargetLocations[2];
		gameController.skillTargetLocations[2].y = 0.2;
		originalTarget = gameController.currentTargets[2];	
		gameController.currentTargets[2] = 38;							
		relativePos = gameController.targetObjects[0].transform.position  - gameController.targetObjects[2].transform.position;
		if(relativePos.z != 0) {
			targetRotation = Quaternion.LookRotation(relativePos);
			gameController.targetObjects[2].transform.rotation = targetRotation;
			gameController.targetObjects[2].transform.rotation.x = 0;
			gameController.targetObjects[2].transform.rotation.z = 0;
		}					
		opponentSkills.seeking = true;
		//stop basic attack
		gameController.StopBasicAttack(2);
		gameController.useSkill[2,2](2);	
	}
}

function TowerBrain (){	
	//if i dont have a target
	if(!gameController.seekingTarget[idNumber] && !gameController.attacking[idNumber])	{
		var targetFound : boolean = false;
		//look for enemy minions,spiders,bobs to attack
		for(var i : int = 9+teamNumber; i < 37; i+=2)		{
			var minionDistance : float = Vector3.Distance(towerPos, gameController.targetObjects[i].collider.ClosestPointOnBounds(towerPos));
			//if the minion is in range
			if(minionDistance < gameController.attackRanges[idNumber])			{
				targetFound = true;
				gameController.currentTargets[idNumber] = i;
				break;
			}
		}
		//if no minions, look for enemy character to attack
		if(!targetFound)		{
			var opponentDistance : float = Vector3.Distance(towerPos, gameController.targetObjects[teamNumber+1].collider.ClosestPointOnBounds(towerPos));
			if(opponentDistance < gameController.attackRanges[idNumber])			{
				targetFound = true;
				gameController.currentTargets[idNumber] = teamNumber+1;
			}
		}
		//if somethings in range
		if(targetFound)		{
			//attack it
			gameController.inRange[idNumber] = true;
			gameController.seekingTarget[idNumber] = true;
		}
		
	}
	//if i do have a target
	else	{
		//check to see if it's still in range
		var targetDistance : float = Vector3.Distance(towerPos, gameController.targetObjects[gameController.currentTargets[idNumber]].collider.ClosestPointOnBounds(towerPos));
		if(targetDistance > gameController.attackRanges[idNumber])		{
			gameController.unitAggro[idNumber] = false;			
			gameController.inRange[idNumber] = false;
			gameController.seekingTarget[idNumber] = false;
		}
	}
}

function GuardianBrain (){
	//if i dont have a target
	if(!gameController.seekingTarget[idNumber])	{
		var targetFound : boolean = false;
		//look for enemy minions,spiders,bobs to attack
		for(var i : int = 9+teamNumber; i < 37; i+=2)		{
			var minionDistance : float = Vector3.Distance(guardianPos, gameController.targetObjects[i].collider.ClosestPointOnBounds(guardianPos));
			//if the minion is in aggression radius
			if(minionDistance < 20)			{
				targetFound = true;
				gameController.currentTargets[idNumber] = i;
				break;
			}
		}
		//if no minions, look for enemy character to attack
		if(!targetFound)		{
			var opponentDistance : float = Vector3.Distance(guardianPos, gameController.targetObjects[teamNumber+1].collider.ClosestPointOnBounds(guardianPos));
			if(opponentDistance < 20)		{
				targetFound = true;
				gameController.currentTargets[idNumber] = teamNumber+1;
			}
		}
		//if somethings in range
		if(targetFound)		{
			//attack it
			gameController.EngageTarget(idNumber);
		}
		//noone to play with, go/stay home
		else		{
			//if not home
			if(Vector3.Distance(gameController.targetObjects[idNumber].transform.position, guardianPos) > 1.00f)
			{
				//go home
				gameController.moveTarget[idNumber] = guardianPos;
				gameController.moving[idNumber] = true;
				gameController.aiPaths[idNumber].canSearch = true;
				gameController.aiPaths[idNumber].canMove = true;
				gameController.aiPaths[idNumber].target = guardianSpawn;
			}
			//at home
			else
			{
				//chill
				gameController.anims[idNumber].Idle();
				gameController.moving[idNumber] = false;
				
				//look towards the likely approach of my enemies
				gameController.targetObjects[idNumber].transform.rotation = lookRotation;
				gameController.aiPaths[idNumber].canMove = false;
				gameController.aiPaths[idNumber].canSearch = false;
			}
		}
		
	}
	//if i do have a target
	else	{
		//check to see if it's still in aggression radius
		var targetDistance : float = Vector3.Distance(guardianPos, gameController.targetObjects[gameController.currentTargets[idNumber]].collider.ClosestPointOnBounds(guardianPos));
		if(targetDistance > 21)
		{
			gameController.unitAggro[idNumber] = false;
			gameController.StopBasicAttack(idNumber);
			gameController.inRange[idNumber] = false;
			gameController.seekingTarget[idNumber] = false;
		}
	}
}

function StartMinionBrain () {
	for(var i : int = 0; i < 2; i++) {
		if(i == 0) {
			//attack tower, guard or chest
			AttackObjective();
			yield WaitForSeconds(1);
		}
		else {	brainOn = true;		}
	}
}

function AttackObjective () {
	var towerDown : boolean = gameController.enemyTowerDown;
	var guardDown : boolean = gameController.enemyGuardianDown;
	if(teamNumber == 0)		{
		towerDown = gameController.playerTowerDown;
		guardDown = gameController.playerGuardianDown;
	}
	
	if(!towerDown)		{
		gameController.currentTargets[idNumber] = 3+teamNumber;
	}
	else if(!guardDown)		{
		gameController.currentTargets[idNumber] = 7+teamNumber;
	}
	else		{
		gameController.currentTargets[idNumber] = 5+teamNumber;
	}
	gameController.EngageTarget(idNumber);
}

function MinionBrain (){
	//if i dont have a target
	if(!gameController.seekingTarget[idNumber])	{
		//attack tower, guard or chest
		AttackObjective();
	}
	//if engaged with tower, guard, or chest
	else if(gameController.currentTargets[idNumber] > 2 && gameController.currentTargets[idNumber] < 9)	{
		var targetFound : boolean = false;		
		//look around for enemy minions,spiders,bobs
		for(var i : int = 9+teamNumber; i < 37; i+=2)		{
			var minionDistance : float = Vector3.Distance(gameController.targetObjects[idNumber].collider.ClosestPointOnBounds(gameController.targetObjects[i].transform.position),
			 gameController.targetObjects[i].collider.ClosestPointOnBounds(gameController.targetObjects[idNumber].transform.position));
			//if the enemy is in aggression range
			if(minionDistance < 20)			{
				//ruin his day
				gameController.currentTargets[idNumber] = i;
				targetFound = true;
				break;
			}
		}		
		
		//if no target yet
		if(!targetFound)		{
			//if not in range of target yet
			var objectiveDist : float = Vector3.Distance(gameController.targetObjects[idNumber].transform.position, 
			gameController.targetObjects[gameController.currentTargets[idNumber]].transform.position);
			if(objectiveDist > 17)		{
				//look for necromancer
				var charDistance : float = Vector3.Distance(gameController.targetObjects[idNumber].collider.ClosestPointOnBounds(gameController.targetObjects[teamNumber+1].transform.position),
					 gameController.targetObjects[teamNumber+1].collider.ClosestPointOnBounds(gameController.targetObjects[idNumber].transform.position));
				//if the necromancer is in aggression range
				if(charDistance < 10)			{
					//rawr!
					gameController.currentTargets[idNumber] = teamNumber+1;
					targetFound = true;
				}
			}
		}

		if(targetFound)		{
			gameController.EngageTarget(idNumber);
		}
		
	}
	//if engaged with a necro
	else if(gameController.currentTargets[idNumber] == 1 || gameController.currentTargets[idNumber] == 2)	{
		//check to see if it's still in aggression radius
		var targetDistance : float = Vector3.Distance(gameController.targetObjects[idNumber].transform.position, gameController.targetObjects[gameController.currentTargets[idNumber]].transform.position);
		if(targetDistance > 12)		{
			gameController.unitAggro[idNumber] = false;
			gameController.inRange[idNumber] = false;
			gameController.seekingTarget[idNumber] = false;
		}
	}	
}

function SpiderBrain (){
	//if i dont have a target
	if(!gameController.seekingTarget[idNumber])	{
		var targetFound : boolean = false;
		
		//look for enemy character to attack
		var opponentDistance : float = Vector3.Distance(gameController.targetObjects[allyNumber].transform.position, gameController.targetObjects[teamNumber+1].transform.position);
		if(opponentDistance < 18)		{
			targetFound = true;
			gameController.currentTargets[idNumber] = teamNumber+1;
		}
		//if no chararacter 
		if(!targetFound)		{
			var monsterDistance : float = Vector3.Distance(gameController.targetObjects[allyNumber].transform.position, gameController.targetObjects[0].transform.position);
			if(monsterDistance < 18)			{
				targetFound = true;
				gameController.currentTargets[idNumber] = 0;
			}
		}
		//if no char or monster
		if(!targetFound)		{
			//look for enemy minions,spiders,bobs to attack
			for(var i : int = 9+teamNumber; i < 37; i+=2)			{
				var minionDistance : float = Vector3.Distance(gameController.targetObjects[allyNumber].transform.position, gameController.targetObjects[i].transform.position);
				//if the minion is in aggro radius
				if(minionDistance < 18)				{
					targetFound = true;
					gameController.currentTargets[idNumber] = i;
					break;
				}
			}
		}
		//if no character or minions in aggro radius
		if(!targetFound)		{
			//check for structures or guardian
			for(var j : int = 3+teamNumber; j < 9; j+=2)			{
				//check to see if the potential target can be attacked
				if(j < 5 || (j == 5 && gameController.playerGuardianDown) || (j == 6 && gameController.enemyGuardianDown) || (j == 7 && gameController.playerTowerDown) 
					|| (j == 8 && gameController.enemyTowerDown))				{
					var defenseDistance : float = Vector3.Distance(gameController.targetObjects[allyNumber].transform.position, gameController.targetObjects[j].transform.position);
					//if the minion is in range
					if(defenseDistance < 18)					{
						targetFound = true;
						gameController.currentTargets[idNumber] = j;
						break;
					}
				}
			}
		}
		
		//if somethings in range
		if(targetFound)		{
			//attack it
			gameController.EngageTarget(idNumber);
		}
		else		{
			//if owner is alive
			if(gameController.currentHealths[allyNumber] >= 1)			{
				//follow owner
				//if not at owner
				if(Vector3.Distance(gameController.targetObjects[idNumber].transform.position, gameController.targetObjects[allyNumber].transform.position) > 3)				{
					//go to owner
					gameController.aiPaths[idNumber].speed = gameController.aiPaths[allyNumber].speed;
					gameController.moveTarget[idNumber] = gameController.targetObjects[allyNumber].transform.TransformPoint(Vector3.right/1.5);
					spiderPath.position = gameController.targetObjects[allyNumber].transform.TransformPoint(Vector3.right/1.5);
					gameController.aiPaths[idNumber].target = spiderPath;
					gameController.moving[idNumber] = true;
					gameController.aiPaths[idNumber].canSearch = true;
					gameController.aiPaths[idNumber].canMove = true;
				}
				//at owner
				else			{
					//chill
					gameController.anims[idNumber].Idle();
					gameController.moving[idNumber] = false;
					gameController.aiPaths[idNumber].canMove = false;
					gameController.aiPaths[idNumber].canSearch = false;
					//look the same direction as my owner
					gameController.targetObjects[idNumber].transform.rotation = gameController.targetObjects[allyNumber].transform.rotation;
				}
			}
			else			{
				brainOn = false;			
				if(gameController.currentHealths[idNumber] >= 1) {		gameController.KillUnit(38, idNumber);		}
			}
		}		
	}
	//if i do have a target
	else	{
		//check to see if it's still in range
		var targetDistance : float = Vector3.Distance(gameController.targetObjects[allyNumber].transform.position,
			 gameController.targetObjects[gameController.currentTargets[idNumber]].transform.position);
		if(targetDistance > 25)		{
			gameController.unitAggro[idNumber] = false;
			gameController.inRange[idNumber] = false;
			gameController.seekingTarget[idNumber] = false;
		}
	}

}

function BobBrain (){
	//if i dont have a target
	if(!gameController.seekingTarget[idNumber])	{
		var targetFound : boolean = false;
		//look for enemy character to attack
		var opponentDistance : float = Vector3.Distance(gameController.targetObjects[idNumber].transform.position, 
		gameController.targetObjects[teamNumber+1].collider.ClosestPointOnBounds(gameController.targetObjects[idNumber].transform.position));
		if(opponentDistance < gameController.attackRanges[idNumber])		{
			targetFound = true;
			gameController.currentTargets[idNumber] = teamNumber+1;
		}
		//if no chararacter 
		if(!targetFound)		{
			var monsterDistance : float = Vector3.Distance(gameController.targetObjects[idNumber].transform.position, 
				gameController.targetObjects[0].collider.ClosestPointOnBounds(gameController.targetObjects[idNumber].transform.position));
			if(monsterDistance < gameController.attackRanges[idNumber])			{
				targetFound = true;
				gameController.currentTargets[idNumber] = 0;
			}
		}
		//if no character or monster found
		if(!targetFound)		{
			//look for enemy guardians, minions,spiders,bobs to attack
			for(var i : int = 7+teamNumber; i < 37; i+=2)			{
				var minionDistance : float = Vector3.Distance(gameController.targetObjects[idNumber].transform.position, 
				gameController.targetObjects[i].collider.ClosestPointOnBounds(gameController.targetObjects[idNumber].transform.position));
				//if the minion is in range
				if(minionDistance < gameController.attackRanges[idNumber])				{
					targetFound = true;
					gameController.currentTargets[idNumber] = i;
					break;
				}
			}
		}
		//if somethings in range
		if(targetFound)		{
			if(gameController.currentHealths[gameController.currentTargets[idNumber]] >= 1) {
				//attack it
				gameController.inRange[idNumber] = true;
				gameController.seekingTarget[idNumber] = true;
			}
			else { gameController.currentTargets[idNumber] = 38; }
		}
		
	}
	//if i do have a target
	else	{
		//check to see if it's still in range
		if(gameController.currentTargets[idNumber] != 38) {
			var targetDistance : float = Vector3.Distance(gameController.targetObjects[idNumber].transform.position,
				 gameController.targetObjects[gameController.currentTargets[idNumber]].transform.position);
			if(targetDistance > gameController.attackRanges[idNumber])		{
				gameController.unitAggro[idNumber] = false;
				gameController.inRange[idNumber] = false;
				gameController.seekingTarget[idNumber] = false;
			}
		}
		else {
			gameController.unitAggro[idNumber] = false;
			gameController.inRange[idNumber] = false;
			gameController.seekingTarget[idNumber] = false;
			if(gameController.attacking[idNumber]) { gameController.StopBasicAttack(idNumber); }
		}
	}
}

function LevelUpSkills () {
	switch(playerData.difficultySelected) {
	case 0:
	case 1:
		switch(gameController.levels[2]) {
		case 1:		
			switch(gameController.characterSelected[2]) {
			case 0:
				gameController.SkillLevelUp(2,0);
				break;
			case 1:
				gameController.SkillLevelUp(2,0);
				break;
			case 2:
				gameController.SkillLevelUp(2,1);
				break;
			case 3:
				gameController.SkillLevelUp(2,2);
				break;
			}
			break;
		case 2:
			switch(gameController.characterSelected[2]) {
			case 0:
				gameController.SkillLevelUp(2,1);
				break;
			case 1:
				gameController.SkillLevelUp(2,1);
				break;
			case 2:
				gameController.SkillLevelUp(2,0);
				break;
			case 3:
				gameController.SkillLevelUp(2,1);
				break;
			}
			break;
		case 3:
			switch(gameController.characterSelected[2]) {
			case 0:
				gameController.SkillLevelUp(2,2);
				break;
			case 1:
				gameController.SkillLevelUp(2,2);
				break;
			case 2:
				gameController.SkillLevelUp(2,2);
				break;
			case 3:
				gameController.SkillLevelUp(2,2);
				break;
			}
			break;
		case 4:
			switch(gameController.characterSelected[2]) {
			case 0:
				gameController.SkillLevelUp(2,0);
				break;
			case 1:
				gameController.SkillLevelUp(2,0);
				break;
			case 2:
				gameController.SkillLevelUp(2,0);
				break;
			case 3:
				gameController.SkillLevelUp(2,0);
				break;
			}
			break;
		case 5:
			switch(gameController.characterSelected[2]) {
			case 0:
				gameController.SkillLevelUp(2,3);
				break;
			case 1:
				gameController.SkillLevelUp(2,3);
				break;
			case 2:
				gameController.SkillLevelUp(2,3);
				break;
			case 3:
				gameController.SkillLevelUp(2,3);
				break;
			}
			break;
		case 6:
			switch(gameController.characterSelected[2]) {
			case 0:
				gameController.SkillLevelUp(2,1);
				break;
			case 1:
				gameController.SkillLevelUp(2,1);
				break;
			case 2:
				gameController.SkillLevelUp(2,1);
				break;
			case 3:
				gameController.SkillLevelUp(2,2);
				break;
			}
			break;
		case 7:
			switch(gameController.characterSelected[2]) {
			case 0:
				gameController.SkillLevelUp(2,0);
				break;
			case 1:
				gameController.SkillLevelUp(2,0);
				break;
			case 2:
				gameController.SkillLevelUp(2,0);
				break;
			case 3:
				gameController.SkillLevelUp(2,1);
				break;
			}
			break;
		case 8:
			switch(gameController.characterSelected[2]) {
			case 0:
				gameController.SkillLevelUp(2,1);
				break;
			case 1:
				gameController.SkillLevelUp(2,1);
				break;
			case 2:
				gameController.SkillLevelUp(2,1);
				break;
			case 3:
				gameController.SkillLevelUp(2,1);
				break;
			}
			break;
		case 9:
			switch(gameController.characterSelected[2]) {
			case 0:
				gameController.SkillLevelUp(2,2);
				break;
			case 1:
				gameController.SkillLevelUp(2,2);
				break;
			case 2:
				gameController.SkillLevelUp(2,2);
				break;
			case 3:
				gameController.SkillLevelUp(2,0);
				break;
			}
			break;
		case 10:
			switch(gameController.characterSelected[2]) {
			case 0:
				gameController.SkillLevelUp(2,2);
				break;
			case 1:
				gameController.SkillLevelUp(2,2);
				break;
			case 2:
				gameController.SkillLevelUp(2,2);
				break;
			case 3:
				gameController.SkillLevelUp(2,0);
				break;
			}
			break;
		}
		break;
	case 2:
	case 3:
		switch(gameController.levels[2]) {
		case 1:
			switch(gameController.characterSelected[2]) {
			case 0:
				gameController.SkillLevelUp(2,2);
				break;
			case 1:
				gameController.SkillLevelUp(2,2);
				break;
			case 2:
				gameController.SkillLevelUp(2,2);
				break;
			case 3:
				gameController.SkillLevelUp(2,0);
				break;
			}
			break;
		case 2:
			switch(gameController.characterSelected[2]) {
			case 0:
				gameController.SkillLevelUp(2,1);
				break;
			case 1:
				gameController.SkillLevelUp(2,1);
				break;
			case 2:
				gameController.SkillLevelUp(2,1);
				break;
			case 3:
				gameController.SkillLevelUp(2,1);
				break;
			}
			break;
		case 3:
			switch(gameController.characterSelected[2]) {
			case 0:
				gameController.SkillLevelUp(2,0);
				break;
			case 1:
				gameController.SkillLevelUp(2,0);
				break;
			case 2:
				gameController.SkillLevelUp(2,2);
				break;
			case 3:
				gameController.SkillLevelUp(2,2);
				break;
			}
			break;
		case 4:
			switch(gameController.characterSelected[2]) {
			case 0:
				gameController.SkillLevelUp(2,2);
				break;
			case 1:
				gameController.SkillLevelUp(2,2);
				break;
			case 2:
				gameController.SkillLevelUp(2,2);
				break;
			case 3:
				gameController.SkillLevelUp(2,0);
				break;
			}
			break;
		case 5:
			switch(gameController.characterSelected[2]) {
			case 0:
				gameController.SkillLevelUp(2,3);
				break;
			case 1:
				gameController.SkillLevelUp(2,3);
				break;
			case 2:
				gameController.SkillLevelUp(2,3);
				break;
			case 3:
				gameController.SkillLevelUp(2,3);
				break;
			}
			break;
		case 6:
			switch(gameController.characterSelected[2]) {
			case 0:
				gameController.SkillLevelUp(2,2);
				break;
			case 1:
				gameController.SkillLevelUp(2,2);
				break;
			case 2:
				gameController.SkillLevelUp(2,0);
				break;
			case 3:
				gameController.SkillLevelUp(2,0);
				break;
			}
			break;
		case 7:
			switch(gameController.characterSelected[2]) {
			case 0:
				gameController.SkillLevelUp(2,1);
				break;
			case 1:
				gameController.SkillLevelUp(2,1);
				break;
			case 2:
				gameController.SkillLevelUp(2,1);
				break;
			case 3:
				gameController.SkillLevelUp(2,2);
				break;
			}
			break;
		case 8:
			switch(gameController.characterSelected[2]) {
			case 0:
				gameController.SkillLevelUp(2,1);
				break;
			case 1:
				gameController.SkillLevelUp(2,1);
				break;
			case 2:
				gameController.SkillLevelUp(2,1);
				break;
			case 3:
				gameController.SkillLevelUp(2,2);
				break;
			}
			break;
		case 9:
			switch(gameController.characterSelected[2]) {
			case 0:
				gameController.SkillLevelUp(2,0);
				break;
			case 1:
				gameController.SkillLevelUp(2,0);
				break;
			case 2:
				gameController.SkillLevelUp(2,0);
				break;
			case 3:
				gameController.SkillLevelUp(2,1);
				break;
			}
			break;
		case 10:
			switch(gameController.characterSelected[2]) {
			case 0:
				gameController.SkillLevelUp(2,0);
				break;
			case 1:
				gameController.SkillLevelUp(2,0);
				break;
			case 2:
				gameController.SkillLevelUp(2,0);
				break;
			case 3:
				gameController.SkillLevelUp(2,1);
				break;
			}
			break;
		}
		break;
	}
}