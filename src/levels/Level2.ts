import { Skeleton } from "../entities/character/Skeleton.js";
import { Slime } from "../entities/character/Slime.js";
import { Zombie } from "../entities/character/Zombie.js";
import { LevelLoader } from "../tileentities/LevelLoader.js";
import Vec2 from "../vector2/Vector2.js";
import { Level, TileLoader } from "./Level.js";

let tileSet = [null, import('../tiles/PlaceholderFloor.js'), import('../tiles/PlaceholderWall.js'), import('../tiles/Lava.js'), import('../tiles/Bricks.js')];

const loadedTiles = await TileLoader(tileSet);

const map = [
    [0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 2, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 3, 3, 2, 2, 1, 1, 1],
    [2, 1, 4, 1, 1, 1, 1, 2, 0, 0, 0, 0, 1, 4, 4, 4, 4, 4, 4, 4, 4, 1, 1, 1, 3, 3, 2, 1, 1, 2],
    [2, 1, 1, 1, 2, 1, 1, 2, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1, 1, 1, 3, 2, 1, 1, 2],
    [1, 1, 1, 1, 2, 1, 1, 2, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1, 1, 1, 1, 2, 1, 1, 2],
    [0, 1, 2, 2, 2, 1, 1, 1, 4, 4, 4, 4, 1, 4, 4, 4, 4, 4, 4, 4, 4, 1, 1, 1, 1, 1, 2, 1, 1, 2],
    [0, 2, 2, 0, 0, 2, 2, 2, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1, 1, 1, 2, 0, 1, 1, 2],
    [0, 2, 2, 0, 0, 2, 2, 2, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 1, 1, 2],
    [0, 0, 2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 2, 1, 1, 1, 0, 0, 1, 1, 2],
    [0, 0, 0, 0, 0, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 2, 2, 2, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 2, 2, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 2, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

class Level2 extends Level {
    constructor() {
        super(loadedTiles, map, new Vec2(2, 2), [
            new Slime(new Vec2(307, 105)),
            new Skeleton(new Vec2(850, 140)),
            new Skeleton(new Vec2(1050, 140)),
            new Skeleton(new Vec2(1250, 140)),
            new Zombie(new Vec2(1360, 640)),
            new Slime(new Vec2(1200, 680)),
            new Slime(new Vec2(1200, 600)),
            new Skeleton(new Vec2(600, 640)),
        ], [
            new LevelLoader(new Vec2(9, 13), (window as any).game, import("../levels/Level3.js"))
        ]);
    }
}

const level: Level = new Level2();

export default level;