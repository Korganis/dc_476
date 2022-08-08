import { Game } from "../../game/Game";
import { firebaseManager } from "../../userdata/FirebaseManager";
import Vec2 from "../../vector2/Vector2";
import { UILayer, UIElement } from "../UI";

export class LoadingLayer extends UILayer {
    constructor(game: Game) {
        super([
            new loadingText(game),
        ]);
    }
}

class loadingText implements UIElement {
    public pos: Vec2;
    public size: Vec2;
    public loaded: Promise<unknown>;

    constructor(game: Game) {
        // Fill whole screen
        this.pos = new Vec2(20, 20);
        this.size = game.size;
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
        const old = [ctx.fillStyle, ctx.font, ctx.textAlign, ctx.textBaseline];
        // Draw the words "Paused"
        ctx.fillStyle = "white";
        ctx.font = "40px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("Loading", this.size.x / 2, this.size.y / 2);

        ctx.fillStyle = old[0];
        ctx.font = old[1] as string;
        ctx.textAlign = old[2] as CanvasTextAlign;
        ctx.textBaseline = old[3] as CanvasTextBaseline;
    }
}