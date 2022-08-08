import { Pathfinding } from "../../../entities/behaviour/Pathfinding";
import { Entity } from "../../../entities/Entity";
import Vec2 from "../../../vector2/Vector2";

export class Projectile implements Entity {
    public pos: Vec2;
    public vel: Vec2;
    public size: Vec2;
    public loaded: Promise<unknown>;
    public lifetime: bigint;
    public pathfinding?: Pathfinding | undefined;

    // Represents the projectiles persistent speed
    private damage: number;

    draw(): HTMLImageElement {
        throw new Error("Method not implemented.");
    }

    move(velocity: Vec2): void {
        // this.facing = velocity.angle();
        this.vel = this.vel.add(velocity);
    }

    constructor(pos: Vec2, vel: Vec2, size: Vec2, damage: number) {
        this.pos = pos;
        this.vel = vel;
        this.size = size;
        this.damage = damage;
        this.lifetime = 0n;
        this.loaded = new Promise((resolve) => { });
    }
}

export const isProjectile = (entity: Entity): entity is Projectile => {
    return entity instanceof Projectile;
};