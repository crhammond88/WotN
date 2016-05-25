#pragma strict

private var gameController : GameController;

function Awake ()
{
	gameController = GameObject.FindGameObjectWithTag("GameController").GetComponent(GameController);
}

function Start () 
{

	this.gameObject.transform.position = gameController.targetObjects[2].transform.position;

}

function FixedUpdate () 
{
	this.gameObject.transform.position = gameController.targetObjects[2].transform.position;
}