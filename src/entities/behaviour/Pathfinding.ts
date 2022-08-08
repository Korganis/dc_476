import { Level } from "../../levels/Level";
import Vec2 from "../../vector2/Vector2";
import Character from "../character/Character";

export interface Pathfinding {
    update(level: Level, target: Character, entity: Character): Vec2;
}