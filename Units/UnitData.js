#pragma strict
//tag = Data

//locations
//ralph,ros,leon,grav
static var hidingLocations : Vector3[] = [Vector3(1000,0,0),Vector3(1100,0,0),Vector3(1200,0,0),Vector3(1300,0,0)];

//colors
var primaryColors : Color[] = [Color(0.55,0.75,0.15),Color(0.45,0.02,0.02),Color(0.3,0.5,1),Color(0.25,0.02,0.28)];

//name strings
static var characterNames : String[] = ['Ralph', 'Rosalind', 'Leondardo', 'Graviton'];
static var difficultyNames : String[] = ['Beginner', 'Novice', 'Intermediate', 'Veteran'];//, 'Expert'];
static var gemNames : String[] = ["No", "Red", "Blue", "Purple"];
static var passiveNames : String[] = ["Toxic", "Prescient", "Elemental Mastery", "Quantum  Gravity"];
static var skillOneNames : String[] = ["Runt Kick", "Fleche", "Scorch", "Gravity Well"];
static var skillTwoNames : String[] = ["Adrenaline", "En Garde", "Freezing Fog", "Reverse Gravity"];
static var skillThreeNames : String[] = ["Survival", "Finesse / Grace", "Spider", "Gravity Field"];
static var ultimateNames : String[] = ["Wasserbar", "Touche", "Transform", "Black Hole"];
static var unitNames : String[] = ["Monster","Player","EnemyCharacter", "PlayerTower","EnemyTower","PlayerChest","EnemyChest","PlayerGuardian","EnemyGuardian",
	"PlayerMeleeMinion1","EnemyMeleeMinion1","PlayerMeleeMinion2","EnemyMeleeMinion2","PlayerMeleeMinion3","EnemyMeleeMinion3","PlayerMeleeMinion4","EnemyMeleeMinion4",
	"PlayerMeleeMinion5","EnemyMeleeMinion5","PlayerMeleeMinion6","EnemyMeleeMinion6","PlayerRangedMinion1","EnemyRangedMinion1","PlayerRangedMinion2","EnemyRangedMinion2",
	"PlayerRangedMinion3","EnemyRangedMinion3","PlayerRangedMinion4","EnemyRangedMinion4","PlayerRangedMinion5","EnemyRangedMinion5","PlayerRangedMinion6","EnemyRangedMinion6",
	"PlayerSpider","EnemySpider","PlayerBob","EnemyBob"];
static var skillTypes : String[,] = new String[4,4];
skillTypes[0,0] = "Active";
skillTypes[0,1] = "Active";
skillTypes[0,2] = "Passive";
skillTypes[0,3] = "Active";
skillTypes[1,0] = "Active";
skillTypes[1,1] = "Active";
skillTypes[1,2] = "Active";
skillTypes[1,3] = "Active";
skillTypes[2,0] = "Active";
skillTypes[2,1] = "Active";
skillTypes[2,2] = "Active";
skillTypes[2,3] = "Active";
skillTypes[3,0] = "Active";
skillTypes[3,1] = "Active";
skillTypes[3,2] = "Active";
skillTypes[3,3] = "Active";

static var skillTargets : String[,] = new String[4,4];
skillTargets[0,0] = "GroundArea";
skillTargets[0,1] = "Self";
skillTargets[0,2] = "Self";
skillTargets[0,3] = "Summon";
skillTargets[1,0] = "EnemyUnit";
skillTargets[1,1] = "Self";
skillTargets[1,2] = "Self";
skillTargets[1,3] = "EnemyCharacter";
skillTargets[2,0] = "GroundArea";
skillTargets[2,1] = "GroundArea";
skillTargets[2,2] = "Self";
skillTargets[2,3] = "Self";
skillTargets[3,0] = "EnemyUnit";
skillTargets[3,1] = "Self";
skillTargets[3,2] = "GroundArea";
skillTargets[3,3] = "GroundArea";

//characters
//base stats
//ralph,ros,leo,grav
static var baseHealth : int[] = [750,625,675,650];
static var baseHealthRegen : int[] = [5,1,4,3];
static var baseResource : int[] = [0,100,875,525];
static var baseResourceRegen : int[] = [0,0,3,7];
static var baseAttackDamage : int[] = [47,95,55,88];
static var baseAttackSpeed : float[] = [1.2,1.5,1.5,0.8];
static var baseAttackRange : float[] = [12,2.0,2,10];
static var baseDamageReduction : int[] = [11,6,5,5];
static var baseMovementSpeed : float[] = [6.1,7.1,7.3,7.2];//7.3
//stat growths
//ralph,ros,leo,grav
static var growthHealth : int[] = [250,175,225,150];
static var growthHealthRegen : int[] = [2,1,1,1];
static var growthResource : int[] = [0,0,125,75];
static var growthResourceRegen : int[] = [0,0,1,2];
static var growthAttackDamage : int[] = [7,20,10,18];
static var growthDamageReduction : int[] = [1,1,0,0];
static var growthMovementSpeed : float[] = [0.1,0.1,0.3,0.2];

//structures
//chest
static var chestHealth : int = 4000;
static var chestDamageReduction : int = 25;
//tower
static var towerHealth : int = 1500;
static var towerBaseAttackDamage : int = 150;
static var towerDamageProgression : int = 25;
static var towerMaxAttackDamage : int = 250;
static var towerAttackSpeed : int = 1;
static var towerAttackRange : int = 17;
static var towerDamageReduction : int = 30;

//ncu base stats
//melee minion, ranged minion, guardian, monster, spider
static var baseHealthNCU : int[] = [400,250,1200,1050,200];
static var baseHealthRegenNCU : int[] = [2,1,6,0,0];
static var baseAttackDamageNCU : int[] = [40,30,220,115,25];
static var baseAttackSpeedNCU : float[] = [0.8,0.8,1,0.7,2];
static var baseAttackRangeNCU : float[] = [2.0,10,17,3,2];
static var baseDamageReductionNCU : int[] = [2,0,16,12,0];
static var baseMovementSpeedNCU : float[] = [5.2,5.2,7.2,7.2,11];
//ncu growth stats
//melee minion, ranged minion, guardian, monster, spider
static var growthHealthNCU : int[] = [20,10,200,50,200];
static var growthHealthRegenNCU : int[] = [0,0,0,0,0];
static var growthAttackDamageNCU : int[] = [5,4,20,15,25];
static var growthDamageReductionNCU : int[] = [2,0,1,2,0];
static var growthMovementSpeedNCU : float[] = [0.2,0.2,0.2,0.2,0];
//ncu aggression radius
static var aggressionRadius : int[] = [100,100,120,120];

static var skillTooltips = new String[4,5];
static var skillTooltipNumbers = new String[5];
static var skillLevelUpTooltips = new String[4,5];
static var skillTooltipInfo = new String[4,5];
static var skillTooltipsZero = new String[4,5];

//max length = consume the debuff for an additional effect.
//tooltip body explanations
skillTooltips[0,0] = "Passive\n-----\nRalph's attacks and skills Poison enemies.\n\nAdditionally,\nRalph explodes when he's defeated,\napplying full stacks of Poison\nto nearby Enemies.";
skillTooltips[0,1] = "Kicks a Runt to a target location.\nThe Runt then explodes,\ndamaging and Poisoning all nearby\nEnemy Units.";
skillTooltips[0,2] = "Temporarily increases Health Regeneration.";
skillTooltips[0,3] = "Passive\n-----\nRalph gains Damage Reduction\nat low Health.";
skillTooltips[0,4] = "Ralph summons his cousin Wasserbar to a\ntarget location. Wasserbar releases a charging\nRunt every second at nearby Enemy Units.\nWasserbar explodes at the end of his visit\nor if he is defeated prematurely,\napplying Poison to all\nEnemy Units in range.\n\nWasserbar is immune\nto all forms of crowd control. ";

skillTooltips[1,0] = "Passive\n-----\nRosalind recieves Insight\non each Basic Attack.\n\nLifesteal is increased per point of Insight.";
skillTooltips[1,1] = "Dashes to target location and\ndeals damage to the target Unit.\n\nFinesse : Places a debuff on the target\nthat decreases Health Regeneration.\n\nGrace : Increases the Range of Fleche.";
skillTooltips[1,2] = "Grants increased damage reducution\nfor a short duration.\n\nFinessee : Increases Life Steal\nfor the duration.\n\nGrace : Increases damage reduction\nby a greater amount.";
skillTooltips[1,3] = "Rosalind recieves a passive bonus\nbased on her current stance.\nActivate to swap stances.\n\nFinesse : Increases Attack Speed.\n\nGrace : Increases Movement Speed.\n\nRosalind's other skills gain an additional\neffect based on her current stance.\n\nThis skill is usable at level 0.";
skillTooltips[1,4] = "Damages an Enemy Necromancer for\na percentage of their missing Health.\n\nFinesse : Grants bonus Lifesteal\nfor this skill.\n\nGrace : Grants full Insight and resets the\ncooldowns of Rosalind's other skills.";

skillTooltips[2,0] = "Passive\n-----\nLeonardo is charged with the essence\nof his last spell. The essence\nradiates from Leonardo creating a\nPassive Aura that buffs all\nAllied Units near Leonardo.\n\nAdditionally, each of Leonardo's skills\napplies an elemental debuff to targets hit.";
skillTooltips[2,1] = "Channels a cone of fire forward in a straight\nline, damaging and debuffing Enemy Units\nin contact three times per second.\n\nApplies the Scorched debuff.";
skillTooltips[2,2] = "Places a patch of Freezing Fog in an area.\nEnemy Units recieve a debuff that reduces\nMovement Speed while in the fog\n(removed upon exiting).\n\nAdditonally, the Frosted debuff is\napplied once each second that\nan Enemy Unit remains in the Fog. ";
skillTooltips[2,3] = "Leonardo creates a Spider companion\nfrom the earth. The companion\n follows Leanardo by default,\nattacking enemies who come too close.\n\nEach of the companion's attacks applies\na stack of the Cracked debuff.";
skillTooltips[2,4] = "Leonardo transforms into one of three forms\nbased on his current elemental charge.\nThe bonus from his elemental aura\nis doubled while transformed. While\nTransformed, basic attacks against Enemy\nUnits with the matching elemental debuff\nconsume the debuff for an additional effect.\nLeonardo is unable to use his other\nskills while the transformation persists.";

skillTooltips[3,0] = "Passive\n-----\nGraviton uses gravitional Energy\nto perform basic attacks and skills.\n\nEnergy regenerates rapidly.\n\nGraviton's basic attack and skills Fluctuate\nwhen his Energy is low,\ngaining an additional effect.";
skillTooltips[3,1] = "Applies a debuff to the target that slows\nnearby Enemy Units (but not the target)\nand damages the target every second.\n\nFluctuating :\nThe target is also affected by the slow.";
skillTooltips[3,2] = "Damages and knocks up\nEnemies near Graviton.\n\nFluctuating :\nAlso pushes Enemies away from Graviton.";
skillTooltips[3,3] = "Supresses and slowly pulls\nan Enemy Necromancer towards Graviton.\nGraviton is unable to move, attack,\nuse skills or perform any other actions\nduring the channel. The Enemy Necromancer\nis unable to control movement, attack,\nuse skills or perform any\nother actions during the channel.\n\nRight click to end early.\n\nFluctuating :\nDamage is doubled.";
skillTooltips[3,4] = "A Black Hole is created at the target\nlocation that deals damage each half\nsecond to Enemy Units in contact.\nEnemy Units in a wide area\nare pulled towards the Black Hole.\nThe Black Hole grows in size over\nits duration and deals more damage\nand exerts more pull the larger it grows.\n\nFluctuating :\nCreates a Singularity that deals instant\ndamage and pushes Enemy Units instead\nof pulling them.";

//stat view numbers
skillTooltipInfo[0,0] = "Radius : 5\nDamage : Level*2\nDuration : 3 seconds\nMax Stacks : 5";
skillTooltipInfo[0,1] = "Cooldown : 6\nRange : 8   Radius : 5\nDamage : 100 / 200 / 300\nRunt Explosion Radius : 5";
skillTooltipInfo[0,2] = "Cooldown : 22 / 20 / 18\nHealth Regeneration : 15 / 30 / 45\nDuration : 5 seconds";
skillTooltipInfo[0,3] = "Health Threshold : 15%\nDamage Reduction : 10% / 20% / 30%";
skillTooltipInfo[0,4] = "Cooldown : 60\nRange : 8\nWasserbar Health : 500 + (50 * Level)\nWasserbar Attack Radius : 8\nWasserbar Attack Speed : 1 Runt per second\nRunt Damage : (30 * Level)\nWasserbar Duration : 6 seconds\nWasserbar Explosion Radius : 5";

skillTooltipInfo[1,0] = "Insight per Attack : 10\nMax Insight : 100\nLifesteal per Insight : 0.1%\nMax Lifesteal : 10%";
skillTooltipInfo[1,1] = "Cooldown : 5 / 4 / 3   Insight : 30\nRange : 8\nDamage : 100 / 200 / 300\n\nFinesse Debuff Duration : 3 seconds\nFinessse Health Regeneration\nDebuff : 15% / 30% / 45%\n\nGrace Range Bonus : 2 / 4 / 6";
skillTooltipInfo[1,2] = "Cooldown : 12 / 11 / 10   Insight : 60 / 50 / 40\nDuration : 3 seconds\nDamage Reduction : 10% / 20% / 30%\n\nFinesse Life Steal : 5% / 10% / 15%\n\nGrace Damage Reduction : 5% / 10% / 15%\nTotal Grace DR : 15% / 30% / 45%";
skillTooltipInfo[1,3] = "Cooldown : 3   Insight : 30\nFinesse Attack Speed : 5% / 20% / 35% / 50%\n\nGrace Movement Speed : 5% / 20% / 35% / 50%";
skillTooltipInfo[1,4] = "Cooldown : 60   Insight : 50\nRange : 4\nDamage : 35% of target's missing Health\n\nFinesse Lifesteal : +75%\n\nGrace Insight : 100";

skillTooltipInfo[2,0] = "Passive Auras\nRadius : 10\nFire Attack Speed : 5% / 10% / 15%\nIce Damage Reduction : 5% / 10% / 15%\nEarth Movement Speed : 15% / 30% / 45%";
skillTooltipInfo[2,1] = "Cooldown : 5   Mana : 125 / 150 / 175\nRange : 10   Radius : 5\nDamage :  40 / 80 / 120\nDuration : 1 second   Max Hits : 3\n\nScorched Debuff\nHealth Regeneration : 5 / 10 / 15\nDuration : 6 seconds\nMax Stacks : 3";
skillTooltipInfo[2,2] = "Cooldown : 10   Mana : 100 / 150 / 200\nRange : 15   Radius : 10\nMovement Speed Slow : 30% / 60% / 90%\nFog Duration : 3 seconds\n\nFrosted Debuff\nAttack Speed : 5% / 10% / 15%\nDuration : 6 seconds\nMax Stacks : 3";
skillTooltipInfo[2,3] = "Cooldown : 15   Mana : 150 / 200 / 250\nCompanion Health : 200 / 400 / 600\nCompanion Damage : 25 / 50 / 75\nCompanion Attack Speed : 2\nCompanion Movement Speed : 11\nCompanion Duration : 8 seconds\n\nCracked Debuff\nDamage Reduction : 2 / 4 / 6\nDuration : 6 seconds\nMax Stacks : 3";
skillTooltipInfo[2,4] = "Cooldown : 60   Mana : 400\nDuration : 6 seconds\n---Fire Form---\nAttack Speed +60%  Attack Range +13\nMovement Speed +10%\nDebuff Bonus : Enemies around\nthe target also take damage.\nSplash Range : 5\n---Ice Form---\nMana Regeneration Bonus : (20 * Level)\nDamage Reduction +55   Movement Speed +30%\nDebuff Bonus : Restore 5% of your Max Health.\n---Earth Form---\nAttack Damage Bonus : (30 * Level)\nMovement Speed +50%\nDebuff Bonus : Damage +10% of\ntarget's Current Health.";

skillTooltipInfo[3,0] = "Basic Attack Energy Cost : 50\n\nFluctuate Energy Threshold : 25%\n\nFluctuating Basic Attack :\nDamage +5% of target's Max Health.";
skillTooltipInfo[3,1] = "Cooldown : 6   Energy : 100 / 125 / 150\nRange : 15\nSlow Radius : 10\nMovement Speed Debuff : 50%\nDebuff Duration : 5 seconds\n\nTarget Damage : 50 / 100 / 150 per second\nDamage Duration : 5 seconds\n\nFluctuating Target Slow : 50%\nFluctuating Target Debuff Duration : 5 seconds";
skillTooltipInfo[3,2] = "Cooldown : 12 / 10 / 8   Energy : 150 / 175 / 200\nRadius : 10\nDamage : 300 / 450 / 600\nKnock-up Duration : .5s\n\nFluctuating Push Radius : 10";
skillTooltipInfo[3,3] = "Cooldown : 6   Energy : 200 per second\nRange : 15\nDamage : 100 / 125 / 150 per second\nPull Force : 3 per second\nMax Duration : 1 / 2 / 3 seconds\n\nFluctuating Damage : 200 / 250 / 300 per second";
skillTooltipInfo[3,4] = "Cooldown : 90   Energy : 250\nRange : 15   Radius : 2 - 7\nDamage : 5 * Level * Radius every half second\nDuration : 3 seconds\nPull Radius : 5 - 10\nPull Force : 4 - 14\n\nFluctuating Radius : 7\nFluctuating Damage : 500 + 50% of\nTarget's Maximum Health\nFluctuating Push Force : 20";
//skill level up tooltips
skillLevelUpTooltips[0,1] = "Damage +100";
skillLevelUpTooltips[0,2] = "Cooldown -2\nHealth Regeneration +15";
skillLevelUpTooltips[0,3] = "Damage Reduction +10%";
skillLevelUpTooltips[0,4] = "Ultimate Skill";

skillLevelUpTooltips[1,1] = "Cooldown -1\nDamage +100\n\nFinessse Health Regeneration\nDebuff +15%\n\nGrace Range Bonus +2";
skillLevelUpTooltips[1,2] = "Cooldown -1\nInsight Cost -10\nDamage Reduction +10%\n\nFinesse Life Steal +5%\n\nGrace Damage Reduction +5%";
skillLevelUpTooltips[1,3] = "Finesse Attack Speed +15%\n\nGrace Movement Speed +15%";
skillLevelUpTooltips[1,4] = "Ultimate Skill";

skillLevelUpTooltips[2,1] = "Mana Cost +25\nDamage +40\n\nScorched Debuff\nHealth Regeneration +5\n\nFire Aura\nAttack Speed +5%";
skillLevelUpTooltips[2,2] = "Mana Cost +50\nMovement Speed Slow +30%\n\nFrosted Debuff\nAttack Speed +5%\n\nIce Aura\nDamage Reduction +5";
skillLevelUpTooltips[2,3] = "Mana Cost +50\nCompanion Health +200\nCompanion Damage +25\n\nCracked Debuff\nDamage Reduction +2\n\nEarth Aura\nMovement Speed +15%";
skillLevelUpTooltips[2,4] = "Ultimate Skill";

skillLevelUpTooltips[3,1] = "Enery Cost +25\nTarget Damage +50 per second";
skillLevelUpTooltips[3,2] = "Enery Cost +25\nDamage +150";
skillLevelUpTooltips[3,3] = "Damage +25 per second\nMax Duration +1 seconds\n\nFluctuating Damage\n+50 per second";
skillLevelUpTooltips[3,4] = "Ultimate Skill";

//level 0 tooltips
skillTooltipsZero[0,1] = "Cooldown : 6\nRange : 8   Radius : 5\nDamage : 100\nRunt Explosion Radius : 5";
skillTooltipsZero[0,2] = "Cooldown : 22\nHealth Regeneration : 15\nDuration : 5 seconds";
skillTooltipsZero[0,3] = "Health Threshold : 15%\nDamage Reduction : 10%";

skillTooltipsZero[1,1] = "Cooldown : 5   Insight : 30\nRange : 8\nDamage : 100\n\nFinesse Debuff Duration : 3 seconds\nFinessse Health Regeneration\nDebuff : 15%\n\nGrace Range Bonus : 2";
skillTooltipsZero[1,2] = "Cooldown : 12   Insight : 600\nDuration : 3 seconds\nDamage Reduction : 10%\n\nFinesse Life Steal : 5%\n\nGrace Damage Reduction : 5%\nTotal Grace DR : 15%";
skillTooltipsZero[1,3] = "Cooldown : 3   Insight : 30\nRange : 4\n\nFinesse Attack Speed : 5% / 50%\n\nGrace Movement Speed : 5%";

skillTooltipsZero[2,1] = "Cooldown : 5   Mana : 125\nRange : 10   Radius : 5\nDamage :  40\nDuration : 1 second   Max Hits : 3\n\nScorched Debuff\nHealth Regeneration : 5\nDuration : 6 seconds\nMax Stacks : 3";
skillTooltipsZero[2,2] = "Cooldown : 10   Mana : 100\nRange : 15   Radius : 10\nMovement Speed Slow : 30%\nFog Duration : 3 seconds\n\nFrosted Debuff\nAttack Speed : 5%\nDuration : 6 seconds\nMax Stacks : 3";
skillTooltipsZero[2,3] = "Cooldown : 15   Mana : 150\nCompanion Health : 200\nCompanion Damage : 25\nCompanion Attack Speed : 2\nCompanion Movement Speed : 11\nCompanion Duration : 8 seconds\n\nCracked Debuff\nDamage Reduction : 2\nDuration : 6 seconds\nMax Stacks : 3";

skillTooltipsZero[3,1] = "Cooldown : 6   Energy : 100\nRange : 15\nSlow Radius : 10\nMovement Speed Debuff : 50%\nDebuff Duration : 5 seconds\n\nTarget Damage : 50 per second\nDamage Duration : 5 seconds\n\nFluctuating Target Slow : 50%\nFluctuating Target Debuff Duration : 5 seconds";
skillTooltipsZero[3,2] = "Cooldown : 12   Energy : 150\nRadius : 10\nDamage : 300\nKnock-up Duration : .5s\n\nFluctuating Push Radius : 10";
skillTooltipsZero[3,3] = "Cooldown : 6   Energy : 200 per second\nRange : 15\nDamage : 100 per second\nPull Force : 3 per second\nMax Duration : 1 seconds\n\nFluctuating Damage : 200 per second";


private var gameController : GameController;
private var skills : Skills;

function Awake () {
	DontDestroyOnLoad (this.gameObject);
}

//battlefield numbers
function UpdateTooltips () {
	gameController = GameObject.FindGameObjectWithTag("GameController").GetComponent(GameController);
	var characterNumber : int = gameController.characterSelected[1];
	switch(characterNumber) {
	case 0:
		skillTooltipNumbers[0] = "Radius : 5\nDamage : " + gameController.levels[1] * 2 + "\nDuration : 3 seconds\nMax Stacks : 5";
		skillTooltipNumbers[1] = "Skill Level : " + gameController.skillLevels[1,0] + "\nCooldown : 6\nRange : 8   Radius : 5\nDamage : " + gameController.skillLevels[1,0] * 100 + "\nRunt Explosion Radius : 5";
		skillTooltipNumbers[2] = "Skill Level : " + gameController.skillLevels[1,1] + "\nCooldown : " + (24 - gameController.skillLevels[1,1]* 2) + "\nHealth Regeneration : " + gameController.skillLevels[1,1] * 15 + "\nDuration : 5 seconds";
		skillTooltipNumbers[3] = "Skill Level : " + gameController.skillLevels[1,2] + "\nHealth Threshold : 15%\nDamage Reduction : " + gameController.skillLevels[1,2] * 10 + "%";
		skillTooltipNumbers[4] = "Cooldown : 60\nRange : 8\nWasserbar Health : " + (gameController.levels[1] * 50 + 500) + "\nWasserbar Attack Radius : 8\nWasserbar Attack Speed : 1 Runt per second\nRunt Damage : " + (gameController.levels[1] * 30) + "\nWasserbar Duration : 6 seconds\nWasserbar Explosion Radius : 5";
		break;
	case 1:
		skillTooltipNumbers[0] = "Insight per Attack : 10\nMax Insight : 100\nLifesteal per Insight : 0.1%\nMax Lifesteal : 10%\n\nCurrent Lifesteal : " + gameController.currentResources[1] * 0.1 + "%";
		skillTooltipNumbers[1] = "Skill Level : " + gameController.skillLevels[1,0] + "\nCooldown : " + (6 - gameController.skillLevels[1,0]) + "   Insight : 30\nRange : 8\nDamage : " + gameController.skillLevels[1,0] * 100 + "\n\nFinesse Debuff Duration : 3 seconds\nHealth Regeneration Debuff : " + gameController.skillLevels[1,0] * 15 + "%\n\nGrace Range Bonus : " + gameController.skillLevels[1,0] * 2;
		skillTooltipNumbers[2] = "Skill Level : " + gameController.skillLevels[1,1] + "\nCooldown : " + (13 - gameController.skillLevels[1,1]) + "   Insight : " + (70 - gameController.skillLevels[1,1]*10) + "\nDuration : 3 seconds\nDamage Reduction : " + gameController.skillLevels[1,1] * 10 + "%\n\nFinesse Life Steal : " + gameController.skillLevels[1,1] * 5 + "%\n\nGrace Damage Reduction : " + gameController.skillLevels[1,1] * 5 + "%\nTotal Grace DR : " + gameController.skillLevels[1,1] * 15 + "%";
		if(gameController.stances[1] == 0) {
			skillTooltipNumbers[3] = "Current Stance : Grace\n----------\nSkill Level : " + gameController.skillLevels[1,2] + "\nCooldown : 3   Insight : 30\n\nAttack Speed +" + (gameController.skillLevels[1,2] * 15 + 5) + "%\nMovement Speed -" + (gameController.skillLevels[1,2] * 15 + 5) + "%";
		}
		else {
			skillTooltipNumbers[3] = "Current Stance : Finesse\n----------\nSkill Level : " + gameController.skillLevels[1,2] + "\nCooldown : 3   Insight : 30\n\nAttack Speed -" + (gameController.skillLevels[1,2] * 15 + 5) + "%\nMovement Speed +" + (gameController.skillLevels[1,2] * 15 + 5) + "%";
		}
		skillTooltipNumbers[4] = "Cooldown : 60   Insight : 50\nRange : 4\nDamage : 35% of target's missing Health\n\nFinesse Lifesteal : +75%\n\nGrace Insight : 100";				
		break;
	case 2:
		skillTooltipNumbers[0] = "Passive Auras\nRadius : 10\nFire Attack Speed : " + gameController.skillLevels[1,0] * 5 + "%\nIce Damage Reduction : " + gameController.skillLevels[1,1] * 5 + "%\nEarth Movement Speed : " + gameController.skillLevels[1,2] * 15 + "%";
		skillTooltipNumbers[1] = "Skill Level : " + gameController.skillLevels[1,0] + "\nCooldown : 5   Mana : " + (100 + gameController.skillLevels[1,0] * 25) + "\nRange : 10   Radius : 5\nDamage :  " + gameController.skillLevels[1,0] * 40 + "\nDuration : 1 second   Max Hits : 3\n\nScorched Debuff\nHealth Regeneration : " + gameController.skillLevels[1,0] * 5 + "\nDuration : 6 seconds\nMax Stacks : 3";
		skillTooltipNumbers[2] = "Skill Level : " + gameController.skillLevels[1,1] + "\nCooldown : 10   Mana : " + (50 + gameController.skillLevels[1,1] * 50) + "\nRange : 15   Radius : 10\nMovement Speed Slow : " + gameController.skillLevels[1,1] * 30 + "%\nFog Duration : 3 seconds\n\nFrosted Debuff\nAttack Speed : " + gameController.skillLevels[1,1] * 5 + "%\nDuration : 6 seconds\nMax Stacks : 3";
		skillTooltipNumbers[3] = "Skill Level : " + gameController.skillLevels[1,2] + "\nCooldown : 15   Mana : " + (100 + gameController.skillLevels[1,2] * 50) + "\nCompanion Health : " + gameController.skillLevels[1,2] * 200 + "\nCompanion Damage : " + gameController.skillLevels[1,2] * 25 + "\nCompanion Attack Speed : 2\nCompanion Movement Speed : 11\nCompanion Duration : 8 seconds\n\nCracked Debuff\nDamage Reduction : " + gameController.skillLevels[1,2] * 2 + "\nDuration : 6 seconds\nMax Stacks : 3";
		skillTooltipNumbers[4] = "Cooldown : 60   Mana : 400\nDuration : 6 seconds\n---Fire Form---\nAttack Speed +60%  Attack Range +13\nMovement Speed +10%\nDebuff Bonus : Enemies around\nthe target also take damage.\nSplash Range : 5\n---Ice Form---\nMana Regeneration Bonus : " + gameController.levels[1] * 20 + "\nDamage Reduction +55\nMovement Speed +30%\nDebuff Bonus : Restore " + (gameController.currentHealths[1] * 0.05).ToString("F0") + " Health.\n---Earth Form---\nAttack Damage Bonus : " + gameController.levels[1] * 30 + "\nMovement Speed +50%\nDebuff Bonus : Damage +10% of\ntarget's Current Health.";
		break;
	case 3:
		skillTooltipNumbers[0] = "Basic Attack Energy Cost : 50\n\nFluctuate Energy Threshold : 25%\n\nFluctuating Basic Attack :\nDamage +5% of target's Max Health.";
		skillTooltipNumbers[1] = "Skill Level : " + gameController.skillLevels[1,0] + "\nCooldown : 6   Energy : " + (75 + gameController.skillLevels[1,0] * 25) + "\nRange : 15\nSlow Radius : 10\nMovement Speed Debuff : 50%\nDebuff Duration : 5 seconds\n\nTarget Damage : " + gameController.skillLevels[1,0] * 50 + " per second\nDamage Duration : 5 seconds\n\nFluctuating Target Slow : 50%\nFluctuating Target Debuff Duration : 5 seconds";
		skillTooltipNumbers[2] = "Skill Level : " + gameController.skillLevels[1,1] + "\nCooldown : " + (14 + gameController.skillLevels[1,1] * 2) + "   Energy : " + (125 + gameController.skillLevels[1,1] * 25) + "\nRadius : 10\nDamage : " + (gameController.skillLevels[1,1] * 150 + 150) + "\nKnock-up Duration : .5s\n\nFluctuating Push Radius : 10";
		skillTooltipNumbers[3] = "Skill Level : " + gameController.skillLevels[1,2] + "\nCooldown : 6   Energy : 200 per second\nRange : 15\nDamage : " + (gameController.skillLevels[1,2] * 25 + 75) + " per second\nPull Force : 3 per second\nMax Duration : " + gameController.skillLevels[1,2] + " seconds\n\nFluctuating Damage : " + (gameController.skillLevels[1,2] * 50 + 150) + " per second";
		skillTooltipNumbers[4] = "Cooldown : 90   Energy : 250\nRange : 15   Radius : 2 - 7\nDamage : " + gameController.levels[1] * 5 + " * Radius every half second\nDuration : 3 seconds\nPull Radius : 5 - 10\nPull Force : 4 - 14\n\nFluctuating Radius : 7\nFluctuating Damage : 500 + 50% of\nTarget's Maximum Health\nFluctuating Push Force : 20";
		break;
	}	
}
