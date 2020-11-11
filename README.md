# Dota-Better-Cooldowns
A helper library that tries to solve many client-side problems with cooldowns on abilities.

## How to setup

Basic:

- include `better_cooldown.js` in your panorama `custom_ui_manifest.xml`

Optional (for additional functions):

- copy `custom.gameevents` to your script folder
- copy `addon_game_mode_client.lua` to your vscript folder
- copy `better_cooldown.lua` to your libs folder
- include "libs.better_cooldown" in `addon_game_mode.lua`

## How to use

Basic:

- No additional actions required, it should work immidiatly!

Optional:

- You might want to lookup `cooldown_preview_ability.lua` for an example lua ability that uses the new functions:

- `CDOTABaseAbility:SetFrozenCooldown(state)` - freezes or unfreezes the cooldown of an ability
- `CDOTABaseAbility:SetClientCooldown(newCD)` - sets a custom cooldown for the client (will only effect progress).
												can be called with no arguments to let the custom cooldown wrok with passive cooldown reduction
- `CDOTABaseAbility:RegisterClientFunctions()` - registeres custom functions that only work on client side

- `CDOTABaseAbility:GetClientCooldown()` - client only! returns the custom client cooldown