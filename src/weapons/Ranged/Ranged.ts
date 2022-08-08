import Character from "../../entities/character/Character";
import { Game } from "../../game/Game";
import Vec2 from "../../vector2/Vector2";
import { Weapon } from "../Weapon";
import Bow from "./Bow";
import { Projectile } from "./Projectile/Projectile";

export class Ranged implements Weapon {
    public name: string;
    public cooldown: number;
    public onCooldown: boolean;

    readonly knockback: number;
    readonly damage: number;

    private projectile: typeof Projectile;


    constructor(stats: { knockback: number, damage: number, cooldown: number, name?: string, projectile: typeof Projectile; }) {
        this.name = stats.name || this.constructor.name || "Melee";
        this.knockback = stats.knockback;
        this.damage = stats.damage;
        this.cooldown = stats.cooldown;
        this.onCooldown = false;
        this.projectile = stats.projectile;
    }

    attack(target: Character, relativePos: Vec2): boolean {
        // Check if in cooldown
        if (this.onCooldown) { return false; }
        this.onCooldown = true;
        setTimeout(() => { this.onCooldown = false; }, this.cooldown);

        // Create the projectile
        const projectile = new this.projectile(target.pos.add(relativePos), relativePos.sub(target.size.div(2)).normalize().mul(-40), target.size, this.damage);
        ((window as any).game as Game).currentLevel?.entities.push(projectile); // Cheap hack to add the projectile to the level

        return true;
    }
}