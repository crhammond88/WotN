#pragma strict

private var anim : Animator;
private var thisCharacter : String;

private var gravitonAttackLength : float = 1.6;

function Awake (){
	thisCharacter = this.gameObject.tag;	
	if(thisCharacter == "Graviton" || thisCharacter == "AnimationGraviton")	{	anim = this.GetComponent(Animator);	}
} 

function Idle () {
	if(thisCharacter == "Graviton")	{		
		anim.SetBool("isRunning", false);
		anim.SetBool("attacking", false);
		anim.SetBool("pulling", false);
		anim.SetBool("isSkillOne", false);
		anim.SetBool("isSkillTwo", false);	
		anim.SetBool("softIdling", false);	
		anim.speed = 1;
		anim.SetBool("idling", true);		
	}
	else if(thisCharacter == "AnimationGraviton") {	}
	else	{	animation.Play("idle");	}
}

function SoftIdle () {
	if(thisCharacter == "Graviton")	{
		anim.SetBool("isRunning", false);
		anim.SetBool("attacking", false);
		anim.SetBool("pulling", false);
		anim.SetBool("isSkillOne", false);
		anim.SetBool("isSkillTwo", false);
		anim.SetBool("idling", false);
		anim.speed = 1;
		anim.SetBool("softIdling", true);	
	}
	else if(thisCharacter == "AnimationGraviton") {	}
	else	{	animation.CrossFade("idle", 0.25f);	}
}

function Run (runSpeed : int) {
	if(thisCharacter == "Graviton")	{		
		anim.SetBool("attacking", false);
		anim.SetBool("pulling", false);
		anim.SetBool("isSkillOne", false);
		anim.SetBool("isSkillTwo", false);
		anim.SetBool("idling", false);
		anim.SetBool("softIdling", false);
		anim.speed = runSpeed/6.0;
		anim.SetBool("isRunning", true);
	}
	else	{
		animation["run"].speed = runSpeed/6.0;
		animation.Play("run");
	}	
}

//function GotHit () {	animation.Play("gothit");	}
function Die (unitNumber : int) {	
	if(thisCharacter == "Graviton")	{	}
	else if(thisCharacter == "AnimationGraviton") {
		anim.speed = 1.0;
		anim.SetTrigger("death");
	}
	else if(unitNumber == 35 || unitNumber == 36) {
		animation.Play("bobDeath");
	}
	else	{	animation.Play("death");	}		
}

function Attack (attackSpeed : float) { Attack(attackSpeed, false); }
function Attack (attackSpeed : float, isBob : boolean) {
	if(thisCharacter == "Graviton")	{
		anim.SetBool("isRunning", false);
		anim.SetBool("attacking", false);
		anim.SetBool("pulling", false);
		anim.SetBool("isSkillOne", false);
		anim.SetBool("isSkillTwo", false);
		anim.SetBool("idling", false);
		anim.SetBool("softIdling", false);
		anim.speed = (attackSpeed*gravitonAttackLength);
		anim.SetBool("attacking", true);	
	}
	else if(isBob)	{
		animation["skillone"].speed = (attackSpeed*(animation["skillone"].length));
		animation.Play("skillone");
			
	}
	else	{
		animation["attack"].speed = (attackSpeed*(animation["attack"].length));
		animation.Play("attack");
	}
}

function SkillOne () {SkillOne(0);}
function SkillOne (stance : int) {
	if(thisCharacter == "Graviton")	{
		anim.SetBool("isRunning", false);
		anim.SetBool("attacking", false);
		anim.SetBool("pulling", false);		
		anim.SetBool("isSkillTwo", false);
		anim.SetBool("idling", false);
		anim.SetBool("softIdling", false);
		anim.speed = 2.0;
		anim.SetTrigger("skillone");
	}
	else	{
		animation.Play("skillone");
	}
}

function SkillTwo () {SkillTwo(0);}
function SkillTwo (stance : int) {
	if(thisCharacter == "Graviton")	{
		anim.SetBool("isRunning", false);
		anim.SetBool("attacking", false);
		anim.SetBool("pulling", false);
		anim.SetBool("isSkillOne", false);		
		anim.SetBool("idling", false);
		anim.SetBool("softIdling", false);
		anim.speed = 2.0;
		anim.SetTrigger("skilltwo");
	}
	else	{
		if(thisCharacter == "Leonardo") { animation["skilltwo"].speed = 2; }
		animation.Play("skilltwo");
	}
}

function SkillThree () {SkillThree(0);}
function SkillThree (stance : int) {
	if(thisCharacter == "Graviton")	{
		anim.SetBool("isRunning", false);
		anim.SetBool("attacking", false);		
		anim.SetBool("isSkillOne", false);
		anim.SetBool("isSkillTwo", false);
		anim.SetBool("idling", false);
		anim.SetBool("softIdling", false);
		anim.speed = 1.0;
		anim.SetBool("pulling", true);
	}
	else if(thisCharacter == "Rosalind")	{
		if(stance == 0)		{	animation.Play("skillthreeas");		}
		else	{		animation.Play("skillthreems");		}
	}
	else	{	animation.Play("skillthree");	}
	
}

function Ultimate () {Ultimate(0);}
function Ultimate (stance : int) {
	if(thisCharacter == "Graviton")	{
		anim.SetBool("isRunning", false);
		anim.SetBool("attacking", false);
		anim.SetBool("pulling", false);
		anim.SetBool("isSkillOne", false);
		anim.SetBool("isSkillTwo", false);
		anim.SetBool("idling", false);
		anim.SetBool("softIdling", false);
		anim.speed = 2.0;
		anim.SetBool("pulling", true);
	}
	else	{
		if(thisCharacter == "Rosalind") { animation["ultimate"].speed = 2; }
		animation.Play("ultimate");	
	}
}

function StopAnims () {
	if(thisCharacter != "Graviton")	{
		animation.Stop();
	}
}

//EVERYBODY DANCE NOW!
function Dance ()	{	
	if(thisCharacter == "Graviton") {
		anim.SetBool("isRunning", false);
		anim.SetBool("attacking", false);
		anim.SetBool("pulling", false);
		anim.SetBool("isSkillOne", false);
		anim.SetBool("isSkillTwo", false);
		anim.SetBool("idling", false);
		anim.SetBool("softIdling", false);		
		anim.SetBool("pulling", false);	
		anim.speed = 1.0;
		anim.SetBool("dance", true);
	}
	else {
		animation.Play("dance");	
	}
}

