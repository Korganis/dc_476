import { isCharacter } from "../entities/character/Character.js";
import Player from "../entities/character/Player.js";
import { Game } from "../game/Game.js";
import Vec2 from "../vector2/Vector2.js";
import { UIElement, UILayer } from "./UI.js";

export default class HUD extends UILayer {
    constructor(game: Game) {
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            super([
                new healthBar(game.size, game.player),
                new instructions("Touch the screen to navigate, then tap the sword to attack."),
                new touchButton(game),
            ]);
            return;
        }
        super([
            new healthBar(game.size, game.player),
            new instructions("Use the arrow keys to move, and 'Z' to attack."),
        ]);
    }
}

class healthBar implements UIElement {
    pos: Vec2;
    size: Vec2;
    player: Player;
    loaded: Promise<unknown>;
    click: () => void;

    constructor(windowSize: Vec2, player: Player) {
        this.pos = new Vec2(40, 40);
        this.size = new Vec2(100, 20);
        this.click = () => { };
        this.player = player;
        this.loaded = Promise.resolve(); // TODO
    }

    public draw(ctx: CanvasRenderingContext2D) {
        const old = [ctx.fillStyle, ctx.font, ctx.textAlign, ctx.textBaseline];

        // Draw background bar
        ctx.fillStyle = "#444";
        ctx.fillRect(this.pos.x, this.pos.y, this.size.x, this.size.y);

        // Draw health bar
        ctx.fillStyle = "red";
        ctx.fillRect(this.pos.x, this.pos.y, this.size.x * this.player.userdata.health / this.player.userdata.maxHealth, this.size.y);

        // Draw centered text
        ctx.fillStyle = "white";
        ctx.font = "20px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`${this.player.userdata.health}/${this.player.userdata.maxHealth}`, this.pos.x + this.size.x / 2, this.pos.y + this.size.y / 2);

        ctx.fillStyle = old[0];
        ctx.font = old[1] as string;
        ctx.textAlign = old[2] as CanvasTextAlign;
        ctx.textBaseline = old[3] as CanvasTextBaseline;
    }
}

class touchButton implements UIElement {
    pos: Vec2;
    size: Vec2;
    game: Game;
    loaded: Promise<unknown>;
    sprite: HTMLImageElement;

    constructor(game: Game) {
        // Sword icon
        this.sprite = new Image();
        this.sprite.src = "./assets/img/entities/wooden_sword.png";

        this.game = game;
        this.pos = game.size.sub(210);
        this.size = new Vec2(200, 200);
        this.loaded = new Promise((resolve) => { this.sprite.onload = resolve; });
    }

    click(game: Game, event: MouseEvent) {
        const character = game.player;
        for (const entity of this.game.currentLevel!.entities) {
            if (isCharacter(entity) && entity !== character) {
                character.attack(entity, character.pos.add(character.size.div(2)).sub(entity.pos.add(entity.size.div(2))));
            }
        }
    }

    draw(ctx: CanvasRenderingContext2D): void {
        const old = [ctx.fillStyle, ctx.font, ctx.textAlign, ctx.textBaseline];

        // Draw background bar
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.fillRect(this.pos.x, this.pos.y, this.size.x, this.size.y);

        // Draw wooden_sword image
        ctx.drawImage(this.sprite, this.pos.x + (this.size.x - this.sprite.width * 8) / 2, this.pos.y + ((this.size.y - this.sprite.height * 8)) / 2, this.sprite.width * 8, this.sprite.height * 8);


        ctx.fillStyle = old[0];
        ctx.font = old[1] as string;
        ctx.textAlign = old[2] as CanvasTextAlign;
        ctx.textBaseline = old[3] as CanvasTextBaseline;
    }
}

class instructions implements UIElement {
    pos: Vec2;
    size: Vec2;
    loaded: Promise<unknown>;
    click: () => void;
    text: string;
    font: string;
    align: CanvasTextAlign;
    baseline: CanvasTextBaseline;
    color: string;
    constructor(text: string) {
        this.pos = new Vec2(20, 760);
        this.size = new Vec2(460, 40);
        this.click = () => { };
        this.text = text;
        this.font = "20px Arial";
        this.align = "left";
        this.baseline = "bottom";
        this.color = "white";
        this.loaded = Promise.resolve(); // TODO
    }
    public draw(ctx: CanvasRenderingContext2D) {
        const old = [ctx.fillStyle, ctx.font, ctx.textAlign, ctx.textBaseline];
        ctx.fillStyle = this.color;
        ctx.font = this.font;
        ctx.textAlign = this.align;
        ctx.textBaseline = this.baseline;
        ctx.fillText(this.text, this.pos.x, this.pos.y);
        ctx.fillStyle = old[0];
        ctx.font = old[1] as string;
        ctx.textAlign = old[2] as CanvasTextAlign;
        ctx.textBaseline = old[3] as CanvasTextBaseline;
    }
}