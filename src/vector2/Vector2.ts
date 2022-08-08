// https://raw.githubusercontent.com/reinvanoyen/tnt-Vector2/master/dist/index.js
"use strict";

class Vec2 {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    lerp(v: Vec2, factor: number) {
        return v.sub(this).mul(factor).add(this);
    }

    dot(v: Vec2) {
        return (this.x * v.x) + (this.y * v.y);
    }

    normalize() {
        let mag = this.magnitude();
        return mag ? this.div(Math.abs(mag)) : new Vec2(0, 0);
    }

    cross(v: Vec2) {
        return (this.x * v.y) - (this.y * v.x);
    }

    rotate(angle: number) {
        let cos = Math.cos(angle);
        let sin = Math.sin(angle);

        return new Vec2(this.x * cos - this.y * sin, this.x * sin + this.y * cos);
    }

    add(v: Vec2 | number) {
        if (typeof v === 'number') {
            return new Vec2(this.x + v, this.y + v);
        }

        return new Vec2(this.x + v.x, this.y + v.y);
    }

    sub(v: Vec2 | number) {
        if (typeof v === 'number') {
            return new Vec2(this.x - v, this.y - v);
        }
        return new Vec2(this.x - v.x, this.y - v.y);
    }

    mul(v: Vec2 | number) {
        if (typeof v === 'number') {
            return new Vec2(this.x * v, this.y * v);
        }
        return new Vec2(this.x * v.x, this.y * v.y);
    }

    div(v: Vec2 | number) {
        if (typeof v === 'number') {
            return new Vec2(this.x / v, this.y / v);
        }

        return new Vec2(this.x / v.x, this.y / v.y);
    }

    mod(v: Vec2 | number) {
        if (typeof v === 'number') {
            return new Vec2(this.x % v, this.y % v);
        }
        return new Vec2(this.x % v.x, this.y % v.y);
    }

    abs() {
        return new Vec2(Math.abs(this.x), Math.abs(this.y));
    }

    equals(v: Vec2 | number) {
        if (typeof v === 'number') {
            return this.x === v && this.y === v;
        }
        return this.x === v.x && this.y === v.y;
    }

    angle() {
        return Math.atan2(this.y, this.x);
    }

    magnitude() {
        return Math.sqrt((this.x * this.x) + (this.y * this.y));
    }

    floor() {
        return new Vec2(Math.floor(this.x), Math.floor(this.y));
    }

    round() {
        return new Vec2(Math.round(this.x), Math.round(this.y));
    }
}

export default Vec2;