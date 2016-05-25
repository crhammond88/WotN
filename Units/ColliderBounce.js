#pragma strict

var controller : CharacterController;

var evading : boolean;
var targetObject : GameObject;
var trueTarget : Transform;
var tempTarget : Transform;
var newPosition : Vector3;
var aiPath : AIPath;
var secondEvade : boolean;

//var evadeDirection : Vector3;
//var directionSet : boolean;
//var stoppingDirection : boolean;

function Awake (){
	controller = GetComponent(CharacterController);
	
	evading = false;
	targetObject = new GameObject("BounceTargetOf" + tag);
	tempTarget = targetObject.transform;
	aiPath = GetComponent(AIPath);
}

function OnControllerColliderHit (hit : ControllerColliderHit) {	
	//EvadeCheck();
}

function EvadeCheck () {
	if(controller.collisionFlags & CollisionFlags.Sides && !evading) {
		//Debug.Log(this.tag + " collided.");
		var loc : Vector3 = transform.position;
		loc.y = 1;
		var p1 : Vector3 = loc;
		loc.y = 2;
		var p2 : Vector3 = loc; 
		var hitInfo : RaycastHit;
		var frontBlocked : boolean = Physics.CapsuleCast(p1, p2, 0.65, transform.forward, hitInfo, 2);
		var targetDirection : Vector3 = (aiPath.target.position - this.transform.position).normalized;
		var pathBlocked : boolean = Physics.CapsuleCast(p1, p2, 0.65, targetDirection, hitInfo, 4);	
		//Debug.Log(this.tag + " : PathBlocked = " + pathBlocked + ", FrontBlocked = " + frontBlocked);	
		if(frontBlocked && pathBlocked) {
			//Debug.Log(this.tag + " is evading.");
			//Debug.Log("evading " + hitInfo.collider);
			evading = true;
			trueTarget = aiPath.target;
			aiPath.speed += 2;
			EvadeCo();	
		}
		//else { Debug.Log("Sides bumped"); }
	}
}

function EvadeRecheck () {	
	var loc : Vector3 = transform.position;
	loc.y = 1;
	var p1 : Vector3 = loc;
	loc.y = 2;
	var p2 : Vector3 = loc; 
	var hitInfo : RaycastHit;
	//var hitInfo2 : RaycastHit;
	var frontBlocked : boolean = Physics.CapsuleCast(p1, p2, 0.65, transform.forward, hitInfo, 2);
	var targetDirection : Vector3 = (trueTarget.position - this.transform.position).normalized;	
	var pathBlocked : boolean = Physics.CapsuleCast(p1, p2, 0.65, targetDirection, hitInfo, 4);

	if(frontBlocked) {
		//Debug.Log("combo evading " + hitInfo.collider);
		EvadeCo();	
	}
	else if(pathBlocked) { ContinueForward();	}
	else {  FinishEvade();	}
}

function ContinueForward () {
	//Debug.Log("path blocked by " + col);
	tempTarget.position = this.transform.TransformPoint(-4, 0, 4);
	aiPath.SearchPath();
	StartCoroutine("EndEvadeCo", 0.05);	
}

function FinishEvade () {
	//Debug.Log("Finished Evading"); 
	aiPath.target = trueTarget;
	aiPath.SearchPath();
	evading = false;
	aiPath.speed -= 2;
}

function EvadeCo () {
//	for(var i : int = 0; i < 2; i++) {
//		switch (i) {
//			case 0:								
//				check for left or right
//				var myX : float = this.transform.position.x;
//				var myZ : float = this.transform.position.z;	
				var newPosition : Vector3;
//				if(!directionSet) {
//					var newDirection : Vector3;
//					if(myX < colliderPosition.x) {
//						if(myZ < colliderPosition.z) {
//							newDirection = Vector3(4, 0, 4);
//							newPosition = this.transform.TransformPoint(newDirection);
//						}
//						else {
//							newDirection = Vector3(-4, 0, 4);
//							newPosition = this.transform.TransformPoint(newDirection);
//						}
//					}
//					else {
//						if(myZ < colliderPosition.z) {
//							newDirection = Vector3(-4, 0, 4);
//							newPosition = this.transform.TransformPoint(newDirection);
//						}
//						else {
//							newDirection = Vector3(4, 0, 4);
//							newPosition = this.transform.TransformPoint(newDirection);
//						}
//					}
//					evadeDirection = newDirection;
//					directionSet = true;
//				}
//				else {	newPosition = this.transform.TransformPoint(evadeDirection);	}
				newPosition = this.transform.TransformPoint(4, 0, 4);
				if(tempTarget != null) {
					tempTarget.position = newPosition;
					aiPath.target = tempTarget;
					aiPath.SearchPath();
				}
				StartCoroutine("EndEvadeCo", 0.2);			
//				if(!stoppingDirection) { stoppingDirection = true; yield WaitForSeconds(3); }
//				else { i = 100; }
//				break;
//			case 2:
//				if(directionSet) { directionSet = false; stoppingDirection = false; }
//				break;
//		}
//	}
}
			
function EndEvadeCo (delay : float) {
	for(var i : int = 0; i < 3; i++) {
		switch (i) {
			case 0:	
				yield WaitForSeconds(delay);	
				break;
			case 1:
				//Debug.Log("Checking for End....");
				EvadeRecheck();
				break;
		}
	}
}

function StopEvade () {
	StopCoroutine("EndEvadeCo");
	//Debug.Log("Stopping");
	aiPath.target = trueTarget;
	aiPath.SearchPath();
	evading = false; 
	aiPath.speed -= 2;
}

function CancelEvade () {
	StopCoroutine("EndEvadeCo");
	//Debug.Log("Canceling");
	evading = false;
	aiPath.speed -= 2; 
}
