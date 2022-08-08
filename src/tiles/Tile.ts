export default interface Tile {
    solid: boolean;
    loaded: Promise<unknown>;
    layer: 'floor' | 'wall';

    // onInteract?(player: Player): void;
    draw(): HTMLImageElement;
}