# Dota-Better-Cooldowns
A helper library that tries to solve many client-side problems with cooldowns on abilities.

## How to setup

- include `better_cooldown.js` in your panorama `custom_ui_manifest.xml`
- copy `custom_net_tables.txt` to your script folder
- copy `better_cooldown.lua` to your libs folder
- include "libs.better_cooldown" in `addon_game_mode.lua`

## How to use

Basic:

- No additional actions required, it should work immidiatly!

Optional:

- You might want to lookup `cooldown_preview_ability.lua` for an example lua ability that uses the new functions:

- `CDOTABaseAbility:SetFrozenCooldown(state)` - freezes or unfreezes the cooldown of an ability

- `CDOTABaseAbility:SetCooldownSpeed(speed)` - changes the tickspeed of the cooldown of this ability. To reset, use the default value of speed = 1. Negative values are possible.

### Note

You can adjust `MAX_CONSECUTIV` in `better_cooldown.js` if you experience some value flickering on you cooldowns.