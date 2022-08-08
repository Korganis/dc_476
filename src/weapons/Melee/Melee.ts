import Character from "../../entities/character/Character";
import Vec2 from "../../vector2/Vector2";
import { Weapon } from "../Weapon";

export class Melee implements Weapon {
    public name: string;
    public cooldown: number;
    public onCooldown: boolean;

    readonly knockback: number;
    readonly damage: number;
    readonly range: number;


    constructor(stats: { knockback: number, damage: number, range: number, cooldown: number, name?: string; }) {
        this.name = stats.name || this.constructor.name || "Melee";
        this.knockback = stats.knockback;
        this.damage = stats.damage;
        this.range = stats.range;
        this.cooldown = stats.cooldown;
        this.onCooldown = false;
    }

    attack(target: Character, relativePos: Vec2): boolean {
        // Check if in cooldown
        if (this.onCooldown) { return false; }
        setTimeout(() => { this.onCooldown = false; }, this.cooldown);
        setTimeout(() => { this.onCooldown = true; }, 15); // I'm using a delay to set, because when I set it right away it triggers the cooldown before we've had a chance to check other entities being hit

        // Check if in range
        if (relativePos.magnitude() - target.size.x > this.range) { return false; }

        // Deal damage
        target.userdata.health -= this.damage;

        // Apply knockback
        const angle = relativePos.angle();
        target.vel = target.vel.add(new Vec2(-1, 0).rotate(angle).mul(10));
        return true;
    }
}