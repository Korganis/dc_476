import { TICKRATE, TICKRATE_N } from "../../game/Game.js";
import Vec2 from "../../vector2/Vector2.js";
import { Entity } from "../Entity.js";

// We'll preload this image so we don't have to fetch it each time the user taps the screen.
const frames = new Array<HTMLImageElement>();
class TouchIcon implements Entity {
    pos: Vec2;
    vel: Vec2;
    size: Vec2;
    loaded: Promise<unknown>;
    lifetime: bigint;

    constructor(pos: Vec2) {
        // Load images if not already loaded
        let promises = [];
        if (frames.length === 0) {
            for (let i = 0; i < 5; i++) {
                frames.push(new Image());
                frames[i].src = `./assets/img/entities/touch_icon/${i}.png`;
                promises.push(new Promise((resolve) => { frames[i].onload = resolve; }));
            }
        }

        this.pos = pos;
        this.vel = new Vec2(0, 0);
        this.size = new Vec2(12, 12);
        this.loaded = Promise.all(promises);
        this.lifetime = 0n;
    }


    draw(): HTMLImageElement {
        // Draw the correct frame based on lifetime
        let frame = (this.lifetime * TICKRATE_N) >> 6n; // This will switch frames every 100ms
        return frames[frame as unknown as number];
    }
}

export default TouchIcon;