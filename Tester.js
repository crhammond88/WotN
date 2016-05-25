#pragma strict

var buttonWidth = 80;
var buttonHeight = 30;
var boxWidth = buttonWidth * 1.25;
var numButtons = 2;
var boxX = (Screen.width/2) - (boxWidth/2);
var buttonX = boxX + ((boxWidth - buttonWidth)/2);

var test = Screen.width/2.0;
var test2 = Screen.width;

var mySkin : GUISkin;

function OnGUI () {

	GUI.skin = mySkin;
	
	// Make a background box
	GUI.Box (Rect (boxX,10,numButtons * 50, boxWidth), "Main Menu");


	if (GUI.Button (Rect (buttonX,30,buttonWidth, buttonHeight), "Play")) {
		Application.LoadLevel ("CharacterSelect");
	}

	if (GUI.Button (Rect (buttonX,80,buttonWidth, buttonHeight), "Settings")) {
		Application.LoadLevel ("Settings");
	}
}