#pragma strict

private var redGemsMain : int;
private var blueGemsMain : int;
private var purpleGemsMain : int;

private var playerData : PlayerData;
private var mainMenu : MainMenuGUI;

var pixelOff : Vector2;
var origTextSize : int;

function Start () {
	//count gems
	for(var i : int = 0; i < 4; i++)	{
		//for each difficulty
		for(var m : int = 0; m < 5; m++)		{
			//for each opponent char, sum gems earned
			for(var n : int = 0; n < 4; n++)	{
				if(playerData.gems[i*20 + m*4 + n] >= 1)	{
					redGemsMain += 1;
				}
				if(playerData.gems[i*20 + m*4 + n] >= 2)	{
					blueGemsMain += 1;
				}
				if(playerData.gems[i*20 + m*4 + n] == 3)	{
					purpleGemsMain += 1;
				}
			}
		}
	}
	switch(this.name) {
	case "RedGemDisplay":
		guiText.text = "" + redGemsMain;
		break;
	case "BlueGemDisplay":
		guiText.text = "" + blueGemsMain;
		break;
	case "PurpleGemDisplay":
		guiText.text = "" + purpleGemsMain;
		break;
	}
	
	mainMenu = Camera.main.GetComponent(MainMenuGUI);
	WaitForMenu();	
	
	pixelOff = guiText.pixelOffset;
	origTextSize = guiText.fontSize;
}

function WaitForMenu () {
	for(;;) {
		if(mainMenu.isReady) {
			guiText.enabled = true;
			break;
		}
		else { yield WaitForFixedUpdate; }
	}
}

function Update () {
	if(Camera.main) {
		var scaleX : float = Camera.main.pixelWidth / 800;
		var scaleY : float = Camera.main.pixelHeight / 600;
		guiText.pixelOffset = new Vector2(pixelOff.x*scaleX, pixelOff.y*scaleY);
		guiText.fontSize = origTextSize * scaleX;	
	}
}