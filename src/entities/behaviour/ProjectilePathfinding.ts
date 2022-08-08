import { TILE_SIZE } from "../../game/Game";
import { Level } from "../../levels/Level";
import Vec2 from "../../vector2/Vector2";
import Character from "../character/Character";
import { Pathfinding } from "./Pathfinding";

const SIGHT_INCREMENT = 64;

export class ProjectilePathfinding implements Pathfinding {
    private _damage: number;
    private _knockback: number;

    constructor(damage: number, knockback: number) {
        this._damage = damage;
        this._knockback = knockback;
    }

    public update(level: Level, target: Character, entity: Character): Vec2 {
        // If we're close enough to the target, attack, then stop moving
        const offset = target.pos.sub(entity.pos);
        const distance = offset.magnitude();
        if (distance < SIGHT_INCREMENT) {
            target.userdata.health -= this._damage;
            target.vel = target.vel.add(offset.normalize().mul(this._knockback));
            return new Vec2(0, 0);
        }

        // Apply the movement speed
        return entity.vel;
    }
}