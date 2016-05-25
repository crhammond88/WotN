#pragma strict

private var gameController : GameController;
private var skills : Skills;
private var opponentSkills : OpponentSkills;
private var characterNumber : int;

function Connect (){
	gameController = GameObject.FindGameObjectWithTag("GameController").GetComponent(GameController);
	skills = GameObject.FindGameObjectWithTag("GameController").GetComponent(Skills);	
	opponentSkills = GameObject.FindGameObjectWithTag("GameController").GetComponent(OpponentSkills);	
	
	if(this.transform.parent.parent.tag == "Player")	{
		characterNumber = 1;
	}
	else if(this.transform.parent.parent.tag == "EnemyCharacter")	{
		characterNumber = 2;
	}
}

function OnTriggerEnter (other : Collider){
	var name : String = other.tag;
	var target : int = gameController.unitNameToNumber[name];
	var targetIsEnemy : boolean;
	//if its an enemy and not a structure
	if(characterNumber == 2){  targetIsEnemy = target == 0 || target == 1 || (target > 6 && target < 37 && target+1 % 2 == 0);	}
	else					{  targetIsEnemy = target == 0 || target == 2 || (target > 6 && target < 37 && target % 2 == 0); 	}	
			
	if(targetIsEnemy)	{
		var unitNumbers : Vector2;
		var parSys : Transform;
		if(characterNumber == 1) {
			if(!skills.pulling && !gameController.stunned[characterNumber]) {
				skills.StopCoroutine("GravitonSkillThreeCo");
				gameController.currentTargets[characterNumber] = target;
				//pull
				skills.pulling = true;
				unitNumbers = new Vector2(characterNumber, target);			
				//stop particle
				parSys = gameController.targetObjects[characterNumber].transform.Find("Pull");
				parSys.particleSystem.Stop();
				parSys.particleSystem.Clear();
				parSys.animation.Stop();
				parSys.Find("PullBox").collider.enabled = false;
				//call pulling particle
				parSys = gameController.targetObjects[characterNumber].transform.Find("Pulling");
				parSys.particleSystem.Play();
				//call enemy particle
				parSys = gameController.targetObjects[target].transform.Find("Pulled");
				parSys.particleSystem.Play();			
				skills.StartCoroutine("PullToMe", unitNumbers);
				skills.StartCoroutine("StopPullToMe", unitNumbers);				
			}
		}
		else { 
			if(!opponentSkills.pulling && !gameController.stunned[characterNumber]) {
				opponentSkills.StopCoroutine("GravitonSkillThreeCo");
				gameController.currentTargets[characterNumber] = target;
				//pull
				opponentSkills.pulling = true;
				unitNumbers = new Vector2(characterNumber, target);			
				//stop particle
				parSys = gameController.targetObjects[characterNumber].transform.Find("Pull");
				parSys.particleSystem.Stop();
				parSys.particleSystem.Clear();
				parSys.animation.Stop();
				parSys.Find("PullBox").collider.enabled = false;
				//call pulling particle
				parSys = gameController.targetObjects[characterNumber].transform.Find("Pulling");
				parSys.particleSystem.Play();
				//call enemy particle
				parSys = gameController.targetObjects[target].transform.Find("Pulled");
				parSys.particleSystem.Play();			
				opponentSkills.StartCoroutine("PullToMe", unitNumbers);
				opponentSkills.StartCoroutine("StopPullToMe", unitNumbers);				
			}
		}
	}	
}
