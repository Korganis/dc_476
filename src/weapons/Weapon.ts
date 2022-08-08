import Character from "../entities/character/Character";
import Vec2 from "../vector2/Vector2";

export interface Weapon {
    name?: string;
    cooldown?: number;
    onCooldown?: boolean;

    attack(target: Character, relativePos?: Vec2): boolean;
}