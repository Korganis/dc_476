import Tile from "./Tile.js";

const img = new Image();
img.src = "./assets/img/tiles/stone.png";

// Once our image is loaded, we can return it
const tile = new Promise<Tile>((resolve) => {
    resolve({
        solid: false,
        layer: 'floor',
        loaded: new Promise((resolve) => { img.onload = resolve; }),
        draw: () => img,
    });
});

export default tile;