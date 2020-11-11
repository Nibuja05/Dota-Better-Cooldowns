var base = $.GetContextPanel().GetParent().GetParent().GetParent();
var x = base.FindChildTraverse('HUDElements');
x = x.FindChildTraverse('lower_hud');
x = x.FindChildTraverse('center_with_stats');
x = x.FindChildTraverse('center_block');
x = x.FindChildTraverse('AbilitiesAndStatBranch');
var abilities = x.FindChildTraverse('abilities');

checkSchedule = false;
abilityState = [2, 2, 2, 2, 2, 2, 2, 2, 2, 2];
lastCooldownTimes = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
frame = 0;
lastSelected = false;

function CheckAbilities() {
	var mainSelected = Players.GetLocalPlayerPortraitUnit();
	if (mainSelected !== lastSelected) {
		abilityState = [2, 2, 2, 2, 2, 2, 2, 2, 2, 2];
		frame = 0;
	}
	lastSelected = mainSelected;

	var undef = false;
	var idle = false;
	if (frame % 180 == 0) {
		undef = true;
		frame = 0;
	}
	if (frame % 10 == 0) {
		idle = true;
	}
	var actualIndex = 0;
	abilityState.forEach(function (item, index) {
		var ability = Entities.GetAbility(mainSelected, actualIndex);
		var hidden = Abilities.IsHidden(ability)
		while(hidden && index <= 9) {
			actualIndex++;
			var ability = Entities.GetAbility(mainSelected, actualIndex);
			var hidden = Abilities.IsHidden(ability)
		}
		if (item == 2 && undef) {
			OverwriteOverlay(index, actualIndex);
		} else if (item == 1 && idle) {
			OverwriteOverlay(index, actualIndex);
		} else if (item == 0) {
			OverwriteOverlay(index, actualIndex);
		}
		actualIndex++;
	});
	checkSchedule = $.Schedule(1 / 60, CheckAbilities);
	frame++;
}

function OverwriteOverlay(abilityID, actualID) {
	var cooldown = FindCooldownPanel(abilityID);
	if (cooldown) {
		var percentage = GetCDPercentage(actualID, abilityID);
		if (abilityState[abilityID] > 1) {
			abilityState[abilityID] = 1;
		}
		if (percentage) {
			if (abilityState[abilityID] > 0) {
				abilityState[abilityID] = 0;
			}
			var overlay = ReplaceOverlay(cooldown);
			if (percentage > 1) {
				percentage = 1;
			}
			var degrees = -360 * percentage;
			overlay.style.clip = "radial( 50.0% 50.0%, 0.0deg, " + degrees + "deg)"
		} else {
			if (abilityState[abilityID] == 0) {
				abilityState[abilityID] = 1;
				UndoOverlay(cooldown);
			}
		}
	}
}

function GetCDPercentage(abilityID, index) {
	var mainSelected = Players.GetLocalPlayerPortraitUnit();
	var ability = Entities.GetAbility(mainSelected, abilityID);
	if (ability !== undefined) {
		var maxCD = Abilities.GetCooldown(ability);
		if (maxCD == 0) {
			return false;
		}
		var curCD = Abilities.GetCooldownTimeRemaining(ability);
		if (curCD > lastCooldownTimes[index]) {
			let inc = curCD - lastCooldownTimes[index];
			if (inc < (maxCD / 15)) {
				var ratio = lastCooldownTimes[index] / maxCD;
				return ratio;
			}
		}
		lastCooldownTimes[index] = curCD
		if (curCD == 0) {
			return 0;
		}
		var ratio = curCD / maxCD;
		return ratio;
	}
	return false;
}

function FindCooldownPanel(abilityID) {
	var abilityName = "Ability" + abilityID
	var ability = abilities.FindChildTraverse(abilityName);
	if (ability == undefined) {return false;}
	var cooldown = ability.FindChildTraverse("Cooldown");
	return cooldown;
}

function ReplaceOverlay(cdPanel) {
	var overlay = cdPanel.FindChildTraverse("CooldownOverlay");
	if (overlay) {
		overlay.style.opacity = "0";
	}
	var newOverlay = cdPanel.FindChildTraverse("NewCooldownOverlay");
	if (newOverlay == undefined || !newOverlay) {
		$.Msg("New Overlay!");
		newOverlay = $.CreatePanel("Panel", $.GetContextPanel(), "NewCooldownOverlay");
		newOverlay.SetParent(cdPanel);
		newOverlay.style.width = "100%";
		newOverlay.style.height = "100%";
		newOverlay.style.backgroundColor = "#000000dc";

		var child1 = cdPanel.GetChild(1);
		var child2 = cdPanel.GetChild(2);
		cdPanel.MoveChildAfter(child1, child2);
	} else {
		newOverlay.style.opacity = "1";
	}
	return newOverlay;
}

function UndoOverlay(cdPanel) {
	var overlay = cdPanel.FindChildTraverse("CooldownOverlay");
	if (overlay) {
		overlay.style.opacity = "1";
	}
	var newOverlay = cdPanel.FindChildTraverse("NewCooldownOverlay");
	if (newOverlay) {
		newOverlay.style.opacity = "0";
	}
}

CheckAbilities()