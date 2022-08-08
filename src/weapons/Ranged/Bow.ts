import { Arrow } from "./Projectile/Arrow";
import { Ranged } from "./Ranged";

export default class Bow extends Ranged {
    constructor() {
        super({ cooldown: 3000, damage: 10, knockback: 0, projectile: Arrow });
    }
}