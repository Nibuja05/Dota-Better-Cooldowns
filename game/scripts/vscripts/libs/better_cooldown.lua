LinkLuaModifier("modifier_frozen_cooldown", "libs/better_cooldown.lua", LUA_MODIFIER_MOTION_NONE)
LinkLuaModifier("modifier_client_cooldown", "libs/better_cooldown.lua", LUA_MODIFIER_MOTION_NONE)

if IsServer() then
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

	function CDOTABaseAbility:GetClientCooldown()
		return 0
	end

	function CDOTABaseAbility:SetClientCooldown(newCD)
		local caster = self:GetCaster()
		if not newCD then
			newCD = self:GetCooldown() * caster:GetCooldownReduction()
		end
		FireGameEvent("set_client_cooldown", {ability_index = self:entindex(), cooldown = newCD})
	end

	function CDOTABaseAbility:RegisterClientFunctions()
		FireGameEvent("register_client_ability_functions", {ability_index = self:entindex()})
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

modifier_client_cooldown = class({})

function modifier_client_cooldown:IsHidden()
	return true
end

function modifier_client_cooldown:IsDebuff()
	return true
end

function modifier_client_cooldown:IsPurgable()
	return false
end

function modifier_client_cooldown:RemoveOnDeath()
	return false
end