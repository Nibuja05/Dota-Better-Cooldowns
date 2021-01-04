const basePanel = $.GetContextPanel().GetParent().GetParent().GetParent();
let x = basePanel.FindChildTraverse('HUDElements');
x = x.FindChildTraverse('lower_hud');
x = x.FindChildTraverse('center_with_stats');
x = x.FindChildTraverse('center_block');
x = x.FindChildTraverse('AbilitiesAndStatBranch');
const abilities = x.FindChildTraverse('abilities');

var abilityState = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var abilityData = [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined];
var lastSelected = undefined;

//Check if selected units ability goes on cooldown
$.RegisterForUnhandledEvent("StyleClassesChanged", (panel) => { 
	if (panel === null) return;
	const abilityIndex = GetAbilityIndexFromPanel(panel);
	if (abilityIndex >= 0) {
		if (abilityState[abilityIndex] > 0) {
			return;
		}
		const abilityPanel = FindAbilityPanelByIndex(abilityIndex);
		if (abilityPanel) {
			const abilityImage = abilityPanel.FindChildTraverse("AbilityImage")
			const abilityID = abilityImage.contextEntityIndex;
			const cooldownPanel = abilityPanel.FindChild("Cooldown");
			const cooldown = Abilities.GetCooldownTimeRemaining(abilityID);
			if (cooldown > 0) {
				abilityState[abilityIndex] = 1;
				abilityData[abilityIndex] = [abilityID, cooldownPanel, cooldown, Abilities.GetCooldownLength(abilityID)];
				OverwriteOverlay(abilityIndex);
			}
		}
	}
});

//Get the ability index (not ability id), if the panel is an ability panel and on cooldown
function GetAbilityIndexFromPanel(panel) {
	if (panel.paneltype === "DOTAAbilityPanel" && panel.BHasClass("in_cooldown")) {
		const parent = panel.GetParent();
		if (parent !== undefined && parent.id === "abilities") {
			return parseInt(panel.id.slice(-1), 10);
		}
	}
	return -1;
}

//Checks if selected unit has changed and checks for abilities on cooldown
function CheckAbilities() {
	const mainSelected = Players.GetLocalPlayerPortraitUnit();
	let reCheck = false;
	if (mainSelected !== lastSelected) {
		abilityState = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
		abilityData = [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined];
		reCheck = true;
	}
	lastSelected = mainSelected;

	if (reCheck) {
		for (let i = 0; i < 10; i++) {
			const abilityPanel = FindAbilityPanelByIndex(i);
			if (abilityPanel) {
				const abilityImage = abilityPanel.FindChildTraverse("AbilityImage")
				const abilityID = abilityImage.contextEntityIndex;
				const cooldownPanel = abilityPanel.FindChildTraverse("Cooldown");
				const cooldown = Abilities.GetCooldownTimeRemaining(abilityID);
				if (cooldown && cooldown > 0) {
					abilityState[i] = 1;
					abilityData[i] = [abilityID, cooldownPanel, cooldown, Abilities.GetCooldownLength(abilityID)];
					OverwriteOverlay(i);
				}
			}
		}
	} else if (abilityState.includes(1)) {
		for (let i = 0; i < 10; i++) {
			if (abilityState[i] == 1) {
				OverwriteOverlay(i);
			}
		}
	}
	$.Schedule(1/60, CheckAbilities)
}

//Find the ability panel for this index
function FindAbilityPanelByIndex(index) {
	const abilityPanel = abilities.FindChild("Ability" + index);
	if (abilityPanel === null) {return false;}
	const abilityButtonAndLevel = abilityPanel.FindChild("ButtonAndLevel");
	const abilityLevelUpTab = abilityButtonAndLevel.FindChild("ButtonWithLevelUpTab");
	const abilityButtonWell = abilityLevelUpTab.FindChild("ButtonWell");
	const abilityButtonSize = abilityButtonWell.FindChild("ButtonSize");
	return abilityButtonSize.FindChild("AbilityButton");
}

//Called multiple times a second; updates the cooldown visualizer
function OverwriteOverlay(index) {
	const data = abilityData[index];
	let percentage = GetCDPercentage(index);
	if (percentage) {
		const overlay = ReplaceOverlay(data[1]);
		if (percentage > 1) {
			percentage = 1;
		}
		const degrees = -360 * percentage;
		overlay.style.clip = "radial( 50.0% 50.0%, 0.0deg, " + degrees + "deg)"
	} else {
		if (abilityState[index] == 1) {
			abilityState[index] = 0;
			abilityData[index] = undefined;
		}
	}
}

//Calculated the current fill percentage
function GetCDPercentage(index) {
	const mainSelected = Players.GetLocalPlayerPortraitUnit();
	let data = abilityData[index];
	if (data[0] !== undefined) {
		let maxCD = Abilities.GetCooldown(data[0]) * GetCooldownReduction(mainSelected);
		if (maxCD === 0) {
			return false;
		}
		let curCD = Abilities.GetCooldownTimeRemaining(data[0]);
		if (curCD > maxCD) {
			maxCD = data[3];
		}
		if (curCD > data[2]) {
			let inc = curCD - data[2];
			if (inc < (maxCD / 15)) {
				let ratio = data[2] / maxCD;
				return ratio;
			}
		}
		abilityData[index][2] = curCD
		if (curCD === 0) {
			return 0;
		}
		let ratio = curCD / maxCD;
		return ratio;
	}
	return false;
}

//Adds the custom cooldown overlay and hides the default one
function ReplaceOverlay(cdPanel) {
	let overlay = cdPanel.FindChildTraverse("CooldownOverlay");
	if (overlay) {
		overlay.style.opacity = "0";
	}
	let newOverlay = cdPanel.FindChildTraverse("NewCooldownOverlay");
	if (newOverlay === undefined || !newOverlay) {
		newOverlay = $.CreatePanel("Panel", $.GetContextPanel(), "NewCooldownOverlay");
		newOverlay.SetParent(cdPanel);
		newOverlay.style.width = "100%";
		newOverlay.style.height = "100%";
		newOverlay.style.backgroundColor = "#000000dc";

		let child1 = cdPanel.GetChild(1);
		let child2 = cdPanel.GetChild(2);
		cdPanel.MoveChildAfter(child1, child2);
	} else {
		newOverlay.style.opacity = "1";
	}
	return newOverlay;
}

//Receives the cdr from custom nettable entries
function GetCooldownReduction(unitID) {
	let table = CustomNetTables.GetTableValue("better_cooldowns_cdr", unitID.toString())
	if (table) {
		return parseFloat(table["cdr"]);
	}
	return 1;
}

//Start the checker
CheckAbilities();