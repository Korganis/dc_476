import { Game } from "../game/Game.js";
import { LoadingLayer } from "./Main Menu/LoadingLayer.js";
import { LoginLayer } from "./Main Menu/LoginLayer.js";
import { MainLayer } from "./Main Menu/MainLayer.js";
import { UIMenu } from "./UI.js";

export default class MainMenu extends UIMenu {
    constructor(game: Game) {
        super([
            new LoadingLayer(game),
            new LoginLayer(game),
            new MainLayer(game),
        ], true);
    }
}