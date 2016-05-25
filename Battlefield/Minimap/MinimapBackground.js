#pragma strict

private var primaryColors : Color[] = [Color(0.2,0.25,0.05),Color(0.15,0,0),Color(0.075,0.175,0.35),Color(0.1,0.01,0.12)];

private var playerData : PlayerData;

function Awake () {
	playerData = GameObject.FindGameObjectWithTag("Data").GetComponent(PlayerData);	
	guiTexture.color = primaryColors[playerData.characterSelected];
}