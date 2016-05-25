#pragma strict

var groundMask : LayerMask;
var startingPosition : Vector3 = Vector3(-75, 12, -10);

static private var scrollSpeed : float;
//top z40, left x-80, right x80
static private var battlefieldSides : float = 83f;//+1
static private var battlefieldSidesScaled : float;
static private var battlefieldTop : float  = 39f;//+2
static private var battlefieldTopScaled : float;
static private var battlefieldBottom : float  = -14f;//

//top of bottom z15, left of top x-50, right of top x50
static private var zLimit : float = 30; // + 10 - zoomValue
static private var xLimit : float = 60; // + 10 - zoomValue
static private var slantSlope : float  = 1.5f; 

static private var cameraMoved : boolean;
static private var onlyBottomMoved : boolean;
static private var cameraMovement : Vector3;
static private var zoomingOut : boolean;
var cameraJump : boolean;
var minimapJump : boolean;

static private var mousePosX : int;
static private var mousePosY : int;

static private var playerData : PlayerData;
static private var gameController : GameController;

var cameraTopRight : Vector3;
var cameraTopLeft : Vector3;
var cameraBottomRight : Vector3;
var cameraBottomLeft : Vector3;

private var boundTopRight : Transform;
private var boundTopLeft : Transform;
private var boundBottomRight : Transform;
private var boundBottomLeft : Transform;

function Awake ()	{
	playerData = GameObject.FindGameObjectWithTag("Data").GetComponent(PlayerData);
	gameController = GameObject.FindGameObjectWithTag("GameController").GetComponent(GameController);
	transform.position.y = playerData.zoomValue;
	cameraMoved = false;
	onlyBottomMoved = false;
	zoomingOut = false;
	cameraJump = false;
	
	CameraJump(startingPosition);
	this.transform.position.y = playerData.zoomValue;
	
	boundTopRight = GameObject.FindGameObjectWithTag("TopRight").transform;
	boundTopLeft = GameObject.FindGameObjectWithTag("TopLeft").transform;
	boundBottomRight = GameObject.FindGameObjectWithTag("BottomRight").transform;
	boundBottomLeft = GameObject.FindGameObjectWithTag("BottomLeft").transform;
}

function Start () {	
	MinimapBounds();
}

function Update()	{
	if(!gameController.gameOver) { 
		//toggle camera lock
		if(Input.GetKeyDown(playerData.keySettings[8]))	{
			playerData.cameraLocked = !playerData.cameraLocked;
		}
		//jump to char
		else if(Input.GetKeyDown(playerData.keySettings[9])) { 
			if(gameController.currentHealths[1] > 0)	{	CameraJump(gameController.targetObjects[1].transform.position);		}
			else { CameraJump(startingPosition);	}
			MinimapBounds();
		}
		//jump to target
		else if(Input.GetKeyDown(playerData.keySettings[10])) { 
			if(gameController.currentHealths[1] > 0 && gameController.viewTarget != 38)	{	CameraJump(gameController.targetObjects[gameController.viewTarget].transform.position);	}
			MinimapBounds();
		}
		if(!gameController.paused)	{
			if(!playerData.cameraLocked)		{
				CheckMovement();
				if(cameraMoved)			{
					ScrollCamera();
					MinimapBounds();
				}
			}
			if(!playerData.zoomLocked)		{
				ZoomCamera();
				MinimapBounds();
			}
		}
	}
}

function FixedUpdate ()	{
	if(!gameController.paused && !gameController.gameOver)	{
		if(cameraMoved)		{
			ScrollCamera();
			MinimapBounds();
		}
		else if(playerData.cameraLocked) {
			if(gameController.currentHealths[1] > 0)	{	CameraJump(gameController.targetObjects[1].transform.position);		}
				MinimapBounds();		
		}	
	}
}

function CameraJump (targetLocation : Vector3) {
	camera.transform.position.x = targetLocation.x;
	if(targetLocation.z > -4) { 
		camera.transform.position.z = targetLocation.z - Mathf.Max(playerData.zoomValue-7, 3);
	}
	else {
		camera.transform.position.z = battlefieldBottom;
	}
}

function MinimapBounds () {
	 var ray : Ray = Camera.main.ViewportPointToRay (Vector3(1,1,0));
     var hit : RaycastHit;
     if (Physics.Raycast (ray, hit, 100, groundMask))     {
    	 boundTopRight.position.x = hit.point.x; 
    	 boundTopRight.position.z = hit.point.z; 
     }
     ray = Camera.main.ViewportPointToRay (Vector3(0,1,0));
     if (Physics.Raycast (ray, hit, 100, groundMask))     {
    	 boundTopLeft.position.x = hit.point.x; 
    	 boundTopLeft.position.z = hit.point.z;
     }
     ray = Camera.main.ViewportPointToRay (Vector3(1,0,0));
     if (Physics.Raycast (ray, hit, 100, groundMask))     {
    	 boundBottomRight.position.x = hit.point.x; 
    	 boundBottomRight.position.z = hit.point.z;
     }
     ray = Camera.main.ViewportPointToRay (Vector3(0,0,0));
     if (Physics.Raycast (ray, hit, 100, groundMask))     {
    	 boundBottomLeft.position.x = hit.point.x; 
    	 boundBottomLeft.position.z = hit.point.z;
     }     
}

function CheckMovement() {
	mousePosX = Input.mousePosition.x; 
	mousePosY = Input.mousePosition.y; 
	cameraMovement = Vector3(0, 0, 0);
	onlyBottomMoved = false;
		
	//MATH IS FUN! XD	
	//left		
	if ((Input.GetKey(KeyCode.LeftArrow) || Input.GetKey(KeyCode.A) || 
		(playerData.mouseScrollOn && (mousePosX < playerData.sideScrollDistance && 
		(mousePosY > playerData.botScrollPadding && mousePosY < camera.pixelHeight - playerData.topScrollPadding))))) 	{ 
		battlefieldSidesScaled = battlefieldSides - playerData.zoomValue + 3;
		//check if at sides
		if(transform.position.x > -battlefieldSidesScaled)		{
			zLimit = 15 + 10 - playerData.zoomValue;
			//check if at top
			if(transform.position.z > zLimit)			{ 
				//check if at slant
				battlefieldSidesScaled = battlefieldSides - (slantSlope * (transform.position.z-zLimit)) - (playerData.zoomValue - 3);
				if(transform.position.x < -battlefieldSidesScaled)				{
					 cameraMovement.x -= 0.5f * slantSlope;
					 cameraMovement.z -= 0.5f; 
				}
				//in the middle top
				else				{
					cameraMovement.x -= 1; 					
				}
			}
			//in the bottom
			else			{
				cameraMovement.x -= 1;
				
			}
			cameraMoved = true;
			gameController.leftCamera = true;
		}
	}
	else	{
		gameController.leftCamera = false;
	}
	//right 
	if ((Input.GetKey(KeyCode.RightArrow) || Input.GetKey(KeyCode.D) || 
		(playerData.mouseScrollOn && (mousePosX > camera.pixelWidth - playerData.sideScrollDistance && 
		(mousePosY > playerData.botScrollPadding && mousePosY < camera.pixelHeight - playerData.topScrollPadding)))))	{ 
		battlefieldSidesScaled = battlefieldSides - playerData.zoomValue + 3;
		//check if at sides
		if(transform.position.x < battlefieldSidesScaled)		{	
			zLimit = 15 + 10 - playerData.zoomValue;
			//check if at top area
			if(transform.position.z > zLimit)			{ 
				battlefieldSidesScaled = battlefieldSides - (slantSlope * (transform.position.z-zLimit)) - playerData.zoomValue + 3 ;
				//check if at slant area
				if(transform.position.x > battlefieldSidesScaled)				{
					 cameraMovement.x += 0.5f * slantSlope;
					 cameraMovement.z -= 0.5f; 
				}
				//in the middle top
				else				{
					cameraMovement.x += 1; 
				}
			}
			//in the bottom
			else			{
				cameraMovement.x += 1;
				
			}
			cameraMoved = true;
			gameController.rightCamera = true;
		}
	}
	else	{
		gameController.rightCamera = false;
	}
	
	//down
	if(transform.position.z >= battlefieldBottom) {
		var moveDown : boolean = false;
		if(Input.GetKey(KeyCode.DownArrow) || Input.GetKey(KeyCode.S)) { moveDown = true; }
		if(playerData.mouseScrollOn && (mousePosY > playerData.botScrollPadding && 
			mousePosY < playerData.botScrollDistance)) {
			if(!delayDownStarted) { delayDownStarted = true; StartCoroutine("StartDelayDown"); }
			else if(delayDownFinished) { moveDown = true; }
		}
		else { 
			if(delayDownStarted) {
				StopCoroutine("StartDelayDown");
				delayDownStarted = false;
				delayDownFinished = false;
			} 
		}
		if(moveDown) {
			if(cameraMoved)	{	cameraMovement.z -= 0.5f; }
			else	{ cameraMovement.z -= 1; onlyBottomMoved = true;  }
			cameraMoved = true;
			gameController.bottomCamera = true;
		}
		else	{
				gameController.bottomCamera = false;
		}	
	}
	else	{
		gameController.bottomCamera = false;
	}
	//up 
	var moveUp : boolean = false;
	
	if(Input.GetKey(KeyCode.UpArrow) || Input.GetKey(KeyCode.W)) { moveUp = true; } 
	if(playerData.mouseScrollOn && mousePosY < camera.pixelHeight - playerData.topScrollPadding && 
		mousePosY > camera.pixelHeight - playerData.topScrollDistance) 	{ 
		if(!delayUpStarted) { delayUpStarted = true; StartCoroutine("StartDelayUp"); }
		else if(delayUpFinished) { moveUp = true; }
	}
	else { 
		if(delayUpStarted) {
			StopCoroutine("StartDelayUp");
			delayUpStarted = false;
			delayUpFinished = false;
		} 
	}
	if(moveUp) { 		
		//check if at top
		battlefieldTopScaled = battlefieldTop - playerData.zoomValue + 3;
		if(transform.position.z < battlefieldTopScaled)		{	
			xLimit = 50 + 10 - playerData.zoomValue;
			//check if at right side area //move left too if at right limit
			if(transform.position.x > xLimit)			{ 
				battlefieldTopScaled = battlefieldTop - (1.0/slantSlope * (transform.position.x-xLimit)) - playerData.zoomValue + 3;
				//check if at slant area
				if(transform.position.z > battlefieldTopScaled)				{
					 cameraMovement.x -= 0.5f * slantSlope;
					 cameraMovement.z += 0.5f; 
				}
				//else bottom corner
				else				{
					if(cameraMoved && !onlyBottomMoved)			{		cameraMovement.z += 0.5f;			}
					else			{			cameraMovement.z += 1; 				} 
				}
				cameraMoved = true; 
				gameController.topCamera = true;
				
			}
			//check if at left side area //move right too if at left limit
			else if(transform.position.x < -xLimit)			{
				battlefieldTopScaled = battlefieldTop + (1.0/slantSlope * (transform.position.x+xLimit)) - playerData.zoomValue + 3;
				//check if at slant area
				if(transform.position.z > battlefieldTopScaled)				{
						 cameraMovement.x += 0.5f * slantSlope;
						 cameraMovement.z += 0.5f; 
				}
				//else bottom corner
				else				{
					if(cameraMoved && !onlyBottomMoved)				{
						cameraMovement.z += 0.5f;
					}
					else				{
						cameraMovement.z += 1; 
					} 
				}
				cameraMoved = true; 
				gameController.topCamera = true;	
			}
			//else in the middle
			else		{
				battlefieldTopScaled = battlefieldTop;
				if(transform.position.z < battlefieldTop)			{
					if(cameraMoved && !onlyBottomMoved)		{
						cameraMovement.z += 0.5f;
					}
					else		{
						cameraMovement.z += 1; 
					} 
					cameraMoved = true; 
					gameController.topCamera = true;
				}		
			}
		}
	}
	else	{
			gameController.topCamera = false;
	}
}

var delayDownStarted : boolean = false;
var delayDownFinished : boolean = false;
var delayUpStarted : boolean = false;
var delayUpFinished : boolean = false;

function StartDelayDown () {
	for(var i : int = 0; i < 2; i++) {
		switch(i) {
		case 0:			
			yield WaitForSeconds(0.15);
			break;
		case 1:
			delayDownFinished = true;
		}
	}	
}

function StartDelayUp () {
	for(var i : int = 0; i < 2; i++) {
		switch(i) {
		case 0:			
			yield WaitForSeconds(0.15);
			break;
		case 1:
			delayUpFinished = true;
		}
	}	
}

function ScrollCamera()	{
	scrollSpeed = playerData.scrollSpeed;
	transform.position += cameraMovement * scrollSpeed * Time.deltaTime;
	cameraMoved = false; 
}

function ZoomCamera() {
	//zoom in
	if(playerData.zoomValue > playerData.minZoom)	{
		if(Input.GetKey(playerData.keySettings[11]))
		{
			scrollSpeed = playerData.scrollSpeed/2;
			transform.position.y += -scrollSpeed * Time.deltaTime;
			playerData.zoomValue = transform.position.y;
		}
		else if(Input.GetAxis("Mouse ScrollWheel") > 0)		{
			scrollSpeed = playerData.scrollSpeed * 2;
			transform.position.y += -scrollSpeed * Time.deltaTime;
			playerData.zoomValue = transform.position.y;
		}		
	}
	//zoom out
	if(playerData.zoomValue < playerData.maxZoom)	{
		if(Input.GetKey(playerData.keySettings[12]))		{
			scrollSpeed = playerData.scrollSpeed/2;
			zoomingOut = true;
			
		}
		else if(Input.GetAxis("Mouse ScrollWheel") < 0)		{
			scrollSpeed = playerData.scrollSpeed * 2;
			zoomingOut = true;
		}	
	}
	
	if(zoomingOut)	{
		transform.position.y += scrollSpeed * Time.deltaTime; 		
		
		battlefieldTopScaled = battlefieldTop - playerData.zoomValue + 3;
		battlefieldSidesScaled = battlefieldSides - playerData.zoomValue + 3;
		zLimit = 15 + 10 - playerData.zoomValue;
		xLimit = 50 + 10 - playerData.zoomValue;
		//if above scaled battlefieldTop, push downwards
		if(transform.position.z > battlefieldTopScaled)		{			
			//move down
			transform.position.z -= scrollSpeed * Time.deltaTime;
		}
		
		//if left of scaled battlefiedSides, push right
		if(transform.position.x < -battlefieldSidesScaled)		{	
			//move right
			transform.position.x += scrollSpeed * Time.deltaTime;
		}
		
		//if right of scaled battlefiedSides, push left
		if(transform.position.x > battlefieldSidesScaled)		{	
			//move left
			transform.position.x -= scrollSpeed * Time.deltaTime;
		}
		
		//if above scaled zLimit, push down
		if(transform.position.z > zLimit && (transform.position.x > xLimit || transform.position.x < -xLimit))		{	
			//move down
			transform.position.z -= scrollSpeed * Time.deltaTime;
			
			//if left of scaled left xLimit, push right
			if(transform.position.x < -xLimit)			{	
				//move right
				transform.position.x += scrollSpeed * Time.deltaTime;
			}
			
			//if right of scaled right xLimit, push left
			if(transform.position.x > xLimit)			{	
				//move left
				transform.position.x -= scrollSpeed * Time.deltaTime;
			}
		}		
		
		playerData.zoomValue = transform.position.y;		
		zoomingOut = false;
	}
}


