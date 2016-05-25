#pragma strict

var origTextSize : int;

function Awake () {
	DontDestroyOnLoad (this.gameObject);
	this.guiText.enabled = false;	
	origTextSize = guiText.fontSize;
}

function Show ()	{
	this.guiText.text = "Loading...";
	this.guiText.enabled = true;
}

function Hide ()	{
	this.guiText.enabled = false;
}

function Update () {
	if(Camera.main) {
		//var scaleX : float = Camera.main.pixelWidth / 800;
		var scaleY : float = Camera.main.pixelHeight / 600;	
	//	guiText.pixelOffset = new Vector2(pixelOff.x*scaleX, pixelOff.y*scaleY);
		guiText.fontSize = origTextSize * scaleY;	
	}	
}