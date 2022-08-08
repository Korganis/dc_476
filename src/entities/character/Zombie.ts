import { Castle } from "../../userdata/Castle";
import Vec2 from "../../vector2/Vector2";
import Shortsword from "../../weapons/Melee/Shortsword";
import { Weapon } from "../../weapons/Weapon";
import { EnemyPathfinding } from "../behaviour/EnemyPathfinding";
import Character from "./Character";

const sprite = new Image();
sprite.src = "./assets/img/entities/zombie.png";
export class Zombie implements Character {
    // Physical properties
    private _size: Vec2;
    public pos: Vec2;
    public vel: Vec2;
    public facing: number;
    public lifetime: bigint;
    public userdata: Castle;
    public weapon?: Weapon;

    // Pathfinding
    public pathfinding?: EnemyPathfinding | undefined;

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
            health: 40,
            maxHealth: 40,
        } as Castle;
        this.pathfinding = new EnemyPathfinding(1.5, 16, 64);
        this.weapon = new Shortsword();

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
            if (this.weapon.attack(target, relativePos)) {
                this.vel = this.vel.add(new Vec2(1, 0).rotate(relativePos.angle()).mul(20));
            }
        }
    }

    get size(): Vec2 {
        return this._size;
    }

    get loaded(): Promise<unknown> {
        return this._loaded;
    }
}