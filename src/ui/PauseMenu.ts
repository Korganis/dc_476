import { Game } from "../game/Game.js";
import Vec2 from "../vector2/Vector2.js";
import { UIElement, UILayer, UIMenu } from "./UI.js";

export default class PauseMenu extends UIMenu {
    constructor(game: Game) {
        super([
            new pauseLayer(game),
        ], true);
    }
}

class pauseLayer extends UILayer {
    constructor(game: Game) {
        super([
            new pauseText(game),
        ]);
    }
}

class pauseText implements UIElement {
    pos: Vec2;
    size: Vec2;
    loaded: Promise<unknown>;
    click: () => void;

    constructor(game: Game) {
        // Fill whole screen
        this.pos = new Vec2(0, 0);
        this.size = game.size;

        this.loaded = Promise.resolve(); // TODO
        this.click = () => { };
    }

    public draw(ctx: CanvasRenderingContext2D) {
        const old = [ctx.fillStyle, ctx.font, ctx.textAlign, ctx.textBaseline];

        // Draw semi-transparent black background
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(this.pos.x, this.pos.y, this.size.x, this.size.y);

        // Draw the words "Paused"
        ctx.fillStyle = "white";
        ctx.font = "40px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("Paused", this.size.x / 2, this.size.y / 2);

        ctx.fillStyle = old[0];
        ctx.font = old[1] as string;
        ctx.textAlign = old[2] as CanvasTextAlign;
        ctx.textBaseline = old[3] as CanvasTextBaseline;
    }
}