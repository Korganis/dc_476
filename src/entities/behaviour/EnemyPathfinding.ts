import { TILE_SIZE } from "../../game/Game";
import { Level } from "../../levels/Level";
import Vec2 from "../../vector2/Vector2";
import Character from "../character/Character";
import { Pathfinding } from "./Pathfinding";

const SIGHT_INCREMENT = 64;

export class EnemyPathfinding implements Pathfinding {
    private _movementSpeed: number;
    private _targetLastKnown?: Vec2;
    private _attackRange: number;
    private _sightRange: number;

    constructor(movementSpeed: number, sightRange: number = 4, attackRange: number = 64) {
        this._movementSpeed = movementSpeed;
        this._sightRange = sightRange;
        this._attackRange = attackRange;
    }

    public update(level: Level, target: Character, entity: Character): Vec2 {
        // Calculate the direction towards the target's location
        const offset = entity.pos.add(entity.size.div(2)).sub(target.pos.add(target.size.div(2)));
        const direction = offset.normalize();

        // If we're in range of the target, attack it
        if (offset.magnitude() - target.size.x < this._attackRange) {
            entity.attack(target, offset);
        }

        // Repeatedly check if that tile is solid, then check the next tile in that direction
        // If we reach the target, stop
        // If we reach a solid tile, stop, then repeat for the last known location of the target
        let currRayPos = new Vec2(entity.pos.x, entity.pos.y);
        for (let i = 0; i < this._sightRange; i++) {
            currRayPos = currRayPos.sub(direction.mul(SIGHT_INCREMENT));
            // Calculate if we can see the target
            const nextTile = level.tileSet[level.map?.[Math.floor(currRayPos.y / TILE_SIZE)]?.[Math.floor(currRayPos.x / TILE_SIZE)]];
            if (!nextTile || nextTile?.solid) { break; }


            // If we reach the target, that means we can see it.
            if (currRayPos.div(TILE_SIZE).round().equals(target.pos.div(TILE_SIZE).round())) {
                // Update last seen position, and move towards it
                this._targetLastKnown = currRayPos.add(target.size);
                return direction.mul(this._movementSpeed);
            }
        }
        // If we hit our last known position, stop
        if (this._targetLastKnown && entity.pos.div(TILE_SIZE).floor().equals(this._targetLastKnown.div(TILE_SIZE).floor())) {
            this._targetLastKnown = undefined;
            return new Vec2(0, 0);
        }

        // If we get here, we assume we can't see the target
        // If we have a last known location, move towards it
        return this._targetLastKnown ? entity.pos.sub(this._targetLastKnown).normalize().mul(this._movementSpeed) : new Vec2(0, 0);
    }
}