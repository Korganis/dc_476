import { Game } from '../../game/Game.js';
import { Castle } from '../../userdata/Castle.js';
import { firebaseManager } from '../../userdata/FirebaseManager.js';
import Vec2 from '../../vector2/Vector2.js';
import { UIElement, UILayer } from '../UI.js';
import { Button } from './Button.js';

export class MainLayer extends UILayer {
    constructor(game: Game) {
        super([
            new continueGameButton(game),
            new newGameButton(game),
            new logOutButton(game),
            new avatar(game),
            new splashText(game),
        ]);
    }
}

class continueGameButton extends Button {
    constructor(game: Game) {
        super(new Vec2(20, 20), new Vec2(400, 100), "Continue Game");
        // Fill whole screen
        this.pos = new Vec2((game.size.x - 400) / 2, 400);
        this.size = new Vec2(400, 100);

        this.loaded = firebaseManager.loaded.then((f) => {
            return f;
        });
    }

    public click(game: Game, event: MouseEvent) {
        switch (game.player.userdata.level) {
            case 1:
                game.loadLevel(import('../../levels/Level1.js'));
                break;
            case 2:
                game.loadLevel(import('../../levels/Level2.js'));
                break;
            case 3:
                game.loadLevel(import('../../levels/Level3.js'));
                break;
            // TODO ADD MORE LEVELS
        }
    }
}

class newGameButton extends Button {
    constructor(game: Game) {
        super(new Vec2(20, 20), new Vec2(400, 100), "New Game");
        // Fill whole screen
        this.pos = new Vec2((game.size.x - 400) / 2, 520);
        this.size = new Vec2(400, 100);

        this.loaded = Promise.resolve(); // TODO
    }

    public click(game: Game, event: MouseEvent) {
        // Reset userdata
        game.player.userdata = new Castle();

        game.loadLevel(import('../../levels/Level1.js'));
    }
}

class logOutButton extends Button {
    constructor(game: Game) {
        super(new Vec2(20, 20), new Vec2(400, 100), "Switch User");
        // Fill whole screen
        this.pos = new Vec2((game.size.x - 400) / 2, 640);
        this.size = new Vec2(400, 100);

        this.loaded = Promise.resolve(); // TODO
    }

    public click(game: Game, event: MouseEvent) {
        firebaseManager.signOut();
        game.switchMenuLayer(1);
    }
}

class avatar implements UIElement {
    public pos: Vec2;
    public size: Vec2;
    public loaded: Promise<unknown>;

    constructor(game: Game) {
        // Fill whole screen
        this.pos = new Vec2(game.size.x - 240, 20);
        this.size = new Vec2(240, 20);
        this.loaded = new Promise((resolve) => {
            // Here, we'll attempt to automatically log in the user
            firebaseManager.loaded.then(() => {
                return firebaseManager.creds ? firebaseManager.get(firebaseManager.creds.uid) : null;
            }).then(async (data) => {
                if (data) {
                    // Logged in, synchronize userdata and switch to main menu
                    await game.player.userdata.load();
                    game.switchMenuLayer(2);
                }
                resolve(null);
            });
        });
    }
    public click(game: Game, event: MouseEvent) { }

    public draw(ctx: CanvasRenderingContext2D) {


        // Draw name in the top right corner
        const name = firebaseManager.creds?.displayName;
        if (name) {
            const old = [ctx.fillStyle, ctx.font, ctx.textAlign, ctx.textBaseline];

            // Draw the words "Paused"
            ctx.fillStyle = "white";
            ctx.font = "16px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(`Welcome, ${name}`, this.pos.x + this.size.x / 2, this.pos.y + this.size.y / 2);

            ctx.fillStyle = old[0];
            ctx.font = old[1] as string;
            ctx.textAlign = old[2] as CanvasTextAlign;
            ctx.textBaseline = old[3] as CanvasTextBaseline;
        }
    }
}

class splashText implements UIElement {
    // Draw name in the top right corner
    public pos: Vec2;
    public size: Vec2;
    public loaded: Promise<unknown>;

    constructor(game: Game) {
        // Full width, top of screen
        this.pos = new Vec2(0, 120);
        this.size = new Vec2(game.size.x, 40);
        this.loaded = Promise.resolve();
    }
    public click(game: Game, vent: MouseEvent) { };

    public draw(ctx: CanvasRenderingContext2D) {
        const old = [ctx.fillStyle, ctx.font, ctx.textAlign, ctx.textBaseline];

        // Draw the words "CS 476 Project"
        ctx.fillStyle = "white";
        ctx.font = "96px Impact";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`CS 476 Project`, this.pos.x + this.size.x / 2, this.pos.y + this.size.y / 2);

        // Draw "by Cole Crouter & Warren Smith" underneath in smaller font
        ctx.fillStyle = "white";
        ctx.font = "24px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`by Cole Crouter & Warren Smith`, this.pos.x + this.size.x / 2, this.pos.y + this.size.y / 2 + 80);

        ctx.fillStyle = old[0];
        ctx.font = old[1] as string;
        ctx.textAlign = old[2] as CanvasTextAlign;
        ctx.textBaseline = old[3] as CanvasTextBaseline;
    }
}