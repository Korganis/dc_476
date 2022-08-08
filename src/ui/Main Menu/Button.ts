import { Game } from "../../game/Game";
import Vec2 from "../../vector2/Vector2";
import { UIElement } from "../UI";

export class Button implements UIElement {
    public pos: Vec2;
    public size: Vec2;
    public loaded: Promise<unknown>;
    public text: string;

    constructor(pos: Vec2, size: Vec2, text: string) {
        this.pos = pos;
        this.size = size;
        this.text = text;
        this.loaded = Promise.resolve(); // TODO
    }

    public draw(ctx: CanvasRenderingContext2D) {
        const old = [ctx.fillStyle, ctx.font, ctx.textAlign, ctx.textBaseline];

        // Draw semi-transparent black background
        ctx.fillStyle = "#222";
        ctx.fillRect(this.pos.x, this.pos.y, this.size.x, this.size.y);

        // Draw the words "Paused"
        ctx.fillStyle = "white";
        ctx.font = "40px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(this.text, this.pos.x + this.size.x / 2, this.pos.y + this.size.y / 2);

        ctx.fillStyle = old[0];
        ctx.font = old[1] as string;
        ctx.textAlign = old[2] as CanvasTextAlign;
        ctx.textBaseline = old[3] as CanvasTextBaseline;
    }

    public click(game: Game, event: MouseEvent) { };
}