import { Melee } from "./Melee";

export default class Longsword extends Melee {
    constructor() {
        super({ cooldown: 1000, damage: 10, knockback: 50, range: 96 });
    }
}