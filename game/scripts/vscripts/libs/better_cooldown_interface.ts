import { BaseAbility } from "./dota_ts_adapter";

export interface BaseAbility {
	SetFrozenCooldown(state: boolean);
	SetCooldownSpeed(speed: number);
}