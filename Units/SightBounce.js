#pragma strict

private var pushPower : float = 0.02;
var controller : CharacterController;
var parentTransform : Transform;
var gameController : GameController;
var colliderBounce : ColliderBounce;

var evading : boolean;
var self : int;
var newPosition : Vector3;
var aiPath : AIPath;
var tempTarget : Transform;

var evadeDirection : Vector3;
var directionSet : boolean;
var stoppingDirection : boolean;

function Awake (){
	parentTransform = transform.parent;
	aiPath = parentTransform.GetComponent(AIPath);
}

function Connect () {
	gameController = GameObject.FindGameObjectWithTag("GameController").GetComponent(GameController); 
	Debug.Log(this.transform.parent.tag);
	self = gameController.unitNameToNumber[this.transform.parent.tag];
	colliderBounce = parentTransform.GetComponent(ColliderBounce);
	tempTarget = colliderBounce.tempTarget;
}

//function OnTriggerEnter (obstacle : Collider) {
//	Debug.Log(obstacle);
//	var target : int = gameController.unitNameToNumber[obstacle.tag];
//	//if the obstacle isnt my target or a wall
//	if(target != gameController.currentTargets[self] && target < 36) {
//		if(!evading) {
//			evading = true;
//			EvadeCo(obstacle.collider.transform.position);
//		}
//		else {
//			StopCoroutine("EndEvadeCo");
//			EvadeCo(obstacle.collider.transform.position);
//		}
//	}
//}

function EvadeCo (colliderPosition : Vector3) {
	for(var i : int = 0; i < 2; i++) {
		switch (i) {
			case 0:				
				colliderBounce.trueTarget = aiPath.target;
				
				//check for left or right
				var myX : float = this.transform.position.x;
				var myZ : float = this.transform.position.z;	
				var newPosition : Vector3;
				if(!directionSet) {
					var newDirection : Vector3;
					if(myX < colliderPosition.x) {
						if(myZ < colliderPosition.z) {
							newDirection = Vector3(2, 0, 2);
							newPosition = this.transform.TransformPoint(newDirection);
						}
						else {
							newDirection = Vector3(-2, 0, 2);
							newPosition = this.transform.TransformPoint(newDirection);
						}
					}
					else {
						if(myZ < colliderPosition.z) {
							newDirection = Vector3(-2, 0, 2);
							newPosition = this.transform.TransformPoint(newDirection);
						}
						else {
							newDirection = Vector3(2, 0, 2);
							newPosition = this.transform.TransformPoint(newDirection);
						}
					}
					evadeDirection = newDirection;
					directionSet = true;
				}
				else {	newPosition = this.transform.TransformPoint(evadeDirection);	}
//				newPosition = this.transform.TransformPoint(2, 0, 2);
				if(tempTarget != null) {
					tempTarget.position = newPosition;
					aiPath.target = tempTarget;
				}
				Debug.Log("Dodging");
				StartCoroutine("EndEvadeCo", colliderBounce.trueTarget);				
				if(!stoppingDirection) { stoppingDirection = true; yield WaitForSeconds(3); }
				else { i = 100; }				
				break;
			case 1:
				if(directionSet) { directionSet = false; stoppingDirection = false; }
				break;
		}
	}
}
			
function EndEvadeCo (targetTransform : Transform) {
	for(var i : int = 0; i < 2; i++) {
		switch (i) {
			case 0:	
				yield WaitForSeconds(0.25);
				break;
			case 1:
				if(evading) {
					aiPath.target = targetTransform;
					evading = false;
					Debug.Log("Ending");
				}
				break;
		}
	}
}
