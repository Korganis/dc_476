import Vec2 from "../vector2/Vector2.js";
import { Pathfinding } from "./behaviour/Pathfinding.js";

/*
Entity is the base class for anything that 
*/

export interface Entity {
    pos: Vec2;
    vel: Vec2;
    size: Vec2;
    loaded: Promise<unknown>; // Returns once the animation, etc. is loaded
    lifetime: bigint; // How long the entity has been alive for
    pathfinding?: Pathfinding; // Pathfinding for the entity

    draw(): HTMLImageElement;
    move?(velocity: Vec2): void;
}