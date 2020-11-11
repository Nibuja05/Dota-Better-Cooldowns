ListenToGameEvent("register_client_ability_functions", function(event) registerClientAbilityFunctions(event) end, self )
ListenToGameEvent("set_client_cooldown", function(event) setClientCooldown(event) end, self )

function registerClientAbilityFunctions(event)
	local ability = EntIndexToHScript(tonumber(event.ability_index))
	if not ability["GetClientCooldown"] then
		local function GetClientCooldown(self)
			if not self.custom_cooldown then
				return 0
			end
			return self.custom_cooldown
		end
		ability["GetClientCooldown"] = function(self) return GetClientCooldown(self) end
	end
end

function setClientCooldown(event)
	local ability = EntIndexToHScript(tonumber(event.ability_index))
	ability.custom_cooldown = tonumber(event.cooldown)
end