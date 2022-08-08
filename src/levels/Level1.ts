import { Slime } from "../entities/character/Slime.js";
import { Zombie } from "../entities/character/Zombie.js";
import { LevelLoader } from "../tileentities/LevelLoader.js";
import Vec2 from "../vector2/Vector2.js";
import { Level, TileLoader } from "./Level.js";

let tileSet = [null, import('../tiles/PlaceholderFloor.js'), import('../tiles/PlaceholderWall.js'), import('../tiles/Lava.js'), import('../tiles/Bricks.js')];

const loadedTiles = await TileLoader(tileSet);

const map = [
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0],
    [2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    [2, 1, 1, 1, 2, 2, 2, 2, 1, 1, 1, 1, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [2, 1, 1, 1, 1, 0, 0, 2, 1, 1, 1, 1, 2, 2, 1, 1, 1, 2, 0, 0, 0, 0, 0, 1, 1, 1, 0],
    [2, 2, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 2, 2, 2, 1, 2, 2, 0, 0, 1, 1, 1, 1, 1, 1, 0],
    [0, 2, 1, 1, 1, 2, 0, 0, 1, 1, 1, 1, 2, 2, 1, 1, 1, 2, 0, 1, 1, 1, 1, 1, 2, 2, 0],
    [0, 0, 2, 1, 1, 2, 0, 0, 0, 0, 4, 0, 2, 2, 2, 1, 2, 2, 0, 1, 1, 2, 2, 2, 2, 0, 0],
    [0, 1, 1, 1, 1, 2, 0, 0, 0, 0, 4, 0, 2, 2, 1, 1, 1, 2, 0, 1, 1, 1, 1, 2, 2, 2, 0],
    [0, 1, 1, 1, 1, 2, 0, 0, 0, 0, 4, 0, 2, 2, 2, 1, 2, 2, 0, 0, 1, 1, 1, 1, 1, 1, 2],
    [0, 1, 4, 1, 1, 2, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 2, 0, 0, 1, 1, 1, 1, 1, 1, 1],
    [0, 1, 1, 1, 1, 2, 0, 0, 2, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 4, 4],
    [0, 0, 0, 0, 0, 2, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 1, 1, 4, 4],
];

class Level1 extends Level {
    constructor() {
        super(loadedTiles, map, new Vec2(2, 9), [
            // First area
            new Slime(new Vec2(196, 192)),

            // Second area
            new Slime(new Vec2(576, 192)),
            new Slime(new Vec2(672, 192)),

            // Narrow corridor
            new Slime(new Vec2(907, 459)),
            new Slime(new Vec2(1024, 320)),

            // First winding path
            new Zombie(new Vec2(1460, 300)),

            // Second winding path
            new Zombie(new Vec2(1350, 500)),
        ], [
            new LevelLoader(new Vec2(26, 11), (window as any).game, import("../levels/Level2.js"))
        ]);
    }
}

const level: Level = new Level1();

export default level;