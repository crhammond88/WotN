#pragma strict

private var gameController : GameController;
private var skills : Skills;
private var opponentSkills : OpponentSkills;
private var characterNumber : int;

function Connect (){	
	gameController = GameObject.FindGameObjectWithTag("GameController").GetComponent(GameController);
	skills = GameObject.FindGameObjectWithTag("GameController").GetComponent(Skills);		
	opponentSkills = GameObject.FindGameObjectWithTag("GameController").GetComponent(OpponentSkills);
	
	if(this.transform.parent.parent.tag == "Player")	{		characterNumber = 1;	}
	else if(this.transform.parent.parent.tag == "EnemyCharacter")	{		characterNumber = 2;	}	
}

function BreakOff (){	transform.parent = null; 	}

function OnTriggerEnter (other : Collider){
	var target : int = gameController.unitNameToNumber[other.tag];
	var targetIsEnemy : boolean;
	//if its an enemy and not a structure or bob
	if(characterNumber == 2){  targetIsEnemy = target == 0 || target == 1 || (target > 6 && target < 35 && target+1 % 2 == 0);	}
	else					{  targetIsEnemy = target == 0 || target == 2 || (target > 6 && target < 35 && target % 2 == 0); 	}	
			
	if(targetIsEnemy)	{	
		//add enemy to tick list
		if(characterNumber == 1) { skills.inBlackHole[target] = true; }
		else {  opponentSkills.inBlackHole[target] = true; }
	}	
}

function OnTriggerExit (other : Collider){
	var target : int = gameController.unitNameToNumber[other.tag];
	//remove from tick list
	if(characterNumber == 1) {
		if(skills.inBlackHole[target])	{	skills.inBlackHole[target] = false;	}
	}
	else {
		if(opponentSkills.inBlackHole[target])	{	opponentSkills.inBlackHole[target] = false;	}
	}
}