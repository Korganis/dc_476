import Character from "../entities/character/Character";
import { Game } from "../game/Game";
import Vec2 from "../vector2/Vector2";
import { TileEntity } from "./TileEntity";

const img = new Image();
img.src = "./assets/img/tiles/dark_oak_trapdoor.png";

export class LevelLoader implements TileEntity {
    draw(): HTMLImageElement {
        return this.sprite;
    }
    onCollide(entity: Character): void {
        if (entity.constructor.name === "Player") {
            this.game.loadLevel(this.level);
        }
    }
    solid: boolean;
    loaded: Promise<unknown>;
    layer: "floor" | "wall";
    pos: Vec2;
    size: Vec2;
    lifetime: bigint;
    sprite: HTMLImageElement;
    game: Game;
    level: Promise<typeof import("../levels/Level1")>;

    constructor(pos: Vec2, game: Game, level: Promise<typeof import("../levels/Level1")>) {
        this.solid = true;
        this.loaded = new Promise((resolve) => { img.onload = resolve; });
        this.sprite = img;
        this.pos = pos;
        this.size = new Vec2(1, 1);
        this.lifetime = 0n;
        this.layer = "floor";
        this.game = game;
        this.level = level;
    }
}