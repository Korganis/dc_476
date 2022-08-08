import { Entity } from "../entities/Entity.js";
import Player from "../entities/character/Player.js";
import Tile from "../tiles/Tile.js";

/*
    Tile entities are entities are a hybrid of entities and tiles. They have a fixed position and size,
    but they aren't part of the level geometry, and you can interact with them. Examples would be chests,
    doors, items.
    
    They are locked to the same grid as the level geometry, so they can't be moved around like regular
    entities can.

    There's nothing stopping you from using a tile entity as a regular entity (or the other way around),
    but doing it this way helps to avoid confusion and lets us optimize more easily.
*/

export interface TileEntity extends Tile, Omit<Entity, "interpPos" | "vel"> {
    onCollide?(entity: Entity): void;
    onInteract?(player: Player): void;
    draw(): HTMLImageElement;
}