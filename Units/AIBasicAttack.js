#pragma strict

private var gameController : GameController;
private var skills : Skills;
private var opponentSkills : OpponentSkills;
private var playerData : PlayerData;

function Connect () {
	gameController = GameObject.FindGameObjectWithTag("GameController").GetComponent(GameController);
	skills = GameObject.FindGameObjectWithTag("GameController").GetComponent(Skills);	
	opponentSkills = GameObject.FindGameObjectWithTag("GameController").GetComponent(OpponentSkills);	
	playerData = GameObject.FindGameObjectWithTag("Data").GetComponent(PlayerData);
}

function AIBasicAttack (attacker : int)	{
	var defender : int = gameController.currentTargets[attacker];
	var attackSoundEffect : AudioSource;
	for(var attackVar : int = 0; attackVar < 2; attackVar++)	{
		//if the attacker isnt a tower
		if(attacker != 3 && attacker != 4) {
			var relativePos : Vector3 = gameController.targetObjects[gameController.currentTargets[attacker]].transform.position - gameController.targetObjects[attacker].transform.position;
			if(relativePos.z != 0) {
				var targetRotation : Quaternion = Quaternion.LookRotation(relativePos);
				gameController.targetObjects[attacker].transform.rotation = targetRotation;
				gameController.targetObjects[attacker].transform.rotation.x = 0;
				gameController.targetObjects[attacker].transform.rotation.z = 0;
			}
		}
		//check if attack started/animation is finished
		if(attackVar == 1 && gameController.attacking[attacker])		{
			//if(gameController.inRange[attacker]) 	{
				var consume : boolean = false;	
				var basicDamageAmount : int = gameController.attackDamages[attacker] * (1-(gameController.damageReductions[gameController.currentTargets[attacker]]/100.0));
				if(attacker == 2 && gameController.characterSelected[attacker] == 3) {
					if(gameController.currentResources[attacker] >= 50) {
						//drain mana
						gameController.currentResources[attacker] -= 50;
						if(opponentSkills.fluctuating)  {
							//add extra damage
							basicDamageAmount += gameController.maxHealths[gameController.currentTargets[attacker]] * 0.05 * (1-(gameController.damageReductions[gameController.currentTargets[attacker]]/100.0));
						}
						opponentSkills.CheckFluctuate(2);
					}
					else {
						basicDamageAmount = (basicDamageAmount + gameController.maxHealths[gameController.currentTargets[attacker]] * 0.05) * gameController.currentResources[attacker]/50.0;
						gameController.currentResources[attacker] = 0;
					}
				}
				//Debug.Log("Attack by " + attacker + " hits " + gameController.currentTargets[attacker] + " for " + basicDamageAmount);
				gameController.Damage(basicDamageAmount, attacker, gameController.currentTargets[attacker]);
				
				//if its rosalind, give insight
				if(attacker == 2 && playerData.opponentSelected == 1)			{
					gameController.currentResources[attacker] = Mathf.Min(gameController.currentResources[attacker] + 10, 100);
				}
				//else if its leo and he's transformed
				else if(attacker == 2 && playerData.opponentSelected == 2 && gameController.skillsExecuting[attacker, 3]  && gameController.currentTargets[attacker] < 37)				{
					//if enemy has correct debuff
					if(opponentSkills.elementalDebuffCounts[defender, gameController.stances[attacker]] > 0)				{
						//apply extra effect
						if(!playerData.effectMuted) {
							attackSoundEffect = opponentSkills.skillSoundEffects[4];
							attackSoundEffect.volume = playerData.effectVolume/100.0;
							attackSoundEffect.transform.position = gameController.targetObjects[gameController.currentTargets[attacker]].transform.position;	
							attackSoundEffect.Play();	
						}
						opponentSkills.ConsumeElementalDebuff(attacker, defender, gameController.stances[attacker], basicDamageAmount);
						consume = true;
					}
				}
				//else if its a spider and its nots attacking a structure
				else if((attacker == 33 || attacker == 34) && (defender < 3 || defender > 6))			{
					//debuff
					//if target not at max debuff stacks
					if(opponentSkills.elementalDebuffCounts[defender, 3] < 3)			{
						var characterNumber : int = 1;
						if(attacker == 34){ characterNumber = 2; }
						//apply debuff
						opponentSkills.ElementalDebuff(characterNumber, defender, 3);
					}						
				}
				
				//if ranged
				var parTran : Transform;
				if(attacker == 2) {
					if(gameController.characterSelected[attacker] == 0 || (gameController.characterSelected[attacker] == 2 && gameController.skillsExecuting[attacker, 3] 
							&& gameController.stances[attacker] == 1) || gameController.characterSelected[attacker] == 3) {
						//stop old particles
						skills.StopParticle(gameController.targetObjects[attacker].transform.Find("Basic Attack"));
						//play particles
						parTran = gameController.targetObjects[attacker].transform.Find(gameController.targetObjects[attacker].tag + " Basic Attack Hit");
						if(consume) {
							parTran.particleSystem.startSize = 6;
							parTran.particleSystem.startSpeed = 7;
							
						}
						else if(gameController.characterSelected[attacker] == 2 && gameController.skillsExecuting[attacker, 3] && gameController.stances[attacker] == 1) {
							parTran.particleSystem.startSize = 2;
							parTran.particleSystem.startSpeed = 1.5;
						}
//						Debug.Log(gameController.targetObjects[attacker].tag + " is attacking " + gameController.targetObjects[gameController.currentTargets[attacker]].tag + "-" 
//							+ gameController.targetObjects[gameController.currentTargets[attacker]] + " at Time = " + Time.time);
						if(gameController.currentTargets[attacker] != 38) { gameController.ParticleHit(attacker, parTran);	}
						if(gameController.characterSelected[attacker] == 2 && gameController.skillsExecuting[attacker, 3]	&& !playerData.effectMuted) {
							attackSoundEffect = opponentSkills.skillSoundEffects[5];
							attackSoundEffect.volume = playerData.effectVolume/100.0;
							attackSoundEffect.transform.position = gameController.targetObjects[attacker].transform.position;	
							attackSoundEffect.Play();	
						}			
					}
				}
				else if((attacker > 20 && attacker < 33) || attacker == 3 || attacker == 4 || attacker == 7 || attacker == 8) {
					//stop old particles
					skills.StopParticle(gameController.targetObjects[attacker].transform.Find("Basic Attack"));
					parTran = gameController.targetObjects[attacker].transform.Find(gameController.targetObjects[attacker].tag + " Basic Attack Hit");
					//Debug.Log("Ranged " + parTran + " " + attacker);
//					Debug.Log(gameController.targetObjects[attacker].tag + " is attacking " + gameController.targetObjects[gameController.currentTargets[attacker]].tag + "-" 
//						+ gameController.targetObjects[gameController.currentTargets[attacker]] + " at Time = " + Time.time);
					if(gameController.currentTargets[attacker] != 38) { gameController.ParticleHit(attacker, parTran);	}		
				}
			//}
			gameController.attacking[attacker] = false;		
		}
		//start attack
		else	{
			//play sound
			if(!playerData.effectMuted && gameController.attackSoundEffects[attacker] != null) {
				attackSoundEffect = gameController.attackSoundEffects[attacker];
				attackSoundEffect.volume = playerData.effectVolume/100.0;
				attackSoundEffect.transform.position = gameController.targetObjects[attacker].transform.position;
				if(attacker == 0) {
					SoundDelay(attacker, attackSoundEffect, 0.3);
				}
				else {	attackSoundEffect.Play(); }
			}
			
			if(attacker < 3 || attacker > 6) {
				gameController.anims[attacker].Attack(gameController.attackSpeeds[attacker]);
			}
			//if ranged
			if(attacker == 2) {
				if(gameController.characterSelected[attacker] == 0 || gameController.characterSelected[attacker] == 3) {
					//play particles
					skills.PlayParticle(gameController.targetObjects[attacker].transform.Find("Basic Attack"), 0.95, true);
				}
				else if(gameController.characterSelected[attacker] == 2 && gameController.skillsExecuting[attacker,3] && gameController.stances[attacker] == 1) {
					//play particles
					skills.PlayParticle(gameController.targetObjects[attacker].transform.Find("Basic Attack"), 0.27, true);
				}
			}
			else if((attacker > 20 && attacker < 33) || attacker == 3 || attacker == 4 || attacker == 7 || attacker == 8) {
				skills.PlayParticle(gameController.targetObjects[attacker].transform.Find("Basic Attack"), 0.65, true);
			}
			
			yield WaitForSeconds((1.0/gameController.attackSpeeds[attacker]));
		}		
	}
}

function SoundDelay (attacker : int, attackSoundEffect : AudioSource, delayTime : float) {
	for(var i : int = 0; i < 2; i++) {
		if(i == 0) {
			yield WaitForSeconds(delayTime);
		}
		else if(gameController.attacking[attacker]) { attackSoundEffect.Play(); }
	}
}

function BobAttack (attackInfo : Vector4)	{	
	var attacker : int = attackInfo.x;
	
	var targetLocation : Vector3 = Vector3(attackInfo.y, attackInfo.z, attackInfo.w);
	var attackSoundEffect : AudioSource;
	for(var attackVar : int = 0; attackVar < 2; attackVar++)	{
		
		//check if animation is finished
		if(attackVar == 1)		{
			var charNumber : int = 1;
			if(attacker % 2 == 0) {	charNumber = 2;}	
			if(charNumber == 1) {	skills.BobKick(charNumber, attacker, targetLocation, (gameController.bobRunts[charNumber] % 5)+1);		}
			else {	opponentSkills.BobKick(charNumber, attacker, targetLocation, (gameController.bobRunts[charNumber] % 5)+1);		}
			gameController.bobRunts[charNumber]++;
			gameController.attacking[attacker] = false;
			break;		
		}
		else	{
			//play sound
			if(!playerData.effectMuted && gameController.attackSoundEffects[attacker] != null) {
				attackSoundEffect = gameController.attackSoundEffects[attacker];
				attackSoundEffect.volume = playerData.effectVolume/100.0;
				attackSoundEffect.transform.position = gameController.targetObjects[attacker].transform.position;
				attackSoundEffect.Play();
			}
			
			var relativePos : Vector3 = targetLocation - gameController.targetObjects[attacker].transform.position;
			if(relativePos.z != 0) {
				var targetRotation : Quaternion = Quaternion.LookRotation(relativePos);
				gameController.targetObjects[attacker].transform.rotation = targetRotation;
				gameController.targetObjects[attacker].transform.rotation.x = 0;
				gameController.targetObjects[attacker].transform.rotation.z = 0;
			}
			gameController.anims[attacker].Attack(gameController.attackSpeeds[attacker], true);
			yield WaitForSeconds((1.0/gameController.attackSpeeds[attacker]));
		}
		
	}
}