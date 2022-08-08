import { BigZombie } from "../entities/character/BigZombie.js";
import Vec2 from "../vector2/Vector2.js";
import { Level, TileLoader } from "./Level.js";

let tileSet = [null, import('../tiles/PlaceholderFloor.js'), import('../tiles/PlaceholderWall.js'), import('../tiles/Lava.js'), import('../tiles/Bricks.js')];

const loadedTiles = await TileLoader(tileSet);

const map = [
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    [3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
    [3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
    [3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
    [3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
    [3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
    [3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
    [3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
    [2, 2, 2, 2, 2, 2, 4, 2, 2, 2, 2, 2, 2],
    [0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0],
];

class Level3 extends Level {
    constructor() {
        super(loadedTiles, map, new Vec2(6, 14), [
            // new Heart(new Vec2(2, 2)),
            new BigZombie(new Vec2(200, 200)),
        ], []);
    }
}

const level: Level = new Level3();

export default level;