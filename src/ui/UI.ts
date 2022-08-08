import { Game } from "../game/Game.js";
import Vec2 from "../vector2/Vector2.js";

/*
    Here's the basic idea behind the UI system:

    > Menus
    Each menu consists of UI layers (we'll call these "stacked layers"), each of which contain
    their own unique set of UI elements. Rather than having draw() return an HTMLImageElement,
    we instead pass through the canvas context and draw whatever we want to the screen.

    Each UI layer is represented by its index in the layers array.

    > UI Layers
    Each set of UI elements is represented by a layer. If part of a menu, the layer can have a
    parent (number representing the index of its parent layer in the menu.layers property). In
    that case, if the ESC key is pressed, or there's a back button, etc., the UI system will
    return to the parent layer.

    UI layers don't have to belong to a menu though. They can be drawn individually (we'll refer
    to them as "loose layers").

    > UI Elements
    Since UI elements are interfaces, we can provide our own instructions on how/when to draw
    them. This means that we can use them in loose UI layers where we can change their behavior
    based on the game state (ie. moving dialog boxes, health bar, etc.).

    Each element has a position and size, which will be used to determine it's hitbox.
    However, a UI element can paint wherever it likes on the screen.

    NOTE: Each UI element's draw() method should restore the previous context properties after
    it's finished drawing.
*/

export class UIMenu {
    protected _layers!: Array<UILayer>;
    private _currentLayer: number;
    private _loaded: Promise<unknown[][]>;
    private _shouldPause: boolean;

    constructor(layers: UILayer[], shouldPause: boolean = false) {
        this._layers = layers;
        this._currentLayer = 0;
        this._loaded = Promise.all(this._layers.map(element => element.loaded));
        this._shouldPause = shouldPause;
    }

    public get loaded(): Promise<unknown[][]> {
        return this._loaded;
    }

    public get shouldPause(): boolean {
        return this._shouldPause;
    }

    public switchLayer(layer: number) {
        this._currentLayer = layer;
        // TODO transition?
    }

    public draw(ctx: CanvasRenderingContext2D) {
        this._layers[this._currentLayer].draw(ctx);
    }

    public click(game: Game, event: MouseEvent): boolean {
        return this._layers[this._currentLayer].click(game, event);
    }
}

export class UILayer {
    private _parent?: number; // Present if part of a submenu
    private _elements: Array<UIElement>; // Elements contained in this layer
    private _loaded: Promise<unknown[]>;

    constructor(elements: Array<UIElement>, parent?: number) {
        this._parent = parent;
        this._elements = elements;
        this._loaded = Promise.all(this._elements.map(element => element.loaded));
    }

    public get loaded(): Promise<unknown[]> {
        return this._loaded;
    }

    public draw(ctx: CanvasRenderingContext2D) {
        this._elements.forEach(element => {
            element.draw(ctx);
        });
    }

    public click(game: Game, event: MouseEvent) {
        // Find elements that are hit
        const hitElements = this._elements.filter(element => {
            return element.pos.x < event.offsetX &&
                event.offsetX < element.pos.x + element.size.x &&
                element.pos.y < event.offsetY &&
                event.offsetY < element.pos.y + element.size.y;
        });

        // Click every element that was hit
        hitElements.forEach(element => {
            element.click(game, event);
        });

        return hitElements.length > 0;
    }
}

export interface UIElement {
    pos: Vec2;
    size: Vec2;
    loaded: Promise<unknown>;

    draw(ctx: CanvasRenderingContext2D): void;
    click: (game: Game, vent: MouseEvent) => void;
    // onHover: () => void;
}