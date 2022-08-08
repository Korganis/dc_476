import { Melee } from "./Melee";

export default class Shortsword extends Melee {
    constructor() {
        super({ cooldown: 600, damage: 10, knockback: 50, range: 64 });
    }
}