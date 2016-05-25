#pragma strict

private var gameController : GameController;
private var skills : Skills;
private var playerData : PlayerData;
var enemyBob : GameObject;

//skill costs
var skillCosts : int[,];
var skillCostGrowths : int[,];

var msBonus : float;
var asBonus : float;

var hasAura : boolean[];
var leoAuraValues : float[,];
var currentAura : int[];
var elementalDebuffValues : float[,];
var elementalDebuffCounts : int[,];
var auraMultiplier : int;

var hasSlowAura : boolean[];
var slowAmounts : float[];
var pulling : boolean;

var inBlackHole : boolean[];
var doomOrigin : Vector3;
var doomRadius : int;
var doomEnded : boolean;
var doomPulling : boolean[];

//particles
var skillParticles : GameObject[,];
var runts : GameObject[];
var runtPaths : AIPath[];
var runtTargetObjects : GameObject[];
var runtTargets : Transform[];
var runtExplosion : GameObject[];
var runtAnims : Animation[];
var fireAura : Color;
var iceAura : Color;
var earthAura : Color;

var skillFunctions : Function[,] = new Function[4,4];
var enemyTarget : GameObject;
var skillTargets : Transform[];
var seeking : boolean;
var fluctuating : boolean;

var gravityWellDuration : float = 5.0;

var skillSoundEffects : AudioSource[];
var runtSoundEffects : AudioSource[];

function Awake () {
	gameController = this.GetComponent(GameController);
	skills = this.GetComponent(Skills);	
	playerData = GameObject.FindGameObjectWithTag("Data").GetComponent(PlayerData);
	
	enemyBob = gameController.targetObjects[36];
	
	skillFunctions[0,0] = RalphSkillOne;
	skillFunctions[0,1] = RalphSkillTwo;
	skillFunctions[0,2] = RalphSkillThree;
	skillFunctions[0,3] = RalphSkillFour;
	
	skillFunctions[1,0] = RosalindSkillOne;
	skillFunctions[1,1] = RosalindSkillTwo;
	skillFunctions[1,2] = RosalindSkillThree;
	skillFunctions[1,3] = RosalindSkillFour;
	
	skillFunctions[2,0] = LeonardoSkillOne;
	skillFunctions[2,1] = LeonardoSkillTwo;
	skillFunctions[2,2] = LeonardoSkillThree;
	skillFunctions[2,3] = LeonardoSkillFour;
	
	skillFunctions[3,0] = GravitonSkillOne;
	skillFunctions[3,1] = GravitonSkillTwo;
	skillFunctions[3,2] = GravitonSkillThree;
	skillFunctions[3,3] = GravitonSkillFour;
	
	//skill costs
	skillCosts = new int[4,4];
    skillCostGrowths = new int[4,4];
    
    skillCosts[0,0] = 0;
	skillCosts[0,1] = 0;
	skillCosts[0,2] = 0;
	skillCosts[0,3] = 0;
	
	skillCosts[1,0] = 30;
	skillCosts[1,1] = 60;
	skillCosts[1,2] = 30;
	skillCosts[1,3] = 50;
	
	skillCosts[2,0] = 125;
	skillCosts[2,1] = 100;
	skillCosts[2,2] = 150;
	skillCosts[2,3] = 400;
	
	skillCosts[3,0] = 100;
	skillCosts[3,1] = 150;
	skillCosts[3,2] = 200;
	skillCosts[3,3] = 250;
	
	skillCostGrowths[0,0] = 0;
	skillCostGrowths[0,1] = 0;
	skillCostGrowths[0,2] = 0;
	skillCostGrowths[0,3] = 0;
	
	skillCostGrowths[1,0] = 0;
	skillCostGrowths[1,1] = -10;
	skillCostGrowths[1,2] = 0;
	skillCostGrowths[1,3] = 0;
	
	skillCostGrowths[2,0] = 25;
	skillCostGrowths[2,1] = 50;
	skillCostGrowths[2,2] = 50;
	skillCostGrowths[2,3] = 0;
	
	skillCostGrowths[3,0] = 25;
	skillCostGrowths[3,1] = 25;
	skillCostGrowths[3,2] = 0;
	skillCostGrowths[3,3] = 0;	
	
	//ros
	msBonus = 0;
	asBonus = 0;
	
	//leo
	hasAura = new boolean[39];
	currentAura = new int[39];
	leoAuraValues = new float[39,4];
	elementalDebuffValues = new float[39,4];
    elementalDebuffCounts = new int[39,4];	
    auraMultiplier = 1;
	
	//grav
	hasSlowAura = new boolean[39];
	slowAmounts = new float[39];
	pulling = false;	
	inBlackHole = new boolean[60];
	doomPulling = new boolean[39];
	fluctuating = false;
	
	enemyTarget = new GameObject("EnemySkillTarget");
	skillTargets = new Transform[3];
	skillTargets[2] = enemyTarget.transform;
	seeking = false;
	
	runts = new GameObject[6];
	runtPaths = new AIPath[6];
	runtTargetObjects = new GameObject[6];
	runtTargets = new Transform[6];
	var runtObject : GameObject = GameObject.FindGameObjectWithTag("Runt");
	runtExplosion = new GameObject[6];
	runtAnims = new Animation[6];
	runtSoundEffects = new AudioSource[6];
	if(playerData.opponentSelected == 0) {
		for(var runtCount : int; runtCount < 6; runtCount++) {
			runts[runtCount] = Instantiate(runtObject, Vector3(1300,0,0), Quaternion.Euler(0f,180,0f));
			runts[runtCount].name = "EnemyRunt" + runtCount;
			runts[runtCount].animation["Walk_Loop"].speed = 2;
			runtPaths[runtCount] = runts[runtCount].GetComponent(AIPath);
			runtTargetObjects[runtCount] = new GameObject("EnemyRuntTarget" + runtCount);
			runtTargets[runtCount] = runtTargetObjects[runtCount].transform;
			runtExplosion[runtCount] = runts[runtCount].transform.Find("Explosion").gameObject;
			runtAnims[runtCount] = runts[runtCount].animation;
			runtAnims[runtCount].Stop();
			runtSoundEffects[runtCount] = Instantiate(GameObject.Find("RuntExplosionSound")).audio;
		}
	}
	
	fireAura = Color(0.55,0.05,0);
	iceAura = Color(0,0.05,0.2);
	earthAura = Color(0.05,0.2,0);	
	
	skillSoundEffects = new AudioSource[6];
	switch(playerData.opponentSelected) {
	case 0:
		skillSoundEffects[0] = Instantiate(GameObject.Find("RuntKickSound")).audio;
		skillSoundEffects[1] = Instantiate(GameObject.Find("AdrenalineSound")).audio;
		skillSoundEffects[2] = Instantiate(GameObject.Find("SurvivalSound")).audio;
		skillSoundEffects[3] = Instantiate(GameObject.Find("WasserbarSound")).audio;
		break;
	case 1:
		skillSoundEffects[0] = Instantiate(GameObject.Find("FlecheSound")).audio;
		skillSoundEffects[1] = Instantiate(GameObject.Find("EnGardeSound")).audio;
		skillSoundEffects[2] = Instantiate(GameObject.Find("GraceSound")).audio;
		skillSoundEffects[3] = Instantiate(GameObject.Find("FinesseSound")).audio;
		skillSoundEffects[4] = Instantiate(GameObject.Find("ToucheSound")).audio;
		break;
	case 2:
		skillSoundEffects[0] = Instantiate(GameObject.Find("ScorchSound")).audio;
		skillSoundEffects[1] = Instantiate(GameObject.Find("FreezingFogSound")).audio;
		skillSoundEffects[2] = Instantiate(GameObject.Find("SpiderSound")).audio;
		skillSoundEffects[3] = Instantiate(GameObject.Find("TransformSound")).audio;
		skillSoundEffects[4] = Instantiate(GameObject.Find("ConsumeDebuffSound")).audio;
		skillSoundEffects[5] = Instantiate(GameObject.Find("FireFormAttackSound")).audio;
		break;
	case 3:
		skillSoundEffects[0] = Instantiate(GameObject.Find("GravityWellSound")).audio;
		skillSoundEffects[1] = Instantiate(GameObject.Find("ReverseGravitySound")).audio;
		skillSoundEffects[2] = Instantiate(GameObject.Find("GravityFieldSound")).audio;
		skillSoundEffects[3] = Instantiate(GameObject.Find("BlackHoleSound")).audio;
		skillSoundEffects[4] = Instantiate(GameObject.Find("SingularitySound")).audio;
		skillSoundEffects[5] = Instantiate(GameObject.Find("FluctuatingSound")).audio;
		break;
	}
}

function Start () {
	//particles
	skillParticles = new GameObject[3,4];
	
	if(gameController.characterSelected[2] == 2){ 
		skillParticles[2,0] = GameObject.FindGameObjectWithTag("EnemyCharacter").transform.Find("Particles").Find("Flame").gameObject; 
		skillParticles[2,1] = GameObject.FindGameObjectWithTag("EnemyCharacter").transform.Find("Particles").Find("FreezingFog").gameObject;
		skillParticles[2,1].GetComponent(FreezingFog).BreakOff(); 
	}
	else if(gameController.characterSelected[2] == 3){
		skillParticles[2,0] = GameObject.FindGameObjectWithTag("EnemyCharacter").transform.Find("Particles").Find("BlackHole").gameObject;
		skillParticles[2,0].GetComponent(BlackHole).BreakOff();
	}
	
	//if leonardo	
	if(gameController.characterSelected[2] == 2)	{
		StartCoroutine("BuffAura", 2);
	}
	
	doomEnded = true; //... for now
	
}

//Ralph-----------------------------------------------------------------------------------------------Ralph
function RalphSkillOne (charNumber : int) {
	seeking = true;
	RangeCheck(charNumber, 8, "RalphSkillOneCo", RalphSkillOne, gameController.skillTargetLocations[charNumber]);
}

function RalphSkillOneCo (charNumber : int) { 
	for(var i : int = 0; i < 2; i++)	{
		if(i == 1 && !gameController.stunned[charNumber])	{
			AreaPathFinish(charNumber);
			
			//apply skill effect
			RuntKick(charNumber, gameController.skillTargetLocations[charNumber]);
			
			//skill done, unfreeze
			gameController.frozen[charNumber] = false;			
			gameController.skillsExecuting[charNumber, 0] = false;
			gameController.anims[charNumber].Idle();
	
			//start the cooldown
			Cooldown(charNumber,0,6.0);
		}
		else	{
			//keep track of what skills are on
			gameController.skillsExecuting[charNumber, 0] = true;
			
			//freeze ralph while hes animated
			gameController.frozen[charNumber] = true;
			seeking = false;
			gameController.aiPaths[charNumber].canMove = false;
			gameController.aiPaths[charNumber].canSearch = false;
			
			//play sound
			if(!playerData.effectMuted) {
				skillSoundEffects[0].transform.position = gameController.targetObjects[charNumber].transform.position;
				skillSoundEffects[0].volume = playerData.effectVolume/100.0;
				skillSoundEffects[0].Play();
			}
			
			//animate
			gameController.anims[charNumber].SkillOne();
			
			yield WaitForSeconds(0.633);
		}
	}
}			

function RalphSkillTwo (charNumber : int) {	StartCoroutine("RalphSkillTwoCo", charNumber); }
function RalphSkillTwoCo (charNumber : int) { 
	for(var i : int = 0; i < 2; i++)	{
		if(i == 1)		{
			SelfPathFinish(charNumber);
			
			//show particles
			var parTran : Transform = gameController.targetObjects[charNumber].transform.Find("Heal");
			PlayParticle(parTran, 1, false);
			EndParticle(parTran, 10.0f);
			//apply skill effect
			BuffHealthRegen(charNumber, 15*gameController.skillLevels[charNumber,1], 5.0f);
			gameController.frozen[charNumber] = false;
			gameController.skillsExecuting[charNumber, 1] = false;
			gameController.anims[charNumber].Idle();
			
			//start the cooldown
			Cooldown(charNumber,1,24-(2*gameController.skillLevels[charNumber,1]));	
		}
		else		{
			//keep track of what skills are on
			gameController.skillsExecuting[charNumber, 1] = true;
			
			//freeze ralph while hes animated
			gameController.frozen[charNumber] = true;
			seeking = false;
			gameController.aiPaths[charNumber].canMove = false;
			gameController.aiPaths[charNumber].canSearch = false;
			
			if(!playerData.effectMuted) {
				//play sound
				skillSoundEffects[1].transform.position = gameController.targetObjects[charNumber].transform.position;
				skillSoundEffects[1].volume = playerData.effectVolume/100.0;
				skillSoundEffects[1].Play();
			}
			
			//animate
			gameController.anims[charNumber].SkillTwo();
			
			yield WaitForSeconds(0.5);
		}
	}
}

function RalphSkillThree (charNumber : int, needsAnimation : boolean) {		
	//passive skill
	var skillLevel : int = gameController.skillLevels[charNumber, 2];
	var buffAmount : int = skillLevel * 10;
	gameController.damageReductions[charNumber] += buffAmount;
	gameController.hasRalphDefense[charNumber] = true;
	if(!playerData.effectMuted) {
		//play sound
		skillSoundEffects[2].transform.position = gameController.targetObjects[charNumber].transform.position;
		skillSoundEffects[2].volume = playerData.effectVolume/100.0;
		skillSoundEffects[2].Play();	
	}
	//animate
	if(needsAnimation) {	PlayParticle(gameController.targetObjects[charNumber].transform.Find("Shield"), 0.9, false);	}
	//removal
	RalphBuffChecker(charNumber, buffAmount, skillLevel);
}

function RalphBuffChecker (charNumber : int, buffAmount : int, originalLevel : int) {
	for(;;) {
		if(gameController.currentHealths[charNumber]/gameController.maxHealths[charNumber] > 0.255 || gameController.currentHealths[charNumber] < 1) {
			//remove buff
			var parSys : Transform = gameController.targetObjects[charNumber].transform.Find("Shield");
			parSys.particleSystem.Stop();
			parSys.particleSystem.Clear();			
			gameController.damageReductions[charNumber] -= buffAmount;
			gameController.hasRalphDefense[charNumber] = false;
			break;
		}
		 else if(gameController.skillLevels[charNumber, 2] != originalLevel) {
			//update buff
			gameController.damageReductions[charNumber] -= buffAmount;
			RalphSkillThree(charNumber, false);
			break;
		}
		else {
			yield WaitForSeconds(0.1);
		}
	}
}

function RalphSkillFour (charNumber : int) {
	seeking = true;
	RangeCheck(charNumber, 8, "RalphSkillFourCo", RalphSkillFour, gameController.skillTargetLocations[charNumber]);
}

function RalphSkillFourCo (charNumber : int) { 
	for(var i : int = 0; i < 2; i++)	{
		if(i == 1)		{
			AreaPathFinish(charNumber);
			
			//apply skill effect
			SummonBob(charNumber);
			
			//skill done, unfreeze
			gameController.frozen[charNumber] = false;			
			gameController.skillsExecuting[charNumber, 3] = false;
			gameController.anims[charNumber].Idle();
			
			//start the cooldown
			Cooldown(charNumber,3,60);	
		}
		else		{
			//keep track of what skills are on
			gameController.skillsExecuting[charNumber, 3] = true;
			
			//freeze ralph while hes animated
			gameController.frozen[charNumber] = true;
			seeking = false;
			gameController.aiPaths[charNumber].canMove = false;
			gameController.aiPaths[charNumber].canSearch = false;
			
			if(!playerData.effectMuted) {
				//play sound
				skillSoundEffects[3].transform.position = gameController.targetObjects[charNumber].transform.position;
				skillSoundEffects[3].volume = playerData.effectVolume/100.0;
				skillSoundEffects[3].Play();
			}
			
			//animate
			gameController.anims[charNumber].Ultimate();
			
			yield WaitForSeconds(0.767);
		}
	}
}



//Rosalind ----------------------------------------------------------------------------------------Rosalind
function RosalindSkillOne (charNumber : int) {	
	seeking = true;
	var range : int = 8; 
	if(gameController.stances[charNumber] == 0)	{		
		range += gameController.skillLevels[charNumber, 0] * 2;
	}
	RangeCheck(charNumber, range, "RosalindSkillOneCo", RosalindSkillOne, gameController.targetObjects[gameController.currentTargets[charNumber]].transform.position, 1);
}

function RosalindSkillOneCo (charNumber : int) {
	for(var i : int = 0; i < 2; i++)	{
		if(i == 1)		{	
			//remove insight
			gameController.currentResources[charNumber] -= gameController.skillCosts[charNumber,0];
			
			//start movement
			gameController.moveTarget[charNumber] = gameController.targetObjects[gameController.currentTargets[charNumber]].collider.ClosestPointOnBounds(
				gameController.targetObjects[charNumber].transform.position);
				
			//EVIL MAGIC NUMBER = end of stage, past that is oblivion
			if(gameController.moveTarget[charNumber].x > 80)		{
				//unfreeze
				gameController.moveTarget[charNumber] = gameController.targetObjects[charNumber].transform.position;
				gameController.frozen[charNumber] = false;
				gameController.skillsExecuting[charNumber, 0] = false;
				gameController.anims[charNumber].Idle();
				break;
			}			
			
			var targetRotation : Quaternion = Quaternion.LookRotation(gameController.moveTarget[charNumber] - gameController.targetObjects[charNumber].transform.position);
			gameController.targetObjects[charNumber].transform.rotation = targetRotation;
			gameController.targetObjects[charNumber].transform.rotation.x = 0;
			gameController.targetObjects[charNumber].transform.rotation.z = 0;
			
			var dist : float = Vector3.Distance(gameController.targetObjects[charNumber].transform.position, gameController.targetObjects[gameController.currentTargets[charNumber]].transform.position);
			
			//go
			MoveToTarget(charNumber, gameController.moveTarget[charNumber], dist, RosalindSkillOneEnd);
		}	
		else	{
			//keep track of what skills are on
			gameController.skillsExecuting[charNumber, 0] = true;
			
			//freeze while animated
			gameController.frozen[charNumber] = true;
			seeking = false;
			gameController.aiPaths[charNumber].canMove = false;
			gameController.aiPaths[charNumber].canSearch = false;
			
			if(!playerData.effectMuted) {
				//play sound
				skillSoundEffects[0].transform.position = gameController.targetObjects[charNumber].transform.position;
				skillSoundEffects[0].volume = playerData.effectVolume/100.0;
				skillSoundEffects[0].Play();
			}
			
			//animate
			gameController.anims[charNumber].SkillOne(gameController.stances[charNumber]);			
			
			yield WaitForSeconds(0.4);
		}
	}	
}

function StartFlecheSound (toucheSound : AudioSource) {
	for(var i : int = 0; i < 2; i++){
		switch(i) {
		case 0:			
			skillSoundEffects[3].volume = playerData.effectVolume/100.0;
			skillSoundEffects[3].pitch = 1.8;
			skillSoundEffects[3].Play();
			yield WaitForSeconds(0.2);
			break;
		case 1:
			skillSoundEffects[3].pitch = 0.8;
			skillSoundEffects[4].Play();
			break;	
		}
	}
}

function RosalindSkillOneEnd (charNumber : int)	{
	//ensure correct pathing	
	AreaPathFinish(charNumber);
	
	if(gameController.currentHealths[gameController.currentTargets[charNumber]] >= 1) {		
		//apply ending skill effect
		gameController.Damage(200 *gameController.skillLevels[charNumber,0],charNumber,gameController.currentTargets[charNumber]);
		
		if(gameController.stances[charNumber] != 0)		{		
			DebuffHealthRegen(gameController.currentTargets[charNumber], 0.15 * gameController.skillLevels[charNumber,0], 3);
		}
	}	
	else {
		skillTargets[charNumber].position = gameController.targetObjects[charNumber].transform.position;
		gameController.aiPaths[charNumber].target = skillTargets[charNumber];	
	}	
	
	//skill done, unfreeze
	gameController.frozen[charNumber] = false;			
	gameController.skillsExecuting[charNumber, 0] = false;
	gameController.anims[charNumber].Idle();
	
	//start the cooldown
	Cooldown(charNumber,0,6-gameController.skillLevels[charNumber,0]);	
}

function RosalindSkillTwo (charNumber : int)	{
	StartCoroutine("RosalindSkillTwoCo", charNumber);
}

function RosalindSkillTwoCo (charNumber : int)	{								
	//remove insight
	gameController.currentResources[charNumber] -= gameController.skillCosts[charNumber,1];
	
	//apply skill effect
	if(gameController.stances[charNumber] == 0)			{		
		BuffDamageReduction(charNumber, 15*gameController.skillLevels[charNumber,1], 3.0f);
	}
	else			{
		BuffLifeSteal(charNumber, 5*gameController.skillLevels[charNumber,1], 3.0f);
		BuffDamageReduction(charNumber, 10*gameController.skillLevels[charNumber,1], 3.0f);
	}
	
	if(!playerData.effectMuted) {
		//play sound
		skillSoundEffects[1].transform.position = gameController.targetObjects[charNumber].transform.position;
		skillSoundEffects[1].volume = playerData.effectVolume/100.0;
		skillSoundEffects[1].Play();
	}
	
	//show particle
	var parTran : Transform = gameController.targetObjects[charNumber].transform.Find("Shield");
	PlayParticle(parTran, 0.2, false);
	EndParticle(parTran, 3.0f);
	
	//start the cooldown
	Cooldown(charNumber,1,13-gameController.skillLevels[charNumber,1]);			
}

function EndParticle (particle : Transform, duration : float) {
	for(var i : int = 0; i < 2; i++)	{
		if(i == 0)		{
			yield WaitForSeconds(duration);
		}
		else {
			particle.particleSystem.Stop();
			particle.particleSystem.Clear();
			break;
		}
	}
}

function StopParticle (particle : Transform) {
	particle.particleSystem.Stop();
	particle.particleSystem.Clear();
	return;
}

function PlayParticle (particle : Transform, duration : float, needsStop : boolean) {
	for(var i : int = 0; i < 2; i++)	{
		if(i == 0)		{
			particle.particleSystem.Stop();
			particle.particleSystem.Clear();
			particle.particleSystem.Play();
			yield WaitForSeconds(duration);
		}
		else {
			if(needsStop){ particle.particleSystem.Stop(); }
			else { particle.particleSystem.Pause(); }
			break;
		}
	}
}

function RosalindSkillThree (charNumber : int)	{
	StartCoroutine("RosalindSkillThreeCo", charNumber);
}

function RosalindSkillThreeCo (charNumber : int)	{
	//remove insight
	gameController.currentResources[charNumber] -= gameController.skillCosts[charNumber,2];
	
	//apply skill effect			
	if(gameController.stances[charNumber] == 0)		{
		//change stance
		gameController.stances[charNumber] = 1;
		
		if(!playerData.effectMuted) {
			//play sound
			skillSoundEffects[3].transform.position = gameController.targetObjects[charNumber].transform.position;
			skillSoundEffects[3].volume = playerData.effectVolume/100.0;
			StartFlecheSound(skillSoundEffects[3]);
		}
		
		//remove current bonus				
		gameController.movementSpeeds[charNumber] -= msBonus;
		gameController.aiPaths[charNumber].speed -= msBonus;
		
		//save new bonus
		asBonus = gameController.attackSpeeds[charNumber] * (0.15 * gameController.skillLevels[charNumber,2] + 0.05);				
		//apply new bonus
		gameController.attackSpeeds[charNumber] += asBonus;	
		
		//flip particles
		var oldPart : Transform = gameController.targetObjects[charNumber].transform.Find("Grace");
		oldPart.particleSystem.Stop();
		oldPart.particleSystem.Clear();
		PlayParticle(gameController.targetObjects[charNumber].transform.Find("Finesse"), 0.8, false);
					
	}
	else			{
		gameController.stances[charNumber] = 0;				
		
		if(!playerData.effectMuted) {
			//play sound
			skillSoundEffects[2].transform.position = gameController.targetObjects[charNumber].transform.position;
			skillSoundEffects[2].volume = playerData.effectVolume/100.0;
			skillSoundEffects[2].Play();	
		}
		
		//remove old
		gameController.attackSpeeds[charNumber] -= asBonus;
		//save new
		msBonus	= gameController.movementSpeeds[charNumber] * (0.15 * gameController.skillLevels[charNumber,2] + 0.05);
		//apply new
		gameController.movementSpeeds[charNumber] += msBonus;
		gameController.aiPaths[charNumber].speed += msBonus;
		
		//flip particles
		var oldPart2 : Transform = gameController.targetObjects[charNumber].transform.Find("Finesse");
		oldPart2.particleSystem.Stop();
		oldPart2.particleSystem.Clear();
		PlayParticle(gameController.targetObjects[charNumber].transform.Find("Grace"), 0.8, false);
	}
	
	//start the cooldown
	Cooldown(charNumber,2,3);		
}

function RosalindSkillFour (charNumber : int)	{
	seeking = true;
	RangeCheck(charNumber, 4, "RosalindSkillFourCo", RosalindSkillFour, gameController.targetObjects[gameController.currentTargets[charNumber]].transform.position, 1);
}

function RosalindSkillFourCo (charNumber : int) {
	for(var i : int = 0; i < 2; i++)	{
		if(i == 1)		{
			//remove insight
			gameController.currentResources[charNumber] -= gameController.skillCosts[charNumber,3];
			
			AreaPathFinish(charNumber);
			
			//apply skill effect
			var damageAmount : int = (gameController.maxHealths[gameController.currentTargets[charNumber]] - gameController.currentHealths[gameController.currentTargets[charNumber]])*0.35; 
			
			if(gameController.stances[charNumber] == 0)		{
				gameController.currentResources[charNumber] = 100;
				for(var j : int = 0; j < 2; j++) {
					gameController.cooldownTimers[charNumber, j] = 0;
				}
				gameController.Damage(damageAmount,charNumber,gameController.currentTargets[charNumber]);		
				
			}
			else	{
				gameController.Damage(damageAmount,charNumber,gameController.currentTargets[charNumber], 75);
			}
			
			//skill done, unfreeze
			gameController.frozen[charNumber] = false;
			gameController.skillsExecuting[charNumber, 3] = false;
			gameController.anims[charNumber].Idle();	
			
			//start the cooldown
			Cooldown(charNumber,3,60);	
		}
		else		{
			//keep track of what skills are on
			gameController.skillsExecuting[charNumber, 3] = true;
			
			//freeze while animated
			gameController.frozen[charNumber] = true;
			seeking = false;
			gameController.aiPaths[charNumber].canMove = false;
			gameController.aiPaths[charNumber].canSearch = false;
			
			if(!playerData.effectMuted) {
				//play sound		
				skillSoundEffects[4].transform.position = gameController.targetObjects[charNumber].transform.position;	
				StartCoroutine("StartToucheSound");	
			}	
			
			//animate
			gameController.anims[charNumber].Ultimate(gameController.stances[charNumber]);
			//show particle
			PlayParticle(gameController.targetObjects[charNumber].transform.Find("Touche"), 1.2, true);
			
			yield WaitForSeconds(0.75);
		}
	}
}

function StartToucheSound () {
	for(var i : int = 0; i < 3; i++){
		switch(i) {
		case 0:			
			skillSoundEffects[4].volume = playerData.effectVolume/100.0;
			skillSoundEffects[4].pitch = 1.2;
			skillSoundEffects[4].Play();
			yield WaitForSeconds(0.55);
			break;
		case 1:
			skillSoundEffects[4].Play();
			yield WaitForSeconds(0.75);
			break;
		case 2:
			skillSoundEffects[4].Play();
			break;
		}	
	}
}

//Leonardo---------------------------------------------------------------------------------------Leonardo	
function LeonardoSkillOne (charNumber : int)	{
	seeking = true;
	RangeCheck(charNumber, 9, "LeonardoSkillOneCo", LeonardoSkillOne, gameController.skillTargetLocations[charNumber]);
}

function LeonardoSkillOneCo (charNumber : int)	{
	for(var i : int = 0; i < 2; i++)	{
		if(i == 1 && !gameController.stunned[charNumber])		{
			//remove mana
			gameController.currentResources[charNumber] -= gameController.skillCosts[charNumber,0];
			
			RemoveAllAuras(charNumber);
			gameController.stances[charNumber] = 1;
			var auraPar : Transform = gameController.targetObjects[charNumber].transform.Find("Aura");
			auraPar.particleSystem.startColor = fireAura;
			PlayParticle(auraPar, 0.8, false);
			//start nudger
			Nudger(charNumber, 1.0);
			//apply skill effect
			StartCoroutine("ShootFlames", charNumber);				
		}
		else		{
			//keep track of what skills are on
			gameController.skillsExecuting[charNumber, 0] = true;
			
			//freeze while animated
			gameController.frozen[charNumber] = true;
			seeking = false;
			gameController.aiPaths[charNumber].canMove = false;
			gameController.aiPaths[charNumber].canSearch = false;
			
			//animate
			gameController.anims[charNumber].SkillOne();			
			
			yield WaitForSeconds(1.0);
		}
	}
}	

function ShootFlames (charNumber : int)	{
	for(var i : int = 0; i < 2; i++)	{
		if(i == 1)		{
			AreaPathFinish(charNumber);
			
			//remove flames
			skillParticles[charNumber, 0].transform.localPosition = Vector3(-500,2.5,2);
			skillParticles[charNumber, 0].particleSystem.Stop();			
			
			//unfreeze
			gameController.frozen[charNumber] = false;
			gameController.anims[charNumber].Idle();
			gameController.skillsExecuting[charNumber, 0] = false;
		}
		else		{
			gameController.targetObjects[charNumber].transform.rotation.x = 0;
			gameController.targetObjects[charNumber].transform.rotation.z = 0;
			
			if(!playerData.effectMuted) {
				//play sound
				skillSoundEffects[0].transform.position = gameController.targetObjects[charNumber].transform.position;
				skillSoundEffects[0].volume = playerData.effectVolume/100.0;
				skillSoundEffects[0].Play();	
			}	
			
			//call flames
			skillParticles[charNumber, 0].particleSystem.Play();
			skillParticles[charNumber, 0].transform.localPosition = Vector3(0,2.5,2);
			
			//start the cooldown
			Cooldown(charNumber,0,5);				
			
			yield WaitForSeconds(1.0);
		}
	}
}

function LeonardoSkillTwo (charNumber : int)	{
	seeking = true;
	RangeCheck(charNumber, 15, "LeonardoSkillTwoCo", LeonardoSkillTwo, gameController.skillTargetLocations[charNumber]);
}

function LeonardoSkillTwoCo (charNumber : int)	{
	for(var i : int = 0; i < 2; i++)	{
		if(i == 1 && !gameController.stunned[charNumber])		{
			//remove mana
			gameController.currentResources[charNumber] -= gameController.skillCosts[charNumber,1];
			
			//pathing
			AreaPathFinish(charNumber);
			//stance
			RemoveAllAuras(charNumber);
			gameController.stances[charNumber] = 2;
			var auraPar : Transform = gameController.targetObjects[charNumber].transform.Find("Aura");
			auraPar.particleSystem.startColor = iceAura;
			PlayParticle(auraPar, 0.8, false);
			
			//start nudger
			Nudger(charNumber, 3.0);
			
			if(!playerData.effectMuted) {
				//play sound
				skillSoundEffects[1].transform.position = gameController.targetObjects[charNumber].transform.position;
				skillSoundEffects[1].volume = playerData.effectVolume/100.0;
				skillSoundEffects[1].Play();	
			}	
			
			//apply skill effect			
			PlaceFog(charNumber);
			
			//unfreeze
			gameController.frozen[charNumber] = false;
			gameController.skillsExecuting[charNumber, 1] = false;
			gameController.anims[charNumber].Idle();
			
			//start the cooldown
			Cooldown(charNumber,1,10);	
		}
		else		{
			//keep track of what skills are on
			gameController.skillsExecuting[charNumber, 1] = true;
			
			//freeze while animated
			gameController.frozen[charNumber] = true;
			seeking = false;
			gameController.aiPaths[charNumber].canMove = false;
			gameController.aiPaths[charNumber].canSearch = false;
			
			//animate
			gameController.anims[charNumber].SkillTwo();			
			
			yield WaitForSeconds(0.833);
		}
	}
}

function PlaceFog (charNumber : int)	{
	for(var i : int = 0; i < 2; i++)	{
		if(i == 1)		{
			//remove fog
			skillParticles[charNumber, 1].transform.position = Vector3(-450,2.5,2);
			skillParticles[charNumber, 1].particleSystem.Stop();
		}
		else		{
			//call fog
			skillParticles[charNumber, 1].particleSystem.Play();
			var target : Vector3 = gameController.skillTargetLocations[charNumber];
			target.y = 5;
			skillParticles[charNumber, 1].transform.position = target;			
			
			yield WaitForSeconds(3.0);
		}
	}
}

function LeonardoSkillThree (charNumber : int) {
	StartCoroutine("LeonardoSkillThreeCo", charNumber);
}

function LeonardoSkillThreeCo (charNumber : int) {
	for(var i : int = 0; i < 2; i++)	{
		if(i == 1 && !gameController.stunned[charNumber])		{
			//remove mana
			gameController.currentResources[charNumber] -= gameController.skillCosts[charNumber,2];		
			
			SelfPathFinish(charNumber);			
			//stance
			RemoveAllAuras(charNumber);
			gameController.stances[charNumber] = 3;
			var auraPar : Transform = gameController.targetObjects[charNumber].transform.Find("Aura");
			auraPar.particleSystem.startColor = earthAura;
			PlayParticle(auraPar, 0.8, false);
			//apply skill effect
			SummonSpider(charNumber);				
			//unfreeze
			gameController.frozen[charNumber] = false;
			gameController.skillsExecuting[charNumber, 2] = false;
			gameController.anims[charNumber].Idle();
			
			//start the cooldown
			Cooldown(charNumber,2,15);	
		}
		else		{
			if(!playerData.effectMuted) {
				//play sound
				skillSoundEffects[2].transform.position = gameController.targetObjects[charNumber].transform.position;
				skillSoundEffects[2].volume = playerData.effectVolume/100.0;
				StartCoroutine("StartSpiderSound");	
			}			
			//keep track of what skills are on
			gameController.skillsExecuting[charNumber, 2] = true;			
			//freeze while animated
			gameController.frozen[charNumber] = true;
			seeking = false;
			gameController.aiPaths[charNumber].canMove = false;	
			gameController.aiPaths[charNumber].canSearch = false;		
			//animate
			gameController.anims[charNumber].SkillThree();			
				
			yield WaitForSeconds(1.333);
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
		case 2:
			skillSoundEffects[2].pitch = 0.9;
			skillSoundEffects[2].Play();
			break;
		}	
	}
}

function LeonardoSkillFour (charNumber : int){	StartCoroutine("LeonardoSkillFourCo", charNumber); }
function LeonardoSkillFourCo (charNumber : int){
	for(var i : int = 0; i < 2; i++)	{
		if(i == 1)		{
			//remove mana
			gameController.currentResources[charNumber] -= gameController.skillCosts[charNumber,3];
			
			if(!playerData.effectMuted) {
				//play sound
				skillSoundEffects[3].transform.position = gameController.targetObjects[charNumber].transform.position;
				skillSoundEffects[3].volume = playerData.effectVolume/100.0;
				skillSoundEffects[3].pitch = 1;
				skillSoundEffects[3].Play();	
			}	
			
			//apply skill effect
			RemoveAllAuras(charNumber);
			auraMultiplier = 2;			
			FormBuff(charNumber);
			StartCoroutine("ChangeForm", charNumber);
			FocusDebuffs(charNumber);
			break;
		}
		else		{
			//keep track of what skills are on
			gameController.skillsExecuting[charNumber, 3] = true;
			
			//freeze while animated
			gameController.frozen[charNumber] = true;
			seeking = false;
			gameController.aiPaths[charNumber].canMove = false;
			gameController.aiPaths[charNumber].canSearch = false;
			
			//animate
			gameController.anims[charNumber].Ultimate();			
			
			yield WaitForSeconds(0.433);
		}
	}
}

function ChangeForm (charNumber : int)	{
	var originalAnim : CharacterAnimation;	
	for(var i : int = 0; i < 2; i++)	{
		if(i == 1)		{				
			//restore visuals			
			gameController.anims[charNumber] = originalAnim;
			gameController.targetObjects[charNumber].transform.Find("Ice Golem").renderer.enabled = true;
			gameController.targetObjects[charNumber].transform.localScale = Vector3(3.5, 3.5, 3.5);
			gameController.anims[charNumber].Idle();
						
			if(!playerData.effectMuted) {
				//play sound
				skillSoundEffects[3].transform.position = gameController.targetObjects[charNumber].transform.position;
				skillSoundEffects[3].volume = playerData.effectVolume/100.0;
				skillSoundEffects[3].pitch = 1.5;
				skillSoundEffects[3].Play();	
			}
			
			//fire
			if(gameController.stances[charNumber] == 1)			{		
				gameController.targetObjects[charNumber].transform.Find("FireForm").localPosition = Vector3(-500, 0, -500);
			}
			//earth
			else if(gameController.stances[charNumber] == 3)			{
				gameController.targetObjects[charNumber].transform.Find("EarthForm").localPosition = Vector3(-500, 0, -500);
			}
			//ice
			else			{
				gameController.targetObjects[charNumber].transform.Find("IceForm").localPosition = Vector3(-500, 0, -500);
			}	
			
			//end skill
			gameController.skillsExecuting[charNumber, 3] = false;			
			//reset auras
			RemoveAllAuras(charNumber);
			auraMultiplier = 1;						
			
			//start the cooldown
			Cooldown(charNumber,3,60);	//60
		}
		else		{
			//change visuals
			gameController.anims[charNumber].Idle();
			originalAnim = gameController.anims[charNumber];
			gameController.targetObjects[charNumber].transform.Find("Ice Golem").renderer.enabled = false;

			//fire
			if(gameController.stances[charNumber] == 1)			{		
				gameController.targetObjects[charNumber].transform.localScale = Vector3(5, 4.5, 5);
				gameController.targetObjects[charNumber].transform.Find("FireForm").localPosition = Vector3(0, 0, 0);
				gameController.anims[charNumber] = gameController.targetObjects[charNumber].transform.Find("FireForm").gameObject.GetComponent(CharacterAnimation);
			}
			//earth
			else if(gameController.stances[charNumber] == 3)			{
				gameController.targetObjects[charNumber].transform.localScale = Vector3(4, 7, 4);
				gameController.targetObjects[charNumber].transform.Find("EarthForm").localPosition = Vector3(0, 0, 0);
				gameController.anims[charNumber] = gameController.targetObjects[charNumber].transform.Find("EarthForm").gameObject.GetComponent(CharacterAnimation);
			}
			//ice
			else			{
				gameController.targetObjects[charNumber].transform.localScale = Vector3(7.5, 5.5, 7.5);
				gameController.targetObjects[charNumber].transform.Find("IceForm").localPosition = Vector3(0, 0, 0);
				gameController.anims[charNumber] = gameController.targetObjects[charNumber].transform.Find("IceForm").gameObject.GetComponent(CharacterAnimation);
			}
							
			gameController.anims[charNumber].Idle();
			//pathing
			SelfPathFinish(charNumber);			
			//unfreeze
			gameController.frozen[charNumber] = false;
				
			yield WaitForSeconds(6);
		}
	}
}

//Graviton-----------------------------------------------------------------------------------------Graviton
function CheckFluctuate (charNumber : int ) { 
	if(!fluctuating) {
		var manaPercent : float = gameController.currentResources[charNumber]/gameController.maxResources[charNumber];
		if(manaPercent <= 0.25)	{
			fluctuating = true;
			//play sound
			if(!playerData.effectMuted) {
				skillSoundEffects[5].transform.position = gameController.targetObjects[charNumber].transform.position;
				skillSoundEffects[5].volume = playerData.effectVolume/100.0;
				skillSoundEffects[5].Play();
			}
			PlayParticle(gameController.targetObjects[charNumber].transform.Find("Fluctuate"), 0.9, false);
			Fluctuate(charNumber);
		}
	}
}

function Fluctuate (charNumber : int) {
	for(;;)	{
		var manaPercent : float = gameController.currentResources[charNumber]/gameController.maxResources[charNumber];
		if(manaPercent > 0.26)		{ 
			EndFluctuate(charNumber);
			break;
		}
		else {
			yield WaitForSeconds(0.1);
		}	
	}
}

function EndFluctuate (charNumber : int) {
	fluctuating = false;
	StopParticle(gameController.targetObjects[charNumber].transform.Find("Fluctuate"));
}

function GravitonSkillOne (charNumber : int)	{	
	seeking = true;
	RangeCheck(charNumber, 15, "GravitonSkillOneCo", GravitonSkillOne, gameController.targetObjects[gameController.currentTargets[charNumber]].transform.position, 1);
}

function GravitonSkillOneCo (charNumber : int) {
	for(var i : int = 0; i < 2; i++)	{
		if(i == 1)		{
			//apply skill effect			
			var target : int = gameController.currentTargets[charNumber];
			var targetPar : Transform = gameController.targetObjects[target].transform.Find("GravityWell");
			//play sound
			if(!playerData.effectMuted) {
				skillSoundEffects[0].transform.position = gameController.targetObjects[charNumber].transform.position;
				skillSoundEffects[0].volume = playerData.effectVolume/100.0;
				skillSoundEffects[0].Play();
			}
			PlayParticle(targetPar, 0.6, false);
			EndParticle(targetPar, gravityWellDuration);			
			//fluctuating
			if(fluctuating)			{	
				//slow target		
				DebuffMovementSpeed(target, 0.5, gravityWellDuration);
				targetPar = gameController.targetObjects[target].transform.Find("Gravity");
				targetPar.particleSystem.Play();
				EndParticle(targetPar, gravityWellDuration);
			}
			
			//remove mana
			gameController.currentResources[charNumber] -= gameController.skillCosts[charNumber,0];
			CheckFluctuate(charNumber);
			
			//apply slow aura to target
			var teamNumber : int = 1;	var enemyNumber : int = 2;
			if(charNumber == 2)		{	teamNumber = 0;	enemyNumber = 1;	}
			SlowAura(teamNumber, enemyNumber, target, 0.5);
			
			//ensure correct pathing
			AreaPathFinish(charNumber);
			
			//damage target
			gameController.DamageOverTime(charNumber, target, 50*gameController.skillLevels[charNumber,0], 5.0);
							
			gameController.frozen[charNumber] = false;
			gameController.skillsExecuting[charNumber, 0] = false;
			gameController.anims[charNumber].Idle();
			
			//start the cooldown
			Cooldown(charNumber,0,6);	
		}
		else		{
			//keep track of what skills are on
			gameController.skillsExecuting[charNumber, 0] = true;
			
			//freeze while animated
			gameController.frozen[charNumber] = true;
			seeking = false;
			gameController.aiPaths[charNumber].canMove = false;
			gameController.aiPaths[charNumber].canSearch = false;
			
			//animate
			gameController.anims[charNumber].SkillOne(gameController.stances[charNumber]);
			
			yield WaitForSeconds(1);
		}
	}
}

function GravitonSkillTwo (charNumber : int) {	StartCoroutine("GravitonSkillTwoCo", charNumber); }

function GravitonSkillTwoCo (charNumber : int) {
	var teamNumber : int = 1;
	var enemyNumber : int = 2;
	if(charNumber == 2) { teamNumber = 0; enemyNumber = 1;}
	for(var i : int = 0; i < 2; i++)	{
		if(i == 1)		{
			//ensure correct pathing
			SelfPathFinish(charNumber);
			//play sound
			if(!playerData.effectMuted) {
				skillSoundEffects[1].transform.position = gameController.targetObjects[charNumber].transform.position;
				skillSoundEffects[1].volume = playerData.effectVolume/100.0;
				skillSoundEffects[1].Play();
			}
			//apply skill effect			
			var targetLocation : Vector3 = gameController.targetObjects[charNumber].transform.position;;
			
			//for each enemy thats not a structure or bob
			//monster
			GravitonSkillTwoCheck(charNumber,0,targetLocation);
			//characer
			GravitonSkillTwoCheck(charNumber,enemyNumber,targetLocation);
			//everything else
			for(var j : int = 7+teamNumber; j < 35; j+=2)			{
				GravitonSkillTwoCheck(charNumber,j,targetLocation);
			}
			
			//remove mana
			gameController.currentResources[charNumber] -= gameController.skillCosts[charNumber,1];
			CheckFluctuate(charNumber);
			
			gameController.frozen[charNumber] = false;
			gameController.skillsExecuting[charNumber, 1] = false;
			gameController.anims[charNumber].Idle();
			
			//start the cooldown
			Cooldown(charNumber,1,14-2*gameController.skillLevels[charNumber,1]);	
		}
		else		{
			//keep track of what skills are on
			gameController.skillsExecuting[charNumber, 1] = true;
			
			//freeze while animated
			gameController.frozen[charNumber] = true;
			seeking = false;
			gameController.aiPaths[charNumber].canMove = false;
			gameController.aiPaths[charNumber].canSearch = false;
			
			//animate
			gameController.anims[charNumber].SkillTwo(gameController.stances[charNumber]);			
			
			yield WaitForSeconds(1.5);
		}
	}
}

function GravitonSkillTwoCheck (charNumber : int, unitNumber : int, targetLocation : Vector3) {
	//if within the skills range
	var unitDist : float = Vector3.Distance(targetLocation, gameController.targetObjects[unitNumber].collider.ClosestPointOnBounds(targetLocation));
	if(unitDist < 10)	{
		//knock up and damage
		KnockUp(charNumber, unitNumber);
		
		//if fluctuating
		if(fluctuating)		{
			//push away
			PushAway(charNumber, unitNumber, gameController.targetObjects[charNumber].transform.position);			
		}
	}
}

function GravitonSkillThree (charNumber : int) {	
	seeking = true;
	RangeCheck(charNumber, 15, "GravitonSkillThreeCo", GravitonSkillThree, gameController.skillTargetLocations[charNumber], 0);
}

function GravitonSkillThreeCo (charNumber : int) {
	var particleTransform : Transform;
	for(var i : int = 0; i < 2; i++) {
		if(i == 0) {  
			//keep track of what skills are on
			gameController.skillsExecuting[charNumber, 2] = true;
			
			//freeze while animated
			gameController.frozen[charNumber] = true;
			seeking = false;
			gameController.aiPaths[charNumber].canMove = false;
			gameController.aiPaths[charNumber].canSearch = false;
			
			//play sound
			if(!playerData.effectMuted) {
				skillSoundEffects[2].transform.position = gameController.targetObjects[charNumber].transform.position;
				skillSoundEffects[2].volume = playerData.effectVolume/100.0;
				skillSoundEffects[2].Play();
			}
			//nudger
			Nudger(charNumber, 0.45);
			
			//remove mana
			gameController.currentResources[charNumber] -= gameController.skillCosts[charNumber,2];
			CheckFluctuate(charNumber);	
			
			//animate
			gameController.anims[charNumber].SkillThree(gameController.stances[charNumber]);
			//correct rotation
			var relativePos : Vector3 = gameController.skillTargetLocations[charNumber] - gameController.targetObjects[charNumber].transform.position;
			if(relativePos.z != 0) {
				var targetRotation : Quaternion = Quaternion.LookRotation(relativePos);
				gameController.targetObjects[charNumber].transform.rotation = targetRotation;
			}	
			gameController.targetObjects[charNumber].transform.rotation.x = 0;
			gameController.targetObjects[charNumber].transform.rotation.z = 0;
			//particle			
			particleTransform = gameController.targetObjects[charNumber].transform.Find("Pull");
			particleTransform.particleSystem.Play();
			var boxCol : BoxCollider =  particleTransform.Find("PullBox").collider;
			boxCol.enabled = true;
			boxCol.center = Vector3.zero;
			particleTransform.animation.Play("PullBox");
			
			yield WaitForSeconds(0.45);
		}
		//failed
		else {
			skillSoundEffects[2].Stop();
			particleTransform.particleSystem.Stop();
			particleTransform.particleSystem.Clear();
			particleTransform.animation.Stop();
			particleTransform.Find("PullBox").collider.enabled = false;	
			pulling = false;
			
			//ensure correct pathing
			AreaPathFinish(charNumber);			
			//unfreeze
			gameController.frozen[charNumber] = false;
			gameController.skillsExecuting[charNumber, 2] = false;
			gameController.anims[charNumber].Idle();
			//start the cooldown
			Cooldown(charNumber,2,10);
			break;
		}
	}
}

function GravitonSkillFour (charNumber : int) {	
	seeking = true;
	RangeCheck(charNumber, 15, "GravitonSkillFourCo", GravitonSkillFour, gameController.skillTargetLocations[charNumber]);
}

function GravitonSkillFourCo (charNumber : int) {
	for(var i : int = 0; i < 2; i++)	{
		if(i == 1)	{	
			//ensure correct pathing
			AreaPathFinish(charNumber);
			Nudger(charNumber, 1.0);
			doomOrigin = gameController.skillTargetLocations[charNumber];
			doomOrigin.y = 2.5;
			doomEnded = false;			
			
			if(fluctuating) {	doomRadius = 7;	}
			else{	doomRadius = 1;	}
			
			EndWorld(charNumber, fluctuating);
			
			//remove mana
			gameController.currentResources[charNumber] -= gameController.skillCosts[charNumber,3];
			CheckFluctuate(charNumber);
			
			//unfreeze
			gameController.frozen[charNumber] = false;
			gameController.skillsExecuting[charNumber, 3] = false;
			gameController.anims[charNumber].Idle();
			
			//start the cooldown
			Cooldown(charNumber,3, 90); //90
								
		}
		else	{
			//keep track of what skills are on
			gameController.skillsExecuting[charNumber, 3] = true;
			
			//freeze while animated
			gameController.frozen[charNumber] = true;
			seeking = false;
			gameController.aiPaths[charNumber].canMove = false;
			gameController.aiPaths[charNumber].canSearch = false;
			
			//animate
			gameController.anims[charNumber].Ultimate(gameController.stances[charNumber]);
			
			yield WaitForSeconds(0.3);
		}
	}
}


function EndWorld (charNumber : int, isFluctuating : boolean) {
	var mainSystem : ParticleSystem = skillParticles[charNumber, 0].particleSystem;
	var subSystem : ParticleSystem = skillParticles[charNumber, 0].transform.Find("BlackHole").particleSystem;
	for(var i : int = 0; i < 2; i++) {
		if(i == 1)		{			
			doomEnded = true;
			//remove blackhole
			skillParticles[charNumber, 0].transform.position = Vector3(450,2.5,-450);
			mainSystem.Stop();
			mainSystem.Clear();
			
			//reset vars
			doomPulling = new boolean[35];
			
			//reset y values
			gameController.SetYPositions();				
		}
		else		{
			//color, play, and start effects
			var sphereCol : SphereCollider;
			sphereCol = skillParticles[charNumber, 0].collider;
			if(isFluctuating)				{	
				skillParticles[charNumber, 0].transform.localScale = Vector3(1,1,1);
				sphereCol.radius = 7;
			
				subSystem.startColor = Color.white;
				subSystem.playbackSpeed = 6;
				
				//call singularity
				mainSystem.Stop();
				mainSystem.Clear();
				mainSystem.Play();
				inBlackHole = new boolean[60];
				skillParticles[charNumber, 0].transform.position = doomOrigin;
				
				//play sound
				if(!playerData.effectMuted) {
					skillSoundEffects[4].transform.position = gameController.targetObjects[charNumber].transform.position;
					skillSoundEffects[4].volume = playerData.effectVolume/100.0;
					skillSoundEffects[4].Play();
				}
				
				//go boom
				Boom(charNumber);
				
				//start nudger
				Nudger(charNumber, 1.0);
	
				yield WaitForSeconds(1.0);
			}
			else		{
				skillParticles[charNumber, 0].transform.localScale = Vector3(1,1,1);
				sphereCol.radius = 1;
				
				subSystem.startColor = Color.black;	
				subSystem.playbackSpeed = 1;
				
				//call blackhole
				mainSystem.Stop();
				mainSystem.Clear();
				mainSystem.Play();
				inBlackHole = new boolean[60];
				skillParticles[charNumber, 0].transform.position = doomOrigin;
				
				//start nudger
				Nudger(charNumber, 3.0);
			
				//start damage ticks
				//start pull
				//start grow
				//play sound
				if(!playerData.effectMuted) {
					skillSoundEffects[3].transform.position = gameController.targetObjects[charNumber].transform.position;
					skillSoundEffects[3].volume = playerData.effectVolume/100.0;
					skillSoundEffects[3].Play();
				}
				EndWorldCounter(charNumber);
				
				yield WaitForSeconds(3.0);
			}
		}
	}
}

function EndWorldCounter (charNumber : int)	{
	var teamNumber : int = 1;
	var enemyNumber : int = 2;
	if(charNumber == 2) { teamNumber = 0; enemyNumber = 1;}
	
	for(var i : int = 0; i < 7; i++)	{
		if(i == 6)		{
			break;
		}
		else	{
			//damage ticks
			//for each enemy in contact, no structures
			//monster
			if(inBlackHole[0])		{
				gameController.Damage(5*gameController.levels[charNumber]*doomRadius,charNumber,0);
			}
			//enemy char
			if(inBlackHole[enemyNumber])	{
				gameController.Damage(5*gameController.levels[charNumber]*doomRadius,charNumber,enemyNumber);
			}
			//everything else but bobs
			for(var j : int = 7+teamNumber; j < 35; j+=2)	{
				if(inBlackHole[j])	{
					gameController.Damage(5*gameController.levels[charNumber]*doomRadius,charNumber,j);
				}
			}
			//bobs 	
			//player bob		
			if(enemyNumber == 1 && gameController.characterSelected[1] == 0)	{
				if(inBlackHole[35])		{
					gameController.Damage(5*gameController.levels[charNumber]*doomRadius,charNumber,35);
				}
			}
			//enemy bob		
			if(enemyNumber == 2 && gameController.characterSelected[2] == 0)	{
				if(inBlackHole[36])		{
					gameController.Damage(5*gameController.levels[charNumber]*doomRadius,charNumber,36);
				}
			}
			
			//pull enemies that arent structures or bobs
			var enemyDistance : float;
			//monster
			if(!doomPulling[0])		{
				enemyDistance = Vector3.Distance(doomOrigin, gameController.targetObjects[0].collider.ClosestPointOnBounds(doomOrigin));
				if(enemyDistance < 3 + doomRadius)		{
					doomPulling[0] = true;
					PullToDoom(0);
				}
			}
			//enemy char
			if(!doomPulling[enemyNumber])	{
				enemyDistance = Vector3.Distance(doomOrigin, gameController.targetObjects[enemyNumber].collider.ClosestPointOnBounds(doomOrigin));
				if(enemyDistance < 3 + doomRadius)	{
					doomPulling[enemyNumber] = true;
					PullToDoom(enemyNumber);
				}
			}
			//everything else
			for(var k : int = 7+teamNumber; k < 35; k+=2)	{
				if(!doomPulling[k])		{
					enemyDistance = Vector3.Distance(doomOrigin, gameController.targetObjects[k].collider.ClosestPointOnBounds(doomOrigin));
					if(enemyDistance < 3 + doomRadius)		{
						doomPulling[k] = true;
						PullToDoom(k);
					}
				}
			}
			
			//grow
			doomRadius += 1;
			var sphereCol : SphereCollider;
			sphereCol = skillParticles[charNumber, 0].collider;
			sphereCol.radius += 1;
			
			yield WaitForSeconds(0.5);
		}
	}
}

function Boom (charNumber : int) {	
	for(var i : int = 0; i < 2; i++)	{
		if(i == 1)		{
			var teamNumber : int = 1;
			var enemyNumber : int = 2;
			
			var adjustedDoomOrigin : Vector3 = doomOrigin;
			
			adjustedDoomOrigin.y = 0;
	
			
			if(charNumber == 2) { teamNumber = 0; enemyNumber = 1;}
			//damage and push
			//for each enemy in contact, no structures
			//monster
			if(inBlackHole[0])		{
				gameController.Damage(500 + gameController.maxHealths[0] * 0.5,charNumber,0); 
				BoomAway(0, adjustedDoomOrigin);
			}
			//enemy char
			if(inBlackHole[enemyNumber])	{
				gameController.Damage(500 + gameController.maxHealths[enemyNumber] * 0.5,charNumber,enemyNumber);
				BoomAway(enemyNumber, adjustedDoomOrigin);		
			}
			//everything else
			for(var j : int = 7+teamNumber; j < 37; j+=2)	{
				if(inBlackHole[j])		{
					gameController.Damage(500 + gameController.maxHealths[j] * 0.5,charNumber,j);
					BoomAway(j, adjustedDoomOrigin);
				}
			}
		}
		else	{	yield WaitForSeconds(0.15);		}
	}	
}

//other---------------------------------------------------------------------------------------------other
//performs initial check to see if skill is in range for use
function RangeCheck (charNumber : int, range : float, executeFunction : String, returnFunction : Function, targetLocation : Vector3) {
	RangeCheck(charNumber, range, executeFunction, returnFunction, targetLocation, 0);	
}
function RangeCheck (charNumber : int, range : float, executeFunction : String, returnFunction : Function, targetLocation : Vector3, targetType : int) {
	if(!seeking) { return; }
	//stop if im dead or if target is dead
	if((gameController.currentHealths[charNumber] < 1) || (targetType == 1 && gameController.currentHealths[gameController.currentTargets[charNumber]] < 1)) {
		gameController.aiPaths[charNumber].canMove = false;
		gameController.aiPaths[charNumber].canSearch = false;
		gameController.moveTarget[charNumber] = gameController.targetObjects[charNumber].transform.position;
		skillTargets[charNumber].position = gameController.targetObjects[charNumber].transform.position;
		gameController.aiPaths[charNumber].target = skillTargets[charNumber];
		gameController.anims[charNumber].Idle();
		seeking = false;
		return;
	}
	
	//check if in range
	var dist : float = Vector3.Distance(gameController.targetObjects[charNumber].transform.position, targetLocation);
	if(dist <= range)	{		
		gameController.anims[charNumber].Idle();
//		if(targetType == 0) { 
//			gameController.seekingTarget[charNumber] = false;
//		}
		StartCoroutine(executeFunction, charNumber);	
	}		
	else {
		//close the gap
		//if target is location
		if(targetType == 0)	{
			skillTargets[charNumber].position = gameController.skillTargetLocations[charNumber];
			gameController.aiPaths[charNumber].target = skillTargets[charNumber];
			if(gameController.currentHealths[charNumber] >= 1) { gameController.aiPaths[charNumber].canSearch = true; gameController.aiPaths[charNumber].canMove = true; }
			gameController.anims[charNumber].Run(gameController.movementSpeeds[charNumber]);	
			CloseGap(charNumber, range, returnFunction);
		}
		//target is unit
		else {
			gameController.aiPaths[charNumber].target = gameController.targetObjects[gameController.currentTargets[charNumber]].transform;
			if(gameController.currentHealths[charNumber] >= 1) { gameController.aiPaths[charNumber].canSearch = true; gameController.aiPaths[charNumber].canMove = true; }
			gameController.anims[charNumber].Run(gameController.movementSpeeds[charNumber]);	
			ChaseTarget(charNumber, range, returnFunction);
		}				
	}	
}

//moves character into appropriate range for skill use, can be canceled with any right click
function CloseGap (charNumber : int, range : float, originalFunction : Function) {
	var xLimit : float = -13 - gameController.attackRanges[charNumber];
	if(gameController.playerGuardianDown) { xLimit = -100; }
	else if(gameController.playerTowerDown) { xLimit = -47 - gameController.attackRanges[charNumber]; }
	for(;;) {	
		if(gameController.targetObjects[charNumber].transform.position.x < xLimit-3 || (gameController.currentHealths[1]/gameController.maxHealths[1] < 0.1 
		&& gameController.targetObjects[1].transform.position.x > xLimit-5)) {
			seeking = false;
			break;
		}
		var dist : float = Vector3.Distance(gameController.targetObjects[charNumber].transform.position, gameController.skillTargetLocations[charNumber]);
		if(dist <= range) {
			originalFunction(charNumber);
			break;
		}
		else {	gameController.moveTarget[charNumber] = gameController.targetObjects[gameController.currentTargets[charNumber]].transform.position;   yield;	}
	}
}

function ChaseTarget (charNumber : int, range : float, originalFunction : Function) {
	var xLimit : float = -13 - gameController.attackRanges[charNumber];
	if(gameController.playerGuardianDown) { xLimit = -100; }
	else if(gameController.playerTowerDown) { xLimit = -47 - gameController.attackRanges[charNumber]; }
	for(;;) {	
		if(gameController.targetObjects[charNumber].transform.position.x < xLimit-3 || (gameController.currentHealths[1]/gameController.maxHealths[1] < 0.1 
		&& gameController.targetObjects[1].transform.position.x > xLimit-5)) {
			seeking = false;
			break;
		}
		//stop if target is dead
		if(gameController.currentHealths[gameController.currentTargets[charNumber]] < 1) {
			gameController.aiPaths[charNumber].canMove = false;
			gameController.aiPaths[charNumber].canSearch = false;
			gameController.moveTarget[charNumber] = gameController.targetObjects[charNumber].transform.position;
			skillTargets[charNumber].position = gameController.targetObjects[charNumber].transform.position;
			gameController.aiPaths[charNumber].target = skillTargets[charNumber];
			gameController.anims[charNumber].Idle();
			seeking = false;
			break;
		}
		var dist : float = Vector3.Distance(gameController.targetObjects[charNumber].transform.position, 
			gameController.targetObjects[gameController.currentTargets[charNumber]].transform.position);
		if(dist <= range) {
			originalFunction(charNumber);
			break;
		}
		else {	gameController.moveTarget[charNumber] = gameController.targetObjects[gameController.currentTargets[charNumber]].transform.position;		yield;	}
	}
}

//pathing
function SelfPathFinish (charNumber : int) {
	//ensure correct pathing	
	gameController.currentTargets[charNumber] = gameController.brains[2].originalTarget;
	if(gameController.seekingTarget[charNumber] && gameController.currentHealths[gameController.currentTargets[charNumber]] >= 1) {
		gameController.moveTarget[charNumber] = gameController.targetObjects[gameController.currentTargets[charNumber]].transform.position;
		gameController.aiPaths[charNumber].target = gameController.targetObjects[gameController.currentTargets[charNumber]].transform;
		gameController.aiPaths[charNumber].canSearch = true;
		gameController.aiPaths[charNumber].canMove = true;
	}
	else if(gameController.moving[charNumber]) {
		gameController.seekingTarget[charNumber] = false;
		gameController.currentTargets[charNumber] = 38;
		gameController.aiPaths[charNumber].canSearch = true;
		gameController.aiPaths[charNumber].canMove = true;
	}
	else {		
		gameController.seekingTarget[charNumber] = false;
		gameController.currentTargets[charNumber] = 38;
		gameController.moveTarget[charNumber] = gameController.targetObjects[charNumber].transform.position;	
		skillTargets[charNumber].position = gameController.moveTarget[charNumber];
		gameController.aiPaths[charNumber].target = skillTargets[charNumber];
	}
}

function AreaPathFinish (charNumber : int) {
	//ensure correct pathing	
	gameController.currentTargets[charNumber] = gameController.brains[2].originalTarget;
	if(gameController.seekingTarget[charNumber] && gameController.currentHealths[gameController.currentTargets[charNumber]] >= 1 && gameController.currentTargets[charNumber] != 38) {
		gameController.moveTarget[charNumber] = gameController.targetObjects[gameController.currentTargets[charNumber]].transform.position;
		gameController.aiPaths[charNumber].target = gameController.targetObjects[gameController.currentTargets[charNumber]].transform;
		gameController.aiPaths[charNumber].canSearch = true;
		gameController.aiPaths[charNumber].canMove = true;
	}
	else {		
		gameController.seekingTarget[charNumber] = false;
		gameController.currentTargets[charNumber] = 38;
		gameController.moveTarget[charNumber] = gameController.targetObjects[charNumber].transform.position;	
		skillTargets[charNumber].position = gameController.moveTarget[charNumber];
		gameController.aiPaths[charNumber].target = skillTargets[charNumber];
	}
}

//cooldown skills to prevent their use for cooldownLength, cooldowns are displayed in HUD
function Cooldown (charNumber : int, skillNumber : int, cooldownLength : float) {
	//cooldownLength = 3; //cheat for skill testing
	for(var i : float = 0; ; i+=0.1)	{		
		 if(i == 0)		{
			gameController.cooldowns[charNumber, skillNumber] = true;
			gameController.cooldownTimers[charNumber, skillNumber] = cooldownLength;
			yield WaitForSeconds(0.1f);
		}
		else if(gameController.cooldownTimers[charNumber, skillNumber] <= 0.19)		{			
			gameController.cooldownTimers[charNumber, skillNumber] = 0;
			gameController.cooldowns[charNumber, skillNumber] = false;
			break;
		}
		else		{
			gameController.cooldownTimers[charNumber, skillNumber] -= 0.1f;
			yield WaitForSeconds(0.1f);
		}
	}
}

//runts
function RuntKick (charNumber : int, targetLocation : Vector3) {
	runts[0].transform.position = gameController.targetObjects[charNumber].transform.TransformPoint(Vector3.forward);
	runtTargets[0].position = targetLocation;
	runtPaths[0].target = runtTargets[0];
	runtPaths[0].canSearch = true;	
	runtPaths[0].SearchPath();
	runtPaths[0].canMove = true;
	runtAnims[0]["Walk_Loop"].speed = 4;
	runtAnims[0].Play("Walk_Loop");
	CheckRunt(0, charNumber, targetLocation);
}

function BobKick (charNumber : int, bobNumber : int, targetLocation : Vector3, runtNumber : int) {
	runts[runtNumber].transform.position = gameController.targetObjects[bobNumber].transform.TransformPoint(Vector3.forward);
	runtTargets[runtNumber].position = targetLocation;
	runtPaths[runtNumber].target = runtTargets[runtNumber];
	runtPaths[runtNumber].canSearch = true;
	runtPaths[runtNumber].SearchPath();
	runtPaths[runtNumber].canMove = true;
	runtAnims[runtNumber]["Walk_Loop"].speed = 4;
	runtAnims[runtNumber].Play("Walk_Loop");
	CheckRunt(runtNumber, charNumber, targetLocation, true, bobNumber);
}

function CheckRunt (runt : int, charNumber : int, targetLocation : Vector3) { CheckRunt(runt, charNumber, targetLocation, false, 38); }
function CheckRunt (runt : int, charNumber : int, targetLocation : Vector3, isBob : boolean, bobNumber : int) {
	var startTime : float = Time.time;
	for(;;) {
		var distance : float = Vector3.Distance(runts[runt].transform.position, targetLocation);
		if(distance <= 0.6 || Time.time - startTime > 2.0) {
			EndRunt(runt, charNumber, targetLocation, isBob, bobNumber);
			break;
		}
		else { yield WaitForFixedUpdate(); }
	}
}

function EndRunt (runt : int, charNumber : int, targetLocation : Vector3, isBob : boolean, bobNumber : int) {
	runtAnims[runt].Stop();
	//play explosion
	ExplodeRunt(runt);
	//stop runt
	runtPaths[runt].canSearch = false;
	runtPaths[runt].canMove = false;						
	
	//check for enemy in skill aoe radius
	var teamNumber : int = charNumber;
	var enemyNumber : int = 2;
	if(teamNumber == 2)			{
		teamNumber = 0;
		enemyNumber = 1;
	}
	if(isBob) { BobRuntDamage(charNumber, bobNumber, targetLocation, teamNumber, enemyNumber); }
	else {	RuntDamage(charNumber, targetLocation, teamNumber, enemyNumber); }
}

function RuntDamage (charNumber : int, targetLocation : Vector3, teamNumber : int, enemyNumber : int) {
	//hit non-structural enemies in range
	//monster
	var monsterDist : float = Vector3.Distance(targetLocation, gameController.targetObjects[0].collider.ClosestPointOnBounds(targetLocation));
	if(monsterDist < 5)		{
		gameController.Damage(100 * gameController.skillLevels[charNumber,0], charNumber, 0);
	}
	//enemy char
	var charDist : float = Vector3.Distance(targetLocation, gameController.targetObjects[enemyNumber].collider.ClosestPointOnBounds(targetLocation));
	if(charDist < 5)	{
		gameController.Damage(100 * gameController.skillLevels[charNumber,0], charNumber, enemyNumber);
	}
	//enemy guardian, minions, and spider
	for(var j : int = 7+teamNumber; j < 35; j+=2)	{
		var enemyDistance : float = Vector3.Distance(targetLocation, gameController.targetObjects[j].collider.ClosestPointOnBounds(targetLocation));
		//if the minion is in range
		if(enemyDistance < 5)	{
			gameController.Damage(100 * gameController.skillLevels[charNumber,0], charNumber, j);
		}
	}
}

function BobRuntDamage (charNumber : int, bobNumber : int, targetLocation : Vector3, teamNumber : int, enemyNumber : int) {
	//hit non-structural enemies in range
	//monster
	var monsterDist : float = Vector3.Distance(targetLocation, gameController.targetObjects[0].collider.ClosestPointOnBounds(targetLocation));
	if(monsterDist < 5)		{
		gameController.Damage(100 * gameController.skillLevels[charNumber,0], bobNumber, 0);
	}
	//enemy char
	var charDist : float = Vector3.Distance(targetLocation, gameController.targetObjects[enemyNumber].collider.ClosestPointOnBounds(targetLocation));
	if(charDist < 5)	{
		gameController.Damage(100 * gameController.skillLevels[charNumber,0], bobNumber, enemyNumber);
	}
	//enemy guardian, minions, and spider
	for(var j : int = 7+teamNumber; j < 35; j+=2)	{
		var enemyDistance : float = Vector3.Distance(targetLocation, gameController.targetObjects[j].collider.ClosestPointOnBounds(targetLocation));
		//if the minion is in range
		if(enemyDistance < 5)	{
			gameController.Damage(100 * gameController.skillLevels[charNumber,0], bobNumber, j);
		}
	}
}
				
function ExplodeRunt(runtNumber : int) {
	var origPos : Vector3;
	for(var runtTime : int; runtTime < 3; runtTime++) {
		if(runtTime == 0) {
			runtExplosion[runtNumber].transform.localPosition = Vector3(0, 1, 0);
			runtExplosion[runtNumber].particleSystem.Clear();
			runtExplosion[runtNumber].particleSystem.Play();
			if(!playerData.effectMuted) {
				runtSoundEffects[runtNumber].transform.position = runtExplosion[runtNumber].transform.position;
				runtSoundEffects[runtNumber].volume = playerData.effectVolume;
				runtSoundEffects[runtNumber].Play();
			}
			yield WaitForSeconds(0.25);
		}
		else if(runtTime == 1) {
			origPos = runtExplosion[runtNumber].transform.localPosition;
			runtExplosion[runtNumber].transform.parent = null;
			runts[runtNumber].transform.position = Vector3(500,0,500);
			yield WaitForSeconds(0.25);
		}
		else {
			runtExplosion[runtNumber].transform.parent = runts[runtNumber].transform;
			runtExplosion[runtNumber].transform.localPosition = origPos;
			runtExplosion[0].particleSystem.Stop();
		}
	}
}

//buffs
function BuffHealthRegen (charNumber : int, buffAmount : int, duration : float){
	for(var i : int = 0; i < 2; i++)	{
		if(i == 1)		{
			gameController.healthRegens[charNumber] -= buffAmount;
		}
		else		{
			gameController.healthRegens[charNumber] += buffAmount;
			yield WaitForSeconds(duration);
		}
	}
}

function BuffManaRegen (charNumber : int, buffAmount : int, duration : float){
	for(var i : int = 0; i < 2; i++)
	{
		if(i == 1)		{
			gameController.resourceRegens[charNumber] -= buffAmount;
		}
		else	{
			gameController.resourceRegens[charNumber] += buffAmount;
			yield WaitForSeconds(duration);
		}
	}
}

function BuffAttackDamage (charNumber : int, buffAmount : int, duration : float){
	for(var i : int = 0; i < 2; i++)	{
		if(i == 1)		{		gameController.attackDamages[charNumber] -= buffAmount;		}
		else		{
			gameController.attackDamages[charNumber] += buffAmount;
			yield WaitForSeconds(duration);
		}
	}
}

function BuffAttackRange (charNumber : int, buffAmount : int, duration : float){
	for(var i : int = 0; i < 2; i++)	{
		if(i == 1)		{		gameController.attackRanges[charNumber] -= buffAmount;		}
		else		{
			gameController.attackRanges[charNumber] += buffAmount;
			yield WaitForSeconds(duration);
		}
	}
}

function BuffAttackSpeed (charNumber : int, buffAmount : float, duration : float){
	//convert percent and save it
	var buffValue : float;
	for(var i : int = 0; i < 2; i++)	{
		if(i == 1)		{		gameController.attackSpeeds[charNumber] -= buffValue;		}
		else		{
			buffValue = gameController.attackSpeeds[charNumber] * buffAmount;
			gameController.attackSpeeds[charNumber] += buffValue;
			yield WaitForSeconds(duration);
		}
	}
}

function BuffDamageReduction (charNumber : int, buffAmount : int, duration : float){
	for(var i : int = 0; i < 2; i++)	{
		if(i == 1)		{		gameController.damageReductions[charNumber] -= buffAmount;		}
		else		{
			gameController.damageReductions[charNumber] += buffAmount;
			yield WaitForSeconds(duration);
		}
	}
}

function BuffMovementSpeed (charNumber : int, buffAmount : float, duration : float){
	//convert percent and save it
	var buffValue : float;
	for(var i : int = 0; i < 2; i++)	{
		if(i == 1)		{
			gameController.movementSpeeds[charNumber] -= buffValue;
			gameController.aiPaths[charNumber].speed -= buffValue;
		}
		else		{
			buffValue = gameController.movementSpeeds[charNumber] * buffAmount;
			gameController.movementSpeeds[charNumber] += buffValue;
			gameController.aiPaths[charNumber].speed += buffValue;
			yield WaitForSeconds(duration);
		}
	}
}

function BuffLifeSteal (charNumber : int, buffAmount : int, duration : float){
	for(var i : int = 0; i < 2; i++)	{
		if(i == 1)		{		gameController.lifeSteals[charNumber] -= buffAmount;		}
		else		{
			gameController.lifeSteals[charNumber] += buffAmount;
			yield WaitForSeconds(duration);
		}
	}
}

function FormBuff (charNumber : int){
	//fire
	if(gameController.stances[charNumber] == 1)	{
		//buff attack speed
		BuffAttackSpeed(charNumber,0.6,6);
		//buff attack range
		BuffAttackRange(charNumber,13,6);
		//buff movement speed
		BuffMovementSpeed(charNumber,0.1,6);
	}
	//earth
	else if(gameController.stances[charNumber] == 3)	{
		//buff attack damage
		BuffAttackDamage(charNumber,30*gameController.levels[charNumber],6);		
		//buff movement speed
		BuffMovementSpeed(charNumber,0.5,6);
	}
	//ice
	else	{
//		//buff health regen
//		BuffHealthRegen(charNumber,10*gameController.levels[charNumber],6);
		//buff mana regen
		BuffManaRegen(charNumber,20*gameController.levels[charNumber],6);
		//buff damage reduction
		BuffDamageReduction(charNumber, 55, 6);
		//buff movement speed
		BuffMovementSpeed(charNumber,0.3,6);
	}
}

//buff auras
function BuffAura (charNumber : int){
	for(;;)	{
		//hasnt used a skill yet
		if(gameController.stances[charNumber] == 0)		{
		}
		//fire
		else if(gameController.stances[charNumber] == 1)		{
			CheckAura(charNumber, 1);
		}
		//ice
		else if(gameController.stances[charNumber] == 2)		{
			CheckAura(charNumber, 2);
		}
		//earth
		else if(gameController.stances[charNumber] == 3)		{
			CheckAura(charNumber, 3);
		}
		yield WaitForSeconds(0.2);	
	}
}

function CheckAura (charNumber : int, stance : int) {
	for(var i : int = 6+charNumber; i < 35; i+=2)	{
		//if in aura range
		var myPos : Vector3 = gameController.targetObjects[charNumber].transform.position;
		var targetDist : float = Vector3.Distance(myPos, gameController.targetObjects[i].transform.position);
		if(targetDist < 10)				{
			if(!hasAura[i]){
				//add buff
				switch(stance) {
				case 1:
					leoAuraValues[i, 1] = gameController.attackSpeeds[i] * (auraMultiplier * 0.05 * (gameController.skillLevels[charNumber,stance-1]));
					gameController.attackSpeeds[i] += leoAuraValues[i, 1];
					break;
				case 2:
					leoAuraValues[i, 2] = auraMultiplier * 5 * gameController.skillLevels[charNumber,1];
					gameController.damageReductions[i] += leoAuraValues[i, 2];
					break;
				case 3:
					leoAuraValues[i, 3] = gameController.movementSpeeds[i] * (auraMultiplier * (0.15 * (gameController.skillLevels[charNumber,stance-1])));
					gameController.movementSpeeds[i] += leoAuraValues[i, 3];
					gameController.aiPaths[i].speed += leoAuraValues[i, 3];
				}
				currentAura[i] = stance;
				AuraParticle(i, stance);				
				hasAura[i] = true;
			}
		}
		//if buffed
		else if(hasAura[i])	{
			//remove buff
			RemoveAura(i, charNumber, currentAura[i]);	
		}				
	}			
}

function AuraParticle (unitNumber : int, stance : int) {	
	var parTran : Transform = gameController.targetObjects[unitNumber].transform.Find("Aura");
	switch(stance) {
	case 1:
		parTran.particleSystem.startColor = fireAura;
		break;
	case 2:
		parTran.particleSystem.startColor = iceAura;
		break;
	case 3:
		parTran.particleSystem.startColor = earthAura;
		break;
	}
	PlayParticle(parTran, 0.8, false);
	return;	
}

function RemoveAura (unitNumber : int, teamNumber : int, auraNum : int){
	switch(auraNum)	{
	case 1 :
		gameController.attackSpeeds[unitNumber] -= leoAuraValues[unitNumber, 1];
		hasAura[unitNumber] = false;
		StopParticle(gameController.targetObjects[unitNumber].transform.Find("Aura"));
		break;
	case 2 :
		gameController.damageReductions[unitNumber] -= leoAuraValues[unitNumber, 2];
		hasAura[unitNumber] = false;
		StopParticle(gameController.targetObjects[unitNumber].transform.Find("Aura"));
		break;	
	case 3 :
		gameController.movementSpeeds[unitNumber] -= leoAuraValues[unitNumber, 3];
		gameController.aiPaths[unitNumber].speed -= leoAuraValues[unitNumber, 3];
		hasAura[unitNumber] = false;
		StopParticle(gameController.targetObjects[unitNumber].transform.Find("Aura"));
		break;		
	}
}

//only applies to Leonardo's auras
function RemoveAllAuras (charNumber : int){
	//for each allied unit
	for(var i : int = 6+charNumber; i < 35; i+=2)	{
		//if buffed
		if(hasAura[i])		{
			//remove buff
			RemoveAura(i, charNumber, currentAura[i]);
			StopParticle(gameController.targetObjects[charNumber].transform.Find("Aura"));			
		}
	}
}

//debuff auras
function SlowAura (teamNumber : int, enemyNumber : int, targetNumber : int, slowPercent : float){
	var duration : int = gravityWellDuration*5;
	for(var timerVar : int = 0; timerVar < duration + 1; timerVar++)	{
		if(timerVar == duration)		{	
			//for each nonallied unit thats not a structure or bob or the target
			if(targetNumber != 0)		{			RemoveSlowAura(0);				}
			if(targetNumber != enemyNumber)			{			RemoveSlowAura(enemyNumber);			}
			for(var j : int = 7+teamNumber; j < 35; j+=2)			{
				if(targetNumber != j)			{			RemoveSlowAura(j);				}	
			}
		}
		else		{
			var myPos : Vector3 = gameController.targetObjects[targetNumber].transform.position;
			//slow
			//for each nonallied unit thats not a structure or bob or the original target
			//monster
			if(targetNumber != 0)			{			CheckSlowAura(0, myPos, slowPercent);			}
			//character
			if(targetNumber != enemyNumber)			{			CheckSlowAura(enemyNumber, myPos, slowPercent);			}
			//everything else
			for(var i : int = 7+teamNumber; i < 35; i+=2)			{
				if(targetNumber != i)			{				CheckSlowAura(i, myPos, slowPercent);				}
			}
			yield WaitForSeconds(0.2);
		}		
	}
}

function CheckSlowAura (unitToCheck : int, targetPos : Vector3, slowPercent : float){
	//if in aura range
	var targetDist : float = Vector3.Distance(targetPos, gameController.targetObjects[unitToCheck].transform.position);
	if(targetDist < 10)	{
		//if not slowed
		if(!hasSlowAura[unitToCheck])		{
			//add slow
			slowAmounts[unitToCheck] = gameController.movementSpeeds[unitToCheck] * slowPercent;
			gameController.movementSpeeds[unitToCheck] -=  slowAmounts[unitToCheck];
			gameController.aiPaths[unitToCheck].speed -= slowAmounts[unitToCheck];
			hasSlowAura[unitToCheck] = true;
			gameController.targetObjects[unitToCheck].transform.Find("Gravity").particleSystem.Play();
		}
	}
	//out of range
	else	{
		RemoveSlowAura(unitToCheck);
	}
}

function RemoveSlowAura (unitNumber : int){
	//if slowed
	if(hasSlowAura[unitNumber])	{
		//remove
		gameController.movementSpeeds[unitNumber] +=  slowAmounts[unitNumber];
		gameController.aiPaths[unitNumber].speed += slowAmounts[unitNumber];
		hasSlowAura[unitNumber] = false;
		var parSys : Transform = gameController.targetObjects[unitNumber].transform.Find("Gravity");
		parSys.particleSystem.Stop();	
		parSys.particleSystem.Clear();		
	
	}
}

//debuffs
function DebuffHealthRegen (charNumber : int, buffAmount : float, duration : float){
	//convert percent and save it
	var buffValue : float;
	for(var i : int = 0; i < 2; i++)	{
		if(i == 1)		{
			gameController.healthRegens[charNumber] += buffValue;
		}
		else		{
			buffValue = gameController.healthRegens[charNumber] * buffAmount;
			gameController.healthRegens[charNumber] -= buffValue;
			yield WaitForSeconds(duration);
		}
	}
}

function DebuffMovementSpeed (charNumber : int, buffAmount : float, duration : float){
	//convert percent and save it
	var buffValue : float;
	for(var i : int = 0; i < 2; i++)	{
		if(i == 1)		{
			gameController.movementSpeeds[charNumber] += buffValue;
			gameController.aiPaths[charNumber].speed += buffValue;
			hasSlowAura[charNumber] = false;
		}
		else		{
			buffValue = gameController.movementSpeeds[charNumber] * buffAmount;
			gameController.movementSpeeds[charNumber] -= buffValue;
			gameController.aiPaths[charNumber].speed -= buffValue;
			hasSlowAura[charNumber] = true;
			yield WaitForSeconds(duration);
		}
	}
}

function ElementalDebuff (characterNumber : int, target : int, type : int){
	for(var i : int = 0; i < 2; i++)	{
		if(i == 1)		{
			if(elementalDebuffCounts[target, type] > 0)			{
				//remove debuffs
				RemoveElementalDebuff(target, type);				
			}
		}	
		else		{	
			//apply debuffs
			elementalDebuffCounts[target, type] += 1;
			var debuffPar : Transform;
			switch (type)		{
			case 1 :				
				if(elementalDebuffCounts[target, type] == 1) {
					elementalDebuffValues[target, 1] = 5 * gameController.skillLevels[characterNumber,0];
				}
				gameController.healthRegens[target] -= elementalDebuffValues[target, 1];
				debuffPar = gameController.targetObjects[target].transform.Find("Debuffs").Find("FireDebuff");
				if(gameController.skillsExecuting[characterNumber, 3] && gameController.stances[characterNumber] == 1) { debuffPar.particleSystem.startSize = 3;		}
				else { debuffPar.particleSystem.startSize = 1; }
				debuffPar.particleSystem.Play();
				break;
			case 2 :				
				if(elementalDebuffCounts[target, type] == 1) {
					elementalDebuffValues[target, 2] = gameController.attackSpeeds[target] * (0.05 * gameController.skillLevels[characterNumber,1]);
				}
				gameController.attackSpeeds[target] -= elementalDebuffValues[target, 2];
				debuffPar = gameController.targetObjects[target].transform.Find("Debuffs").Find("IceDebuff");
				if(gameController.skillsExecuting[characterNumber, 3] && gameController.stances[characterNumber] == 2) { debuffPar.particleSystem.startSize = 3;		}
				else { debuffPar.particleSystem.startSize = 1; }
				debuffPar.particleSystem.Play();
				break;
			case 3 :				
				if(elementalDebuffCounts[target, type] == 1) {
					elementalDebuffValues[target, 3] = 2 * gameController.skillLevels[characterNumber,2];
				}
				gameController.damageReductions[target] -= elementalDebuffValues[target, 3];
				debuffPar = gameController.targetObjects[target].transform.Find("Debuffs").Find("EarthDebuff");
				if(gameController.skillsExecuting[characterNumber, 3] && gameController.stances[characterNumber] == 3) { debuffPar.particleSystem.startSize = 3;		}
				else { debuffPar.particleSystem.startSize = 1; }
				debuffPar.particleSystem.Play();
				break;
			}
			
			yield WaitForSeconds(6);
		}
	}
}

function FocusDebuffs (charNumber : int) {	
	for(var i : int; i < 37; i++) {
		if(elementalDebuffCounts[i, gameController.stances[charNumber]] > 0) {
			var debuffPar : Transform;
			switch(gameController.stances[charNumber]) {
			case 1:
				debuffPar = gameController.targetObjects[i].transform.Find("Debuffs").Find("FireDebuff");
				break;
			case 2:
				debuffPar = gameController.targetObjects[i].transform.Find("Debuffs").Find("IceDebuff");
				break;
			case 3:
				debuffPar = gameController.targetObjects[i].transform.Find("Debuffs").Find("EarthDebuff");
				break;	
			}
			debuffPar.particleSystem.Stop();
			debuffPar.particleSystem.Clear();
			debuffPar.particleSystem.startSize = 3;
			debuffPar.particleSystem.Play();
		}
	}
	return;
}

function RemoveElementalDebuff (target : int, type : int){
	var parSys : Transform;
	elementalDebuffCounts[target, type] -= 1;
	switch (type)	{
	case 1 :				
		gameController.healthRegens[target] += elementalDebuffValues[target, 1];
		if(elementalDebuffCounts[target, 1] < 1) {
			parSys = gameController.targetObjects[target].transform.Find("Debuffs").Find("FireDebuff");
			parSys.particleSystem.Stop();
			parSys.particleSystem.Clear();
		}
		break;
	case 2 :				
		gameController.attackSpeeds[target] += elementalDebuffValues[target, 2];
		if(elementalDebuffCounts[target, 2] < 1) {
			parSys = gameController.targetObjects[target].transform.Find("Debuffs").Find("IceDebuff");
			parSys.particleSystem.Stop();
			parSys.particleSystem.Clear();
		}
		break;
	case 3 :				
		gameController.damageReductions[target] += elementalDebuffValues[target, 3];
		if(elementalDebuffCounts[target, 3] < 1) {
			parSys = gameController.targetObjects[target].transform.Find("Debuffs").Find("EarthDebuff");
			parSys.particleSystem.Stop();
			parSys.particleSystem.Clear();
		}
		break;
	}
}

function ConsumeElementalDebuff (attacker : int, target : int, type : int, basicDamageAmount : int){
	//consume debuff
	RemoveElementalDebuff(gameController.currentTargets[attacker], gameController.stances[attacker]);
	//apply effects
	switch (type)	{
	case 1 :
		//splash dat damage	
		var teamNumber : int = 1;
		var enemyNumber : int = 2;
		if(attacker == 2) { teamNumber = 0; enemyNumber = 1;}					
		var originPoint : Vector3 = gameController.targetObjects[target].transform.position;
		
		//for each enemy, no structures
		//monster
		//if in range of target
		var enemyDist : float = Vector3.Distance(originPoint, gameController.targetObjects[0].collider.ClosestPointOnBounds(originPoint));
		if(enemyDist < 5)		{
			//damage
			gameController.Damage(basicDamageAmount,attacker,0);
		}
		//enemy char
		//if in range of target
		enemyDist = Vector3.Distance(originPoint, gameController.targetObjects[enemyNumber].collider.ClosestPointOnBounds(originPoint));
		if(enemyDist < 5)		{
			//damage
			gameController.Damage(basicDamageAmount,attacker,enemyNumber);
		}
		//everything else but bobs
		for(var i : int = 7+teamNumber; i < 35; i+=2)
		{
			//if in range of target
			enemyDist = Vector3.Distance(originPoint, gameController.targetObjects[i].collider.ClosestPointOnBounds(originPoint));
			if(enemyDist < 5)			{
				//damage
				gameController.Damage(basicDamageAmount,attacker,i);
			}
		}
		//bobs
		//if exists
		if(gameController.characterSelected[enemyNumber] == 0)		{
			//if in range of target
		    enemyDist = Vector3.Distance(originPoint, gameController.targetObjects[35+teamNumber].collider.ClosestPointOnBounds(originPoint));
			if(enemyDist < 5){	gameController.Damage(basicDamageAmount,attacker,35+teamNumber);	}
		}		
		break;
	case 2 :	
		//heal			
		gameController.currentHealths[attacker] = Mathf.Min(gameController.currentHealths[attacker] + gameController.maxHealths[attacker]*0.05, gameController.maxHealths[attacker]);
		break;
	case 3 :
		//smack down		
		if(gameController.currentHealths[target] >= 1) {		
			gameController.Damage(gameController.currentHealths[target]*0.1,attacker,target);
		}
		break;
	}
}						

//summons
function SummonSpider (teamNumber : int){
	for(var i : int = 0; i < 2; i++)	{
		if(i == 1)		{
			gameController.brains[32+teamNumber].brainOn = false;			
			if(gameController.currentHealths[32+teamNumber] >= 1) { gameController.KillUnit(38,32+teamNumber);	}	
		}
		else		{
			gameController.maxHealths[32+teamNumber] = 250 *gameController.skillLevels[teamNumber,2];
			gameController.currentHealths[32+teamNumber] = gameController.maxHealths[32+teamNumber];
			gameController.attackDamages[32+teamNumber] = 25 * gameController.skillLevels[teamNumber,2];
			gameController.brains[32+teamNumber].brainOn = true;
			var targetLoc : Vector3 = gameController.targetObjects[teamNumber].transform.TransformPoint(Vector3.right/1.5);
			gameController.targetObjects[32+teamNumber].transform.position = targetLoc;
			yield WaitForSeconds(8);
		}
	}
}

function SummonBob (teamNumber : int) {
	for(var i : int = 0; i < 2; i++)	{
		if(i == 1)		{
			gameController.brains[34+teamNumber].brainOn = false;			
			gameController.KillUnit(38,34+teamNumber);
		}
		else		{
			var bobTransform : Transform = gameController.targetObjects[34+teamNumber].transform;			
			gameController.maxHealths[34+teamNumber] = 500 + 50*gameController.levels[teamNumber];
			gameController.currentHealths[34+teamNumber] = gameController.maxHealths[34+teamNumber];
			gameController.brains[34+teamNumber].brainOn = true;
			gameController.anims[34+teamNumber].Idle();
			bobTransform.position = gameController.skillTargetLocations[teamNumber];
			bobTransform.position.y = 0.05;
			if(gameController.bobAtMonster[teamNumber]) { bobTransform.position = bobTransform.TransformPoint(Vector3.back); }
			yield WaitForSeconds(6);
		}
	}
}

//movement
function MoveToTarget (charNumber : int, target : Vector3, distance : float, endFunction : Function){
	for(var i : int = 0; i < 8; i++){
		if(gameController.currentHealths[gameController.currentTargets[charNumber]] < 1)	{
			endFunction(charNumber);
			break;
		}
		//arrived
		if(i == 7){
			//move	
			gameController.targetObjects[charNumber].transform.position = Vector3.MoveTowards(gameController.targetObjects[charNumber].transform.position, 
				target, distance/8.0);
			gameController.targetObjects[charNumber].transform.position = gameController.targetObjects[charNumber].transform.TransformPoint(Vector3.back*1);	
			gameController.targetObjects[charNumber].transform.rotation.x = 0;
			gameController.targetObjects[charNumber].transform.rotation.z = 0;
			gameController.targetObjects[charNumber].transform.position.y = 0.05;
			//if I died during the move
			if(gameController.currentHealths[charNumber] < 1)		{
				gameController.targetObjects[charNumber].transform.position = gameController.holdingAreaPosition;
			}
			//finish
			endFunction(charNumber);				
		}
		else if(i == 0){
			//move	
			gameController.targetObjects[charNumber].transform.position = Vector3.MoveTowards(gameController.targetObjects[charNumber].transform.position, 
				target, distance/8.0);			
				
			yield WaitForSeconds(0.015);
		}
		else{
			//move	
			gameController.targetObjects[charNumber].transform.position = Vector3.MoveTowards(gameController.targetObjects[charNumber].transform.position, 
				target, distance/8.0);			
				
			yield WaitForSeconds(0.015);
		}	
	}
}

function KnockUp (charNumber : int, unitNumber : int) {
	var target : Vector3;
	var distance : float;
	
	for(var i : int = 0; i < 61; i++)	{
		if(i == 60)		{
			//ground unit
			gameController.targetObjects[unitNumber].transform.rotation.x = 0;
			gameController.targetObjects[unitNumber].transform.rotation.z = 0;
			gameController.targetObjects[unitNumber].transform.position.y = 0.05;
			
			//unstun
			gameController.stunned[unitNumber] = false;
			if(gameController.currentHealths[unitNumber] >= 1) {	gameController.aiPaths[unitNumber].canSearch = true; gameController.aiPaths[unitNumber].canMove = true;	}
			
			//damage
			gameController.Damage(150 + 150*gameController.skillLevels[charNumber,1], charNumber, unitNumber);		
			
		}
		else if(i == 0)		{
			//knock up unit					
			target = gameController.targetObjects[unitNumber].transform.position;
			target.y = 3;	distance = 3;
				
			//move up
			gameController.targetObjects[unitNumber].transform.position = Vector3.MoveTowards(gameController.targetObjects[unitNumber].transform.position, 
				target,  distance * Time.deltaTime);
			
			//stun unit
			gameController.stunned[unitNumber] = true;
			gameController.aiPaths[unitNumber].canMove = false;
			gameController.aiPaths[unitNumber].canSearch = false;
			gameController.StopBasicAttack(unitNumber);
			
			//if unit is a character
			if(unitNumber == 1 || unitNumber == 2)	{
				skills.InterruptSkills(unitNumber, gameController.currentTargets[unitNumber]);
			}
			
			yield WaitForFixedUpdate();
		}
		else if(i < 32)		{
		  	//stun unit
			gameController.stunned[unitNumber] = true;
			gameController.aiPaths[unitNumber].canMove = false;
			gameController.aiPaths[unitNumber].canSearch = false;
			gameController.StopBasicAttack(unitNumber);
		    //move up
			gameController.targetObjects[unitNumber].transform.position = Vector3.MoveTowards(gameController.targetObjects[unitNumber].transform.position, 
				target,  distance * Time.deltaTime);
			
			yield WaitForFixedUpdate();
		}
		else		{
			//stun unit
			gameController.stunned[unitNumber] = true;
			gameController.aiPaths[unitNumber].canMove = false;
			gameController.aiPaths[unitNumber].canSearch = false;
			gameController.StopBasicAttack(unitNumber);
			//move down
			gameController.targetObjects[unitNumber].transform.position = Vector3.MoveTowards(gameController.targetObjects[unitNumber].transform.position, 
				target, -distance/2.0 * Time.deltaTime);
			yield WaitForFixedUpdate();
		}
	}
}

function PushAway (charNumber : int, unitNumber : int, centerLocation : Vector3){	
	var target : Vector3;
	var distance : float;	
	var unitTransform : Transform;
	
	for(var i : int = 0; i < 31; i++)	{
		if(i == 0)		{
			target = gameController.targetObjects[unitNumber].transform.position;
			distance = 10.0f;
			unitTransform = gameController.targetObjects[unitNumber].transform;
			
			//move		
			gameController.targetObjects[unitNumber].transform.position = Vector3.MoveTowards(unitTransform.position, centerLocation, -distance * Time.deltaTime);
				
			CheckForBounds(unitNumber, unitTransform);
			
			yield WaitForFixedUpdate();
		}
		else if(i == 31) {
			//end movement
		}
		else		{
			//move	
			//move	
			gameController.targetObjects[unitNumber].transform.position = Vector3.MoveTowards(unitTransform.position, centerLocation, -distance * Time.deltaTime);
				
			CheckForBounds(unitNumber, unitTransform);
				
			yield WaitForFixedUpdate();
		}
	}
}

function PullToMe (unitNumbers : Vector2) {
	var targetNumber : int = unitNumbers.y;
	var charNumber : int = unitNumbers.x;
	var speed : float;
	var	charDist : float;
	var damageAmount : int;	
	var started : boolean;		
	
	for(var i : int = 0; i < (60 * gameController.skillLevels[charNumber,2]); i++)	{
		//if oom, target dead or duration reached
		if((gameController.currentResources[charNumber] < gameController.skillCosts[charNumber,2] && i > 59) || gameController.currentHealths[targetNumber] < 1
			|| (i == ((60 * gameController.skillLevels[charNumber,2]) - 1)))		{
			
			StopCoroutine("StopPullToMe");
			FinishPullToMe(unitNumbers, started);
			//kill this routine
			i = 1000;
		}
		else if(i == 0)		{
			started = true;		
			
			//stun target
			gameController.stunned[targetNumber] = true;
			gameController.aiPaths[targetNumber].canMove = false;
			gameController.aiPaths[targetNumber].canSearch = false;
			gameController.StopBasicAttack(targetNumber);
			
			//if unit is a character
			if(targetNumber == 1 || targetNumber == 2)		{
				skills.InterruptSkills(targetNumber, gameController.currentTargets[targetNumber]);
			}
			
			gameController.anims[targetNumber].Run(0.25);
			speed = 3;
			
			damageAmount = 75 + 25 * gameController.skillLevels[charNumber, 2];
			if(fluctuating) { damageAmount*=2; }
			gameController.Damage(damageAmount,charNumber,targetNumber);
			
			//move
			charDist = Vector3.Distance(gameController.targetObjects[charNumber].collider.ClosestPointOnBounds(gameController.targetObjects[targetNumber].transform.position),
				gameController.targetObjects[targetNumber].collider.ClosestPointOnBounds(gameController.targetObjects[charNumber].transform.position));
			if(charDist > 1.0)		{
				gameController.targetObjects[targetNumber].transform.position = Vector3.MoveTowards(gameController.targetObjects[targetNumber].transform.position, 
					gameController.targetObjects[charNumber].transform.position, speed * Time.deltaTime);
			}
		}
		else if(i % 60 == 0)		{
			//stun target
			gameController.stunned[targetNumber] = true;
			gameController.aiPaths[targetNumber].canMove = false;
			gameController.aiPaths[targetNumber].canSearch = false;
			gameController.StopBasicAttack(targetNumber);
			//mana tick
			gameController.currentResources[charNumber] -= gameController.skillCosts[charNumber,2];
			CheckFluctuate(charNumber);
			//damage
			damageAmount = 75 + 25 * gameController.skillLevels[charNumber, 2];
			if(fluctuating) { damageAmount*=2; }
			gameController.Damage(damageAmount,charNumber,targetNumber);
			
			//move
			charDist = Vector3.Distance(gameController.targetObjects[charNumber].collider.ClosestPointOnBounds(gameController.targetObjects[targetNumber].transform.position),
				gameController.targetObjects[targetNumber].collider.ClosestPointOnBounds(gameController.targetObjects[charNumber].transform.position));
			if(charDist > 1.0)		{
				gameController.targetObjects[targetNumber].transform.position = Vector3.MoveTowards(gameController.targetObjects[targetNumber].transform.position, 
					gameController.targetObjects[charNumber].transform.position, speed * Time.deltaTime);
			}
		}
		else		{
			//stun target
			gameController.stunned[targetNumber] = true;
			gameController.aiPaths[targetNumber].canMove = false;
			gameController.aiPaths[targetNumber].canSearch = false;
			gameController.StopBasicAttack(targetNumber);
			//move
			charDist = Vector3.Distance(gameController.targetObjects[charNumber].collider.ClosestPointOnBounds(gameController.targetObjects[targetNumber].transform.position),
				gameController.targetObjects[targetNumber].collider.ClosestPointOnBounds(gameController.targetObjects[charNumber].transform.position));
			if(charDist > 1.0)		{
				gameController.targetObjects[targetNumber].transform.position = Vector3.MoveTowards(gameController.targetObjects[targetNumber].transform.position, 
					gameController.targetObjects[charNumber].transform.position, speed * Time.deltaTime);
			}
		}
		
		yield WaitForFixedUpdate();
	}
}

function StopPullToMe (unitNumbers : Vector2) {
//	while(pulling)	{
//		if(Input.GetMouseButtonDown(1) || Input.GetKeyDown(playerData.keySettings[14]))		{
//			StopCoroutine("PullToMe");
//			FinishPullToMe(unitNumbers, true);
//		}
//		else		{
//			yield;
//		}		
//	}
}

function FinishPullToMe (unitNumbers : Vector2, started : boolean) {
	var charNumber : int = unitNumbers.x;
	var targetNumber : int = unitNumbers.y;
	
	skillSoundEffects[2].Stop();
	pulling = false;
	//stop pulling particle
	var parSys : Transform;
	parSys = gameController.targetObjects[charNumber].transform.Find("Pulling");
	parSys.particleSystem.Stop();
	parSys.particleSystem.Clear();
	//stop enemy particle
	parSys = gameController.targetObjects[targetNumber].transform.Find("Pulled");
	parSys.particleSystem.Stop();
	parSys.particleSystem.Clear();
	
	if(started) {
		//unstun target
		gameController.stunned[targetNumber] = false;
		if(gameController.currentHealths[targetNumber] >= 1 && !gameController.frozen[targetNumber]) { gameController.aiPaths[targetNumber].canSearch = true; gameController.aiPaths[targetNumber].canMove = true; }				
	}
	//ensure correct pathing
	AreaPathFinish(charNumber);			
	//unfreeze
	gameController.frozen[charNumber] = false;
	gameController.skillsExecuting[charNumber, 2] = false;
	gameController.anims[charNumber].Idle();
	//start the cooldown
	Cooldown(charNumber,2,17-2*gameController.skillLevels[charNumber, 2]);
}

function PullToDoom (doomedFool : int) {
	var enemyDistance : float;	
	for(;;)	{
		enemyDistance = Vector3.Distance(doomOrigin, gameController.targetObjects[doomedFool].collider.ClosestPointOnBounds(doomOrigin));
		if(enemyDistance > (5 + doomRadius) || doomEnded)		{
			doomPulling[doomedFool] = false;
			break;
		}
		
		//pull to doom
		enemyDistance = Vector3.Distance(doomOrigin, gameController.targetObjects[doomedFool].collider.ClosestPointOnBounds(doomOrigin));
		if(enemyDistance > 1.0)		{
			gameController.targetObjects[doomedFool].transform.position = Vector3.MoveTowards(gameController.targetObjects[doomedFool].transform.position,
				 doomOrigin, (doomRadius*2) * Time.deltaTime);
		}
		
		yield WaitForFixedUpdate();
	}
}

function BoomAway (unitNumber : int, fromSpot : Vector3) {	
	for(var i : int = 0; i < 31; i++)	{
		var unitTransform : Transform = gameController.targetObjects[unitNumber].transform;
		//move	
		unitTransform.position = Vector3.MoveTowards(unitTransform.position, fromSpot, -20 * Time.deltaTime);
			
		CheckForBounds(unitNumber, unitTransform);
			
		yield WaitForFixedUpdate();
	}
}

function CheckForBounds (unitNumber : int, unitTransform : Transform) {
	if(gameController.currentHealths[unitNumber] >= 1) {	
		if(unitTransform.position.x > 78) { unitTransform.position.x = 78; }
		else if(unitTransform.position.x < -78) { unitTransform.position.x = -78; }
		if(unitTransform.position.z > 38) { unitTransform.position.z = 38; }
		else if(unitTransform.position.z < -13) { unitTransform.position.z = -13; }
	}
}

function InterruptSkills (unitNumber : int, target : int) {
	var charNumber : int = gameController.characterSelected[unitNumber];
	seeking = false;
	if(gameController.attacking[unitNumber]) {
		gameController.StopBasicAttack(unitNumber);
	}	
	switch (charNumber)	{
	//ralph
	case 0 :
		if(gameController.skillsExecuting[unitNumber, 0])		{	
			//interrupt skill 1
			StopCoroutine("RalphSkillOneCo");
			//skill done, unfreeze
			gameController.frozen[unitNumber] = false;
			gameController.skillsExecuting[unitNumber, 0] = false;
			gameController.anims[unitNumber].Idle();
			skillSoundEffects[0].Stop();
		}
		if(gameController.skillsExecuting[unitNumber, 1])		{	
			//interrupt skill 2
			StopCoroutine("RalphSkillTwoCo");
			//skill done, unfreeze
			gameController.frozen[unitNumber] = false;
			gameController.skillsExecuting[unitNumber, 1] = false;
			gameController.anims[unitNumber].Idle();
			skillSoundEffects[1].Stop();
		}
		break;
	//ros
	case 1 :
		if(gameController.skillsExecuting[unitNumber, 0])		{	
			//interrupt skill 1
			StopCoroutine("RosalindSkillOneCo");
			//skill done, unfreeze
			gameController.frozen[unitNumber] = false;
			gameController.skillsExecuting[unitNumber, 0] = false;
			gameController.anims[unitNumber].Idle();
			skillSoundEffects[0].Stop();
		}
		if(gameController.skillsExecuting[unitNumber, 1])		{	
			//interrupt skill 2
			StopCoroutine("RosalindSkillTwoCo");
			//skill done, unfreeze
			gameController.frozen[unitNumber] = false;
			gameController.skillsExecuting[unitNumber, 1] = false;
			gameController.anims[unitNumber].Idle();
			skillSoundEffects[1].Stop();
		}
		if(gameController.skillsExecuting[unitNumber, 2])		{	
			//interrupt skill 2
			StopCoroutine("RosalindSkillThreeCo");
			//skill done, unfreeze
			gameController.frozen[unitNumber] = false;
			gameController.skillsExecuting[unitNumber, 2] = false;
			gameController.anims[unitNumber].Idle();
			skillSoundEffects[2].Stop();
			skillSoundEffects[3].Stop();
		}
		if(gameController.skillsExecuting[unitNumber, 3])		{	
			//interrupt skill 2
			StopCoroutine("RosalindSkillFourCo");
			//skill done, unfreeze
			gameController.frozen[unitNumber] = false;
			gameController.skillsExecuting[unitNumber, 3] = false;
			gameController.anims[unitNumber].Idle();
			StopCoroutine("StartToucheSound");
			skillSoundEffects[4].Stop();
		}
		break;
	//leo
	case 2 :
		if(gameController.skillsExecuting[unitNumber, 0])		{
			//interrupt skill 1
			//apply skill effect
			StopCoroutine("LeonardoSkillOneCo");	
			StopCoroutine("ShootFlames");	
			
			//remove flames
			skillParticles[unitNumber, 0].transform.localPosition = Vector3(-500,2.5,2);
			skillParticles[unitNumber, 0].particleSystem.Stop();			
			
			//unfreeze
			gameController.frozen[unitNumber] = false;
			gameController.skillsExecuting[unitNumber, 0] = false;
			gameController.anims[unitNumber].Idle();
			skillSoundEffects[0].Stop();
		}
		//interrupt skill 2
		if(gameController.skillsExecuting[unitNumber, 1])		{
			//interrupt skill 1
			//apply skill effect
			StopCoroutine("LeonardoSkillTwoCo");				
			
			//unfreeze
			gameController.frozen[unitNumber] = false;
			gameController.skillsExecuting[unitNumber, 1] = false;
			gameController.anims[unitNumber].Idle();
		}
		//interrupt skill 3
		if(gameController.skillsExecuting[unitNumber, 2])		{
			StopCoroutine("LeonardoSkillThreeCo");
			//skill done, unfreeze
			gameController.frozen[unitNumber] = false;
			gameController.skillsExecuting[unitNumber, 2] = false;
			gameController.anims[unitNumber].Idle();
			StopCoroutine("StartSpiderSound");
			skillSoundEffects[2].Stop();
		}
		break;
	//graviton
	case 3 :
		//interrupt skill 3
		if(gameController.skillsExecuting[unitNumber, 2])		{
			StopCoroutine("PullToMe");
			StopCoroutine("StopPullToMe");
			skillSoundEffects[2].Stop();
			//unstun target
			gameController.stunned[target] = false;
			if(gameController.currentHealths[target] >= 1) {	
				gameController.aiPaths[target].canSearch = true; 
				gameController.aiPaths[target].canMove = true;
			}
			pulling = false;
			//skill done, unfreeze
			gameController.frozen[unitNumber] = false;
			gameController.skillsExecuting[unitNumber, 2] = false;
			gameController.anims[unitNumber].Idle();
			
			//stop pulling particle
			var parSys : Transform;
			parSys = gameController.targetObjects[unitNumber].transform.Find("Pulling");
			parSys.particleSystem.Stop();
			parSys.particleSystem.Clear();
			//stop enemy particle
			parSys = gameController.targetObjects[target].transform.Find("Pulled");
			parSys.particleSystem.Stop();
			parSys.particleSystem.Clear();							
		}
		break;
	}
}

//misc.
//dirty hacks for unity's sleep system
function Nudger (charNumber : int, duration : float) {
	var teamNumber : int = 1;
	var enemyNumber : int = 2;
	if(charNumber == 2) { teamNumber = 0; enemyNumber = 1; }
	
	for(var i : int; i < (60*duration)+1; i++)
	{
		if(i == 60*duration)	{
			break;
		}
		else	{
			//nudge non-structural enemies to allow for collisions
			//monster
			gameController.targetObjects[0].transform.position.x += Mathf.Epsilon;			
			//enemy char
			gameController.targetObjects[enemyNumber].transform.position.x += Mathf.Epsilon;			
			//enemy guardian, minions, and spider
			for(var j : int = 7+teamNumber; j < 35; j+=2)	{
			    gameController.targetObjects[j].transform.position.x += Mathf.Epsilon;
			}
			
			yield WaitForFixedUpdate();
		}
	}	
}