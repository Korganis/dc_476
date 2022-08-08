import { TICKRATE, TICKRATE_N } from "../../game/Game";
import { Castle } from "../../userdata/Castle";
import Vec2 from "../../vector2/Vector2";
import Character from "../character/Character";
import { Drop } from "./Drop";

// We'll preload this image so we don't have to fetch it each time the user taps the screen.
const frames = new Array<HTMLImageElement>();

export class Heart implements Drop {
    public pos: Vec2;
    public vel: Vec2;
    public lifetime: bigint;
    readonly size: Vec2;
    readonly loaded: Promise<unknown>;
    readonly from: Character;;

    constructor(character: Character) {
        // Load images if not already loaded
        let promises = [];
        if (frames.length === 0) {
            for (let i = 0; i < 2; i++) {
                frames.push(new Image());
                frames[i].src = `./assets/img/entities/heart/${i}.png`;
                promises.push(new Promise((resolve) => { frames[i].onload = resolve; }));
            }
        }


        this.pos = character.pos.add(character.size.div(2));
        this.vel = new Vec2(Math.random() * 40 - 20, Math.random() * 40 - 20); // Set velocity to random velocity between -20 and 20
        this.size = new Vec2(6, 6);
        this.loaded = Promise.resolve();
        this.lifetime = 0n;
        this.from = character;
    }

    pickup(character: Character): void {
        // Get random number based on 10% of the entity's max health
        let health = Math.max(Math.floor(this.from.userdata.maxHealth * Math.random()), 1);
        character.userdata.health = Math.min(character.userdata.health + health, character.userdata.maxHealth);
    }

    draw(): HTMLImageElement {
        // Draw the correct frame based on lifetime
        let frame = ((this.lifetime * TICKRATE_N) >> 7n) % 15n == 14n ? 1 : 0;
        return frames[frame];
    }
}