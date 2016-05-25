#pragma strict
import Pathfinding;

var targetPosition : Vector3;
var controller : CharacterController;

var path : Path;
var speed : float = 100;
var nextWaypointDistance  : float = 3;
var currentWaypoint : int = 0;

function Start () {
	var seeker : Seeker = this.GetComponent("Seeker");
	controller = GetComponent(CharacterController);
	
	seeker.StartPath(transform.position,targetPosition, OnPathComplete);
}

function OnPathComplete (p : Path) {
	Debug.Log ("Yey, we got a path back. Did it have an error? "+p.error);
	if (!p.error) {
            path = p;
            //Reset the waypoint counter
            currentWaypoint = 0;
        }
}

function FixedUpdate () {
	if (path == null) {
	    //We have no path to move after yet
	    return;
	}

	if (currentWaypoint >= path.vectorPath.Count) {
	    Debug.Log ("End Of Path Reached");
	    return;
	}

	//Direction to the next waypoint
	var dir : Vector3 = (path.vectorPath[currentWaypoint]-transform.position).normalized;
	dir *= speed * Time.fixedDeltaTime;
	controller.SimpleMove (dir);

	//Check if we are close enough to the next waypoint
	//If we are, proceed to follow the next waypoint
	if (Vector3.Distance (transform.position,path.vectorPath[currentWaypoint]) < nextWaypointDistance) {
	    currentWaypoint++;
	    return;
	}
}

//import Pathfinding;
//var targetPosition : Vector3;  //destination
//var seeker : Seeker;  //aids in building this object's path
//var controller : CharacterController;  //the character controller of this object
//var path : Path;  //holds the path to follow
//var speed : float;  //speed along the path
//private var currentWaypoint : int = 0;
//
//function Start()
//{    //set target position as object in the scene with the ground target tag.
//     targetPosition = GameObject.FindWithTag("GroundTarget").transform.position;
//     GetNewPath();
//}
//
//function GetNewPath()
//{
//     seeker.StartPath(transform.position, targetPosition, OnPathComplete);
//}
//
//function OnPathComplete(newPath : Path)
//{
//     if(!newPath.error())
//     {
//          path = newPath;
//          currentWaypoint = 0;
//     }
//}
//
//function FixedUpdate()
//{
//     if(path == null){return;}
//     if(currentWaypoint >= path.vectorPath.length){/*We reached the end of this path...*/ return;}
//
//     //find direction to next waypoint
//     var dir : Vector3 = (path.vectorPath[currentWaypoint] - transform.position).normalized;
//     dir *= speed * Time.fixedDeltaTime;
//
//     //move!
//     controller.SimpleMove(dir);
//
//     //see video for how to rotate
//
//     //check if we are close enough to the next waypoint
//     if(Vector3.Distance(transform.position, path.vectorPath[currentWaypoint]) < nextWaypointDistance)
//     {
//          currentWaypoint++;
//     }    
//}