LinkLuaModifier("modifier_cd_test", "cooldown_preview_ability.lua", LUA_MODIFIER_MOTION_NONE)

cooldown_preview_ability = class({})

function cooldown_preview_ability:GetBehavior()
	return DOTA_ABILITY_BEHAVIOR_NO_TARGET + DOTA_ABILITY_BEHAVIOR_IMMEDIATE
end

function cooldown_preview_ability:GetCooldown()
	return self:GetSpecialValueFor("cooldown")
end

function cooldown_preview_ability:OnSpellStart()
	local caster = self:GetCaster()

	caster:AddNewModifier(caster, self, "modifier_cd_test", {Duration = 8})
end

modifier_cd_test = class({})

function modifier_cd_test:OnCreated(event)
	if IsClient() then return end
	self.ability = self:GetAbility()
	self:StartIntervalThink(3)
end

function modifier_cd_test:OnIntervalThink()
	if IsClient() then return end
	self:StartIntervalThink(-1)
	self.ability:SetFrozenCooldown(true) -- paused the cooldown
end

function modifier_cd_test:OnDestroy()
	if IsClient() then return end
	self.ability:SetFrozenCooldown(false) -- resumes the cooldown
end
