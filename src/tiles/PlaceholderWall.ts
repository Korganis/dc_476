import Tile from "./Tile.js";

const img = new Image();
img.src = "./assets/img/tiles/deepslate_top.png";

// Once our image is loaded, we can return it
const tile = new Promise<Tile>((resolve) => {
    img.onload = () => {
        resolve({
            solid: true,
            layer: 'wall',
            loaded: new Promise((resolve) => { img.onload = resolve; }),
            draw: () => img,
        });
    };
});

export default tile;