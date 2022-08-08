import { Castle } from "../../userdata/Castle.js";
import Vec2 from "../../vector2/Vector2.js";
import { Weapon } from "../../weapons/Weapon.js";
import { Pathfinding } from "../behaviour/Pathfinding.js";
import { Entity } from "../Entity.js";

/*
    A character is defined as any entity that could move and have health. It's a subclass of Entity,
    meant to be used as a base class for player, NPC, and enemy entities.
*/

export default interface Character extends Entity {
    userdata: Castle;
    facing: number;
    pathfinding?: Pathfinding;
    weapon?: Weapon;

    move(vector: Vec2): void;
    attack(target: Character, relativePos: Vec2): void;
}

export function isCharacter(entity: any): entity is Character {
    return entity !== undefined &&
        entity.userdata !== undefined &&
        typeof entity.facing === "number";
}