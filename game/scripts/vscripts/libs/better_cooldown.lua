LinkLuaModifier("modifier_frozen_cooldown", "libs/better_cooldown.lua", LUA_MODIFIER_MOTION_NONE)

if not BetterCooldowns then 
	BetterCooldowns = class({})
end

ListenToGameEvent("game_rules_state_change", function()
	if GameRules:State_Get() == DOTA_GAMERULES_STATE_CUSTOM_GAME_SETUP then
		BetterCooldowns:Init()
	end
end, nil)

function BetterCooldowns:Init()
	self.units = {}
	local mode = GameRules:GetGameModeEntity()
	ListenToGameEvent('dota_player_used_ability', Dynamic_Wrap(BetterCooldowns, 'OnAbilityCast'), self)
	ListenToGameEvent('dota_non_player_used_ability', Dynamic_Wrap(BetterCooldowns, 'OnAbilityCast'), self)
end

function BetterCooldowns:OnAbilityCast(event)
	local unit = EntIndexToHScript(event.caster_entindex)
	local cdr = unit:GetCooldownReduction()
	if (cdr ~= 1 and not self.units[event.caster_entindex]) or (self.units[event.caster_entindex] and cdr ~= self.units[event.caster_entindex]) then
		self.units[event.caster_entindex] = cdr
		CustomNetTables:SetTableValue("better_cooldowns_cdr", tostring(event.caster_entindex), {cdr = cdr})
	end
end

function CDOTABaseAbility:SetFrozenCooldown(state)
	local caster = self:GetCaster()
	local entIndex = self:entindex()
	for _,modifier in pairs(caster:FindAllModifiersByName("modifier_frozen_cooldown")) do
		if modifier.entindex == entIndex then
			modifier:Destroy()
		end
	end
	if state == true then
		caster:AddNewModifier(caster, self, "modifier_frozen_cooldown", {Entindex = entIndex})
	end
end

modifier_frozen_cooldown = class({})

function modifier_frozen_cooldown:IsHidden()
	return true
end

function modifier_frozen_cooldown:IsDebuff()
	return true
end

function modifier_frozen_cooldown:IsPurgable()
	return false
end

function modifier_frozen_cooldown:RemoveOnDeath()
	return false
end

function modifier_frozen_cooldown:OnCreated(event)
	if IsClient() then return end
	self.entindex = event.Entindex
	self.ability = EntIndexToHScript(self.entindex)
	self.cooldown = self.ability:GetCooldownTimeRemaining()
	self:StartIntervalThink(1/120)
end

function modifier_frozen_cooldown:OnIntervalThink()
	self.ability:StartCooldown(self.cooldown)
end

