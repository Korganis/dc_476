import { ProjectilePathfinding } from "../../../entities/behaviour/ProjectilePathfinding";
import Vec2 from "../../../vector2/Vector2";
import { Projectile } from "./Projectile";

const sprite = new Image();
sprite.src = "./assets/img/entities/arrow.png";

export class Arrow extends Projectile {
    constructor(pos: Vec2, vel: Vec2) {
        super(pos, vel, new Vec2(4, 4), 10);
        this.pathfinding = new ProjectilePathfinding(5, 12);
    }

    draw(): HTMLImageElement {
        return sprite;
    }
}