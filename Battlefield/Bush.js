#pragma strict

private var gameController : GameController;
private var characterNumber : int;
var canSee : boolean;
var alliesInside : int;

function Connect (){
	alliesInside = 0;
	canSee = false;
	gameController = GameObject.FindGameObjectWithTag("GameController").GetComponent(GameController);
	renderer.material.shader = Shader.Find("Transparent/Cutout/Soft Edge Unlit");
}

function OnTriggerEnter (other : Collider){
	var target : int = gameController.unitNameToNumber[other.tag];
	if(target != 0 && target < 37) {
		if(target % 2 != 0) { 
			if(!canSee) {
				renderer.material.shader = Shader.Find("Unlit/Transparent Cutout"); 
				canSee = true;	
			}
			alliesInside += 1;
		}
	}
}

function OnTriggerExit (other : Collider) {
	var target : int = gameController.unitNameToNumber[other.tag];
	if(target != 0 && target < 37) {
		if(target % 2 != 0) { 
			alliesInside -= 1;
			if(alliesInside == 0) {
				renderer.material.shader = Shader.Find("Transparent/Cutout/Soft Edge Unlit"); 
				canSee = false;
			}
		}
	}
}