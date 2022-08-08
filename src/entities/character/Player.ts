import { Castle } from "../../userdata/Castle.js";
import { firebaseManager } from "../../userdata/FirebaseManager.js";
import Vec2 from "../../vector2/Vector2.js";
import Longsword from "../../weapons/Melee/Longsword.js";
import { Weapon } from "../../weapons/Weapon.js";
import Character from "./Character.js";
class Player implements Omit<Character, "health" | "maxHealth"> { // We omit the health and totalHealth properties because they're part of Castle
    // Physical properties
    private _size: Vec2;
    public pos: Vec2;
    public vel: Vec2;
    public facing: number;
    public lifetime: bigint;
    public weapon?: Weapon;

    // Stats
    public userdata: Castle;

    // Graphics
    private sprite: HTMLImageElement;
    private spriteSwing: HTMLImageElement;
    private _loaded: Promise<unknown>;

    constructor() {
        this._size = new Vec2(12, 12);
        this.pos = new Vec2(0, 0);
        this.vel = new Vec2(0, 0);
        this.facing = 0;
        this.lifetime = 0n;
        this.weapon = new Longsword();

        this.userdata = new Castle(); // TODO user data

        this.sprite = new Image();
        this.spriteSwing = new Image();
        this._loaded = Promise.all([new Promise((resolve) => { (this.sprite as HTMLImageElement).onload = resolve; }), firebaseManager.loaded]);
        this.sprite.src = "./assets/img/entities/armor_stand.png";
        this.spriteSwing.src = "./assets/img/entities/armor_stand_swing.png";
        // TODO add animation
    }

    draw(): HTMLImageElement {
        return this.weapon?.onCooldown ? this.spriteSwing : this.sprite;
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

export default Player;

function mergeImages(arg0: string[]): string {
    throw new Error("Function not implemented.");
}
