import { Game } from "./game/Game.js";

window.onload = () => {
    // Start game
    const ui = document.getElementById('canvas-ui') as HTMLCanvasElement;
    const foreground = document.getElementById('canvas-foreground') as HTMLCanvasElement;
    const midground = document.getElementById('canvas-midground') as HTMLCanvasElement;
    const background = document.getElementById('canvas-background') as HTMLCanvasElement;
    const game = new Game({ ui, foreground, midground, background });
    (window as any).game = game;
};