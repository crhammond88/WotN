#pragma strict

static private var playerColor : Material;
static private var opponentColor : Material;
static private var allyColor : Material;
static private var enemyColor : Material;
static private var monsterColor : Material;

//hashing
static private var unitData : UnitData;
static private var unitNameToNumber : Dictionary.<String,int> = new Dictionary.<String,int>();

function Awake () {
	 playerColor = new Material (Shader.Find("Diffuse"));
	 playerColor.color = Color.yellow;
	 opponentColor = new Material (Shader.Find("Diffuse"));
	 opponentColor.color = Color(1.0,0.5,0);
	 allyColor = new Material (Shader.Find(" Diffuse"));
	 allyColor.color = Color.yellow;
	 enemyColor = new Material (Shader.Find(" Diffuse"));
	 enemyColor.color = Color(1.0,0.5,0);
	 monsterColor = new Material (Shader.Find(" Diffuse"));
	 monsterColor.color = Color.black;	 
	 
	 unitData = GameObject.FindGameObjectWithTag("Data").GetComponent(UnitData);
}

function Start () {
	//hashing
	for(var i : int = 0; i < 37; i++)	{
		unitNameToNumber[unitData.unitNames[i]] = i;
	}
	//trash tags
	unitNameToNumber["Guardian"] = 45;
	unitNameToNumber["MeleeMinion"] = 47;
	unitNameToNumber["RangedMinion"] = 49;
	unitNameToNumber["Spider"] = 51;
	unitNameToNumber["Ralph"] = 51;
	unitNameToNumber["Rosalind"] = 51;
	unitNameToNumber["Leonardo"] = 51;
	unitNameToNumber["Graviton"] = 51;
	
	var myNum : int = unitNameToNumber[this.gameObject.transform.parent.tag];
	
	//monster
	if(myNum == 0) {	this.renderer.material = monsterColor;	}
	//enemy
	else if(myNum == 2)	{	this.renderer.material = opponentColor;	}
	//player
	else if(myNum == 1) {	this.renderer.material = playerColor;	}
	//enemy team
	else if(myNum % 2 == 0) {	this.renderer.material = enemyColor;	}
	//player team
	else {		this.renderer.material = allyColor;	}	
}
