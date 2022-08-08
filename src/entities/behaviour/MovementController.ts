import { Level } from "../../levels/Level.js";
import Vec2 from "../../vector2/Vector2.js";
import Character, { isCharacter } from "../character/Character.js";

export const MOVEMENT_SPEED = 8;
export const MAX_MOVEMENT_SPEED = 14;
export const TOUCH_MOVEMENT_ACCURACY = 3; // Level of precision touch movement checks with before relinqishing control. The lower, the more accurate
// Keep in mind while editing these ^ friction has a massive affect on on the player's speed

const keys = new Map<string, boolean>();
keys.set('ArrowUp', false);
keys.set('ArrowDown', false);
keys.set('ArrowLeft', false);
keys.set('ArrowRight', false);
keys.set('z', false);

window.addEventListener('keydown', (event) => {
    if (keys.has(event.key)) {
        keys.set(event.key, true);
    }
});

window.addEventListener('keyup', (event) => {
    if (keys.has(event.key)) {
        keys.set(event.key, false);
    }
});

// Returns true if the character is moving
export const KeyboardController = (character: Character, level: Level): boolean => {
    const movement = new Vec2(0, 0);

    if (keys.get('ArrowUp')) {
        movement.y -= MOVEMENT_SPEED;
    }
    if (keys.get('ArrowDown')) {
        movement.y += MOVEMENT_SPEED;
    }
    if (keys.get('ArrowLeft')) {
        movement.x -= MOVEMENT_SPEED;
    }
    if (keys.get('ArrowRight')) {
        movement.x += MOVEMENT_SPEED;
    }

    if (keys.get("z")) {
        for (const entity of level.entities) {
            if (isCharacter(entity) && entity !== character) {
                character.attack(entity, character.pos.add(character.size.div(2)).sub(entity.pos.add(entity.size.div(2))));
            }
        }
    }

    if (movement.x !== 0 || movement.y !== 0) {
        // Don't allow the player to move faster than MAX_MOVEMENT_SPEED
        // This also have the side effect of making the player unable to move if they're being pushed back faster than they can move
        if (movement.magnitude() < MAX_MOVEMENT_SPEED) {
            character.move(movement);
        }
        return true;
    }

    return false;
};

// Returns true if the player has reached the destination
export const TouchController = (character: Character, touchPosition?: Vec2): boolean => {
    // If no target, return
    if (!touchPosition) { return true; }

    // Determine if player position is different from touch position, and if so, move the player, otherwise return
    const distanceFactor = (character.pos.x - touchPosition.x) + (character.pos.y - touchPosition.y);
    if (distanceFactor < TOUCH_MOVEMENT_ACCURACY && distanceFactor > -TOUCH_MOVEMENT_ACCURACY) {
        return true;
    }

    // Determine angle from character to touchPosition
    const angle = Math.atan2(touchPosition.y - character.pos.y, touchPosition.x - character.pos.x);
    const movement = angleToXY(character, angle);
    character.move(movement);
    return false;
};

// Helper function to convert from radians to x and y movement. Is equivalent to KeyboardController movement.
const angleToXY = (character: Character, angle: number): Vec2 => {
    const movement = new Vec2(0, 0);

    movement.x = Math.cos(angle) * MOVEMENT_SPEED;
    movement.y = Math.sin(angle) * MOVEMENT_SPEED;

    return movement;
};