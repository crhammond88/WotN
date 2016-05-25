#pragma strict

private var gameController : GameController;
private var characterNumber : int;

var hasHeal : boolean[];
var hasManaHeal : boolean[];
var healAmounts : float[];
var manaAmounts : float[];

function Start (){	
	gameController = GameObject.FindGameObjectWithTag("GameController").GetComponent(GameController);
	
	if(this.tag == "PlayerBase")	{		characterNumber = 1;	}
	else if(this.tag == "EnemyCharacterBase")	{		characterNumber = 2;	}
		
	//buffer other colliders, ground, walls, ect
	hasManaHeal = new boolean[60];
	hasHeal = new boolean[60];
	healAmounts = new float[60];
	manaAmounts = new float[60];
}

function OnTriggerEnter (other : Collider){
	var target : int = gameController.unitNameToNumber[other.tag];
	var targetIsAlly : boolean;
	//if its an enemy and not a structure or bob
	if(characterNumber == 1){  targetIsAlly = target == 1 || (target > 6 && target < 35 && target % 2 != 0);	}
	else					{  targetIsAlly = target == 2 || (target > 6 && target < 35 && target % 2 == 0); 	}	
			
	if(targetIsAlly)	{
		healAmounts[target] = 100 + gameController.levels[target]*5;
		gameController.healthRegens[target] += healAmounts[target];
		if((target == 1 && gameController.characterSelected[1] > 0) || (target == 2 && gameController.characterSelected[2] > 0)) {
			hasManaHeal[target] = true;
			manaAmounts[target] = gameController.maxResources[target] * 0.2;
			gameController.resourceRegens[target] += manaAmounts[target];
		}
		hasHeal[target] = true;	
	}	
}

function OnTriggerExit (other : Collider){
	var target : int = gameController.unitNameToNumber[other.tag];	
	if(hasHeal[target])	{
		gameController.healthRegens[target] -= healAmounts[target];
		if(hasManaHeal[target]) {
			hasManaHeal[target] = false;
			gameController.resourceRegens[target] -= manaAmounts[target];
		}
		hasHeal[target] = false;	
	}
}
