import { TILE_SIZE } from "../../game/Game";
import { Level } from "../../levels/Level";
import Vec2 from "../../vector2/Vector2";
import Character from "../character/Character";
import { Pathfinding } from "./Pathfinding";

export class RangedPathfinding implements Pathfinding {
    private _movementSpeed: number;
    private _sightRange: number;
    private _fleeRange: number;

    constructor(movementSpeed: number, sightRange: number = 8, fleeRange: number = 8) {
        this._movementSpeed = movementSpeed;
        this._sightRange = sightRange;
        this._fleeRange = fleeRange;
    }

    public update(level: Level, target: Character, entity: Character): Vec2 {
        // Calculate the direction towards the target's location
        const offset = entity.pos.add(entity.size.div(2)).sub(target.pos.add(target.size.div(2)));
        const direction = offset.normalize();

        // Repeatedly check if that tile is solid, then check the next tile in that direction
        // If we reach the target, stop
        // If we reach a solid tile, stop, then repeat for the last known location of the target
        let currRayPos = new Vec2(entity.pos.x, entity.pos.y);
        for (let i = 0; i < this._sightRange; i++) {
            currRayPos = currRayPos.sub(direction.mul(TILE_SIZE));
            // Calculate if we can see the target
            const nextTile = level.tileSet?.[level.map[Math.floor(currRayPos.y / TILE_SIZE)]?.[Math.floor(currRayPos.x / TILE_SIZE)]];
            if (nextTile?.solid) { break; }


            // If we reach the target, that means we can see it.
            if (currRayPos.div(TILE_SIZE).round().equals(target.pos.div(TILE_SIZE).round())) {
                // If we can see the target, attack it.
                // If the target is within the flee range, move away from it.
                entity.attack(target, offset);
                if (offset.magnitude() < this._fleeRange * TILE_SIZE) {
                    return direction.mul(this._movementSpeed).mul(-1);
                }

                // Otherwise, stay still.
                return new Vec2(0, 0);
            }
        }

        return new Vec2(0, 0);
    }
}