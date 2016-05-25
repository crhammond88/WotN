#pragma strict

private var gameController : GameController;
private var skills : Skills;
private var opponentSkills : OpponentSkills;
private var characterNumber : int;

var inFire: boolean[];

function Connect (){
	gameController = GameObject.FindGameObjectWithTag("GameController").GetComponent(GameController);
	skills = GameObject.FindGameObjectWithTag("GameController").GetComponent(Skills);	
	opponentSkills = GameObject.FindGameObjectWithTag("GameController").GetComponent(OpponentSkills);
	
	if(this.transform.parent.parent.tag == "Player")	{	characterNumber = 1;	}
	else if(this.transform.parent.parent.tag == "EnemyCharacter")	{	characterNumber = 2;	}
	
	inFire = new boolean[60];
}

function OnTriggerEnter (other : Collider){
	var target : int = gameController.unitNameToNumber[other.tag];
	var targetIsEnemy : boolean;
	//if its an enemy and not a structure
	if(characterNumber == 2){  targetIsEnemy = target == 0 || target == 1 || (target > 6 && target < 37 && target+1 % 2 == 0);	}
	else					{  targetIsEnemy = target == 0 || target == 2 || (target > 6 && target < 37 && target % 2 == 0); 	}	
			
	if(targetIsEnemy)	{
		inFire[target] = true;	
		MultiHit(target);
	}
	
}

function OnTriggerExit (other : Collider){
	var target : int = gameController.unitNameToNumber[other.tag];	
	if(inFire[target])	{		inFire[target] = false;		}
}

function MultiHit (target : int){
	for(;;)	{
		if(inFire[target])		{
			//damage             (damageAmount : int, attackerNumber : int, targetNumber : int)		
			gameController.Damage(40 * gameController.skillLevels[characterNumber,0], characterNumber, target);	
			//debuff
			if(characterNumber == 1) {
				if(skills.elementalDebuffCounts[target, 2] < 3)		{	skills.ElementalDebuff(characterNumber, target, 1);		}
			}
			else {
				if(opponentSkills.elementalDebuffCounts[target, 2] < 3)		{	opponentSkills.ElementalDebuff(characterNumber, target, 1);		}
			}
			yield WaitForSeconds(0.33);
		}
		else	{	break;	}
	}		
}