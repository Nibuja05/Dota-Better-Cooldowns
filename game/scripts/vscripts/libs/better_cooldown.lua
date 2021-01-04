LinkLuaModifier("modifier_bc_frozen_cooldown", "libs/better_cooldown.lua", LUA_MODIFIER_MOTION_NONE)
LinkLuaModifier("modifier_bc_cooldown_speed", "libs/better_cooldown.lua", LUA_MODIFIER_MOTION_NONE)

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

if IsServer() then
	function CDOTABaseAbility:SetFrozenCooldown(state)
		local caster = self:GetCaster()
		local entIndex = self:entindex()
		for _,modifier in pairs(caster:FindAllModifiersByName("modifier_bc_frozen_cooldown")) do
			if modifier.entindex == entIndex then
				modifier:Destroy()
			end
		end
		if state == true then
			caster:AddNewModifier(caster, self, "modifier_bc_frozen_cooldown", {Entindex = entIndex})
		end
	end

	function CDOTABaseAbility:SetCooldownSpeed(speed)
		local caster = self:GetCaster()
		local entIndex = self:entindex()
		for _,modifier in pairs(caster:FindAllModifiersByName("modifier_bc_cooldown_speed")) do
			if modifier.entindex == entIndex then
				if speed == 1 then
					modifier:Destroy()
				else
					modifier.speed = speed
				end
			end
		end
		if speed ~= 1 then
			caster:AddNewModifier(caster, self, "modifier_bc_cooldown_speed", {Entindex = entIndex, speed=speed})
		end
	end
end

modifier_bc_frozen_cooldown = class({})

function modifier_bc_frozen_cooldown:IsHidden()
	return true
end

function modifier_bc_frozen_cooldown:IsDebuff()
	return true
end

function modifier_bc_frozen_cooldown:IsPurgable()
	return false
end

function modifier_bc_frozen_cooldown:RemoveOnDeath()
	return false
end

function modifier_bc_frozen_cooldown:GetAttributes()
	return MODIFIER_ATTRIBUTE_MULTIPLE
end

function modifier_bc_frozen_cooldown:OnCreated(event)
	if IsClient() then return end
	self.entindex = event.Entindex
	self.ability = EntIndexToHScript(self.entindex)
	self.cooldown = self.ability:GetCooldownTimeRemaining()
	self:StartIntervalThink(1/120)
end

function modifier_bc_frozen_cooldown:OnIntervalThink()
	self.ability:StartCooldown(self.cooldown)
end

modifier_bc_cooldown_speed = class({})

function modifier_bc_cooldown_speed:IsHidden()
	return true
end

function modifier_bc_cooldown_speed:IsDebuff()
	return true
end

function modifier_bc_cooldown_speed:IsPurgable()
	return false
end

function modifier_bc_cooldown_speed:RemoveOnDeath()
	return false
end

function modifier_bc_cooldown_speed:GetAttributes()
	return MODIFIER_ATTRIBUTE_MULTIPLE
end

function modifier_bc_cooldown_speed:OnCreated(event)
	if IsClient() then return end
	self.entindex = event.Entindex
	self.ability = EntIndexToHScript(self.entindex)
	self.lastCooldown = self.ability:GetCooldownTimeRemaining()
	self.gameTime = GameRules:GetGameTime()
	self.speed = event.speed
	self.tickSpeed = 1/120
	self:StartIntervalThink(self.tickSpeed)
end

function modifier_bc_cooldown_speed:OnIntervalThink()
	local gameTime = GameRules:GetGameTime()
	local diff = gameTime - self.gameTime
	self.gameTime = gameTime
	local newCooldown = self.lastCooldown - diff * self.speed
	self.lastCooldown = newCooldown
	self.ability:EndCooldown()
	self.ability:StartCooldown(newCooldown)
end

