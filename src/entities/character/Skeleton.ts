import { Castle } from "../../userdata/Castle";
import Vec2 from "../../vector2/Vector2";
import Bow from "../../weapons/Ranged/Bow";
import { Weapon } from "../../weapons/Weapon";
import { RangedPathfinding } from "../behaviour/RangedPathfinding";
import Character from "./Character";

const sprite = new Image();
sprite.src = "./assets/img/entities/skeleton.png";

export class Skeleton implements Character {
    // Physical properties
    private _size: Vec2;
    public pos: Vec2;
    public vel: Vec2;
    public facing: number;
    public lifetime: bigint;
    public userdata: Castle;
    public weapon?: Weapon;

    // Pathfinding
    public pathfinding?: RangedPathfinding | undefined;

    // Graphics
    private sprite: HTMLImageElement;
    private _loaded: Promise<unknown>;

    constructor(pos: Vec2) {
        this._size = new Vec2(12, 12);
        this.pos = pos;
        this.vel = new Vec2(0, 0);
        this.facing = 0;
        this.lifetime = 0n;
        this.userdata = {
            level: 0,
            exp: 0,
            mana: 0,
            armor: 0,
            coins: 0,
            rubies: 0,
            health: 20,
            maxHealth: 20,
        } as Castle;
        this.pathfinding = new RangedPathfinding(1.5, 16, 3);
        this.weapon = new Bow();

        this.sprite = sprite;
        this._loaded = new Promise((resolve) => { (this.sprite as HTMLImageElement).onload = resolve; });
        // TODO add animation
    }

    draw(): HTMLImageElement {
        return this.sprite;
    }

    move(velocity: Vec2): void {
        this.facing = velocity.angle();
        this.vel = this.vel.add(velocity);
    }

    attack(target: Character, relativePos: Vec2): void {
        if (this.weapon) {
            this.weapon.attack(target, relativePos);
        }
    }

    get size(): Vec2 {
        return this._size;
    }

    get loaded(): Promise<unknown> {
        return this._loaded;
    }
}