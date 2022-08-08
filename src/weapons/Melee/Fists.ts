import { Melee } from "./Melee";

export default class Fists extends Melee {
    constructor() {
        super({ cooldown: 1000, damage: 5, knockback: 20, range: 64 });
    }
}