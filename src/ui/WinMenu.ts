import { Game } from "../game/Game.js";
import Vec2 from "../vector2/Vector2.js";
import { UIElement, UILayer, UIMenu } from "./UI.js";

export default class WinMenu extends UIMenu {
    constructor(game: Game) {
        super([
            new winLayer(game),
        ], true);
    }
}

class winLayer extends UILayer {
    constructor(game: Game) {
        super([
            new winText(game),
        ]);
    }
}

class winText implements UIElement {
    pos: Vec2;
    size: Vec2;
    loaded: Promise<unknown>;
    click: () => void;
    counter: number = 0;

    constructor(game: Game) {
        // Fill whole screen
        this.pos = new Vec2(0, 0);
        this.size = game.size;

        this.loaded = Promise.resolve(); // TODO
        this.click = () => { };

        setInterval(() => {
            if (this.counter < 1) {
                this.counter += 0.02;
            }
        }, 20);
    }

    public draw(ctx: CanvasRenderingContext2D) {
        const old = [ctx.fillStyle, ctx.font, ctx.textAlign, ctx.textBaseline];

        // Draw semi-transparent black background
        ctx.fillStyle = `rgba(0, 0, 0, ${this.counter})`;
        ctx.fillRect(this.pos.x, this.pos.y, this.size.x, this.size.y);


        ctx.fillStyle = `rgba(0, 255, 0, ${this.counter})`;
        ctx.font = "80px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("You Won!", this.size.x / 2, this.size.y / 2);

        ctx.fillStyle = old[0];
        ctx.font = old[1] as string;
        ctx.textAlign = old[2] as CanvasTextAlign;
        ctx.textBaseline = old[3] as CanvasTextBaseline;
    }
}