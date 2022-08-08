import { Entity } from "../entities/Entity.js";
import { TileEntity } from "../tileentities/TileEntity.js";
import Tile from "../tiles/Tile.js";
import Vec2 from "../vector2/Vector2.js";

export class Level {
    readonly tileSet: Array<Tile | null>;
    readonly map: number[][];
    readonly spawnPoint: Vec2;
    readonly tileEntities: TileEntity[];
    readonly loaded: Promise<void>;
    readonly entities: Entity[];

    constructor(tileset: Promise<Tile | null>[], map: number[][], startPos: Vec2, entities?: Entity[], tileEntities?: TileEntity[]) {
        this.tileSet = [];
        this.map = map;
        this.spawnPoint = startPos;
        this.entities = entities || [];
        this.tileEntities = tileEntities || [];
        this.loaded = new Promise<void>(resolve => {
            // Create a promise for each tile in the tileset that will resolve when the tile is loaded
            Promise.all([
                tileset.map(async (tilePromise, index) => {
                    // Wait for the import to load, then add the still-loading tile to the tileSet
                    this.tileSet[index] = await tilePromise;
                    // Wait for tile to load
                    await this.tileSet[index]?.loaded;
                    // Indicate that this tile is loaded
                    resolve();
                }),
                // Create a promise for each entity to load
                entities?.map(async (entity, index) => {
                    // Wait for the import to load, then add the still-loading tile to the tileSet
                    await entity.loaded;
                    // Indicate that this tile is loaded
                    resolve();
                }),
                // Create a promise for each tile entity to load
                tileEntities?.map(async (tileEntity, index) => {
                    // Wait for the import to load, then add the still-loading tile to the tileSet
                    await tileEntity.loaded;
                    // Indicate that this tile is loaded
                    resolve();
                })
            ]);
        });
    }

    protected getSize(): Vec2 {
        return new Vec2(this.map[0].length, this.map.length);
    };
}

export async function TileLoader(tileImports: Array<Promise<typeof import("../tiles/PlaceholderFloor.js")> | null>): Promise<Promise<Tile | null>[]> {
    /*
        There are a couple steps to loading tiles.
          1. Load the import for the tile.js file (async)
          2. Load the image/animation for the tile (async)
        That's why there is a double nested promise.
        
        We'll pass this on to the main game loop, where it will wait for ALL tiles to finish loading.
    */

    let tiles = new Array<Promise<Tile>>();
    // Return a promise which will resolve when all tiles are *imported*, not loaded
    return Promise.all(tileImports.map(async (tileImport, index) => {
        let tile = await tileImport;
        if (tile === null) { return null; }

        // Because we're running this asynchronously, we can't tiles.push the tile to the array, we need
        // to set it via index. Otherwise, the tile order may be incorrect.
        tiles[index] = tile.default;
    })).then(() => {
        return tiles;
    });
}