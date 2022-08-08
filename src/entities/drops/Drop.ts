import Vec2 from "../../vector2/Vector2";
import Character from "../character/Character";
import { Entity } from "../Entity";

export interface Drop extends Entity {
    pos: Vec2;
    vel: Vec2;
    size: Vec2;
    loaded: Promise<unknown>;
    lifetime: bigint;

    pickup(character: Character): void;
}

export function isDrop(entity: any): entity is Drop {
    return entity !== undefined &&
        typeof entity.pickup === "function";
}