#pragma strict

var isSpinning : boolean;
var yRotation : float;

function Start () {
	isSpinning = true;
	yRotation = 0;
}

function FixedUpdate () {
	if(isSpinning) {
		yRotation += 0.5;
		this.transform.rotation = Quaternion.Euler(270,yRotation,0);
	}
}