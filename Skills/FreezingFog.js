#pragma strict

private var gameController : GameController;
private var skills : Skills;
private var opponentSkills : OpponentSkills;
private var characterNumber : int;

var hasSlow : boolean[];
var slowAmounts : float[];

function Connect (){	
	gameController = GameObject.FindGameObjectWithTag("GameController").GetComponent(GameController);
	skills = GameObject.FindGameObjectWithTag("GameController").GetComponent(Skills);	
	opponentSkills = GameObject.FindGameObjectWithTag("GameController").GetComponent(OpponentSkills);
	
	if(this.transform.parent.parent.tag == "Player")	{		characterNumber = 1;	}
	else if(this.transform.parent.parent.tag == "EnemyCharacter")	{		characterNumber = 2;	}
		
	//buffer other colliders, ground, walls, ect
	hasSlow = new boolean[60];
	slowAmounts = new float[39];
}

function BreakOff (){	transform.parent = null;}

function OnTriggerEnter (other : Collider){
	var target : int = gameController.unitNameToNumber[other.tag];
	var targetIsEnemy : boolean;
	//if its an enemy and not a structure or bob
	if(characterNumber == 2){  targetIsEnemy = target == 0 || target == 1 || (target > 6 && target < 35 && target+1 % 2 == 0);	}
	else					{  targetIsEnemy = target == 0 || target == 2 || (target > 6 && target < 35 && target % 2 == 0); 	}	
			
	if(targetIsEnemy)	{
		//slow 
		slowAmounts[target] = gameController.movementSpeeds[target] * (0.3*gameController.skillLevels[characterNumber, 1]);
		gameController.movementSpeeds[target] -= slowAmounts[target];
		gameController.aiPaths[target].speed -= slowAmounts[target];
		hasSlow[target] = true;	

		//add debuff every second in fog
		StackDebuff(target);
	}	
}

function OnTriggerExit (other : Collider){
	var target : int = gameController.unitNameToNumber[other.tag];	
	if(hasSlow[target])	{
		gameController.movementSpeeds[target] += slowAmounts[target];
		gameController.aiPaths[target].speed += slowAmounts[target];
		hasSlow[target] = false;	
	}
}

function StackDebuff (target : int){
	for(;;)	{
		if(hasSlow[target])		{
			//debuff
			if(characterNumber == 1) {
				if(skills.elementalDebuffCounts[target, 2] < 3)		{	skills.ElementalDebuff(characterNumber, target, 2);		}
			}
			else {
				if(opponentSkills.elementalDebuffCounts[target, 2] < 3)		{	opponentSkills.ElementalDebuff(characterNumber, target, 2);		}
			}
			yield WaitForSeconds(1);
		}
		else	{	break;	}
	}		
}
