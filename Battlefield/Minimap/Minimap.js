#pragma strict

var width : int = 368;
private var halfWidth : int = width/2;
var height : int = 134;
private var halfHeight : int = height/2;
var xPos : int;
var yPos : int = 75 - halfHeight;

var backgroundTransform : Transform;
var backgroundGUITexture : GUITexture;

function Start () { 	
	backgroundTransform = this.transform.Find("Background").transform;
	backgroundGUITexture = backgroundTransform.gameObject.GetComponent(GUITexture);
	
	AdjustSize();
}

function Update () {
	AdjustSize();
}

function AdjustSize () {
	if(Camera.main != null) {
		xPos = Camera.main.pixelWidth/2.0 - halfWidth;
		this.camera.pixelRect = Rect(xPos, yPos, width, height);
		
		//this.camera.pixelRect.center = Vector2(Camera.main.pixelWidth/2.0, Camera.main.pixelHeight/8.0);
		backgroundTransform.localScale.x = camera.rect.width + camera.rect.width/8.0;
		backgroundTransform.localScale.y = camera.rect.height + camera.rect.height/3.0;///(camera.rect.height + 0.07) - (camera.rect.height - 0.22);//camera.rect.height + (0.22 - camera.rect.height); //
		//backgroundGUITexture.pixelInset.y = 75; //63 + Camera.main.pixelHeight/50.0;
	}
}