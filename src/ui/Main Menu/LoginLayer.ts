import { Game } from "../../game/Game";
import { firebaseManager } from "../../userdata/FirebaseManager";
import Vec2 from "../../vector2/Vector2";
import { UILayer } from "../UI";
import { Button } from "./Button";

export class LoginLayer extends UILayer {
    constructor(game: Game) {
        super([
            new loginButton(game),
        ]);
    }
}

class loginButton extends Button {
    constructor(game: Game) {
        // Fill whole screen
        super(new Vec2(20, 20), new Vec2(400, 100), "Log In");
        this.loaded = new Promise((resolve) => {
            // Here, we'll attempt to automatically log in the user
            firebaseManager.loaded.then(() => {
                if (firebaseManager.creds) {
                    return firebaseManager.get(firebaseManager.creds.uid);
                }
                return null;
            }).then(async (data) => {
                if (data) {
                    // Logged in, synchronize userdata and switch to main menu
                    await game.player.userdata.load();
                    game.switchMenuLayer(2);
                } else {
                    game.switchMenuLayer(1);
                }
                resolve(null);
            });
        });
    }

    public click(game: Game, event: MouseEvent) {
        firebaseManager.authenticate('google').then(() => {
            return firebaseManager.get(firebaseManager.creds!.uid);
        }).then(async (data) => {
            // Button clicked, synchronize userdata and switch to main menu
            await game.player.userdata.load();
            game.switchMenuLayer(2);
        });
    }
}

