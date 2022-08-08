import { KeyboardController, TouchController } from "../entities/behaviour/MovementController.js";
import Poof from "../entities/behaviour/Poof.js";
import TouchIcon from "../entities/behaviour/TouchIcon.js";
import Character, { isCharacter } from "../entities/character/Character.js";
import Player from "../entities/character/Player.js";
import { isDrop } from "../entities/drops/Drop.js";
import { Heart } from "../entities/drops/Heart.js";
import { Level } from "../levels/Level.js";
import DeathMenu from "../ui/DeathMenu.js";
import HUD from "../ui/HUD.js";
import MainMenu from "../ui/MainMenu.js";
import PauseMenu from "../ui/PauseMenu.js";
import { UIMenu } from "../ui/UI.js";
import WinMenu from "../ui/WinMenu.js";
import Vec2 from "../vector2/Vector2.js";
import { isProjectile } from "../weapons/Ranged/Projectile/Projectile.js";

// ------- SETTINGS ------- //
export const TILE_SIZE = 64; // Desired height of a tile in pixels
export const TILE_SCALING = 4; // TILESIZE / actual height of a tile in pixels
export const TICKRATE = 1000 / 16; // CPU tickrate in ms
export const TICKRATE_N = BigInt(Math.floor(TICKRATE));
export const DEBUG = true;
export const FRICTION = 0.3; // How much friction do entities have?
export const POSITION_ACCURACY = 1000; // How many decimal places to round entity position too, will affect smoothness of movement
export const VELOCITY_ACCURACY = 10; // How many decimal places to round entity velocity too, used to stop 0.000...01 velocities causing increased lag

const stalagmites = new Image();
stalagmites.src = "./assets/img/tiles/bottom.png";

/*
    Game handles the game loop and level loading. All the game logic functions are called
    from here. Anything relevant to game settings, size, etc. should be defined here. 
*/

export class Game {
    private canvas: {
        ui: HTMLCanvasElement;
        foreground: HTMLCanvasElement;
        midground: HTMLCanvasElement;
        background: HTMLCanvasElement;
    };
    private ctx: {
        ui: CanvasRenderingContext2D;
        foreground: CanvasRenderingContext2D;
        midground: CanvasRenderingContext2D;
        background: CanvasRenderingContext2D;
    };
    private _size: Vec2;

    public player: Player;
    public currentLevel?: Level;

    // Store the center of the screen, so we don't have to calculate it every frame
    private screenCenter: Vec2;

    // Store value for frame times, see below in gpuTick()
    private prevMS: number;
    private currMS: number;

    // Store the last place clicked/tapped
    private touchPosition?: Vec2;

    // Map for interoplated positions.
    private interpPosPlayer?: Vec2;

    // HUD
    private hud: HUD;

    // Menus
    private _currentMenu?: UIMenu | undefined;
    private pauseMenu: PauseMenu;

    public get size(): Vec2 {
        return this._size;
    }

    public switchMenuLayer(id: number) {
        this._currentMenu?.switchLayer(id);
    }

    constructor(canvas: {
        ui: HTMLCanvasElement;
        foreground: HTMLCanvasElement;
        midground: HTMLCanvasElement;
        background: HTMLCanvasElement;
    }) {
        this.canvas = canvas;
        this.ctx = {
            ui: canvas.ui.getContext('2d')!,
            foreground: canvas.foreground.getContext('2d')!,
            midground: canvas.midground.getContext('2d')!,
            background: canvas.background.getContext('2d')!,
        };
        this._size = new Vec2(canvas.ui.width, canvas.ui.height);

        this.player = new Player();

        // Preserve pixels
        (this.ctx.ui as any).imageSmoothingEnabled = false;
        (this.ctx.foreground as any).imageSmoothingEnabled = false;
        (this.ctx.midground as any).imageSmoothingEnabled = false;
        (this.ctx.background as any).imageSmoothingEnabled = false;

        // Store window where the center of the screen is
        this.screenCenter = new Vec2(this.size.x / 2, this.size.y / 2);

        // Set default values for frame times
        this.prevMS = 0;
        this.currMS = 0;

        // Set up HUD
        this.hud = new HUD(this);

        // Load menus
        this.pauseMenu = new PauseMenu(this);

        // Trigger GPU and CPU tick
        this.gpuTick(); // gpuTick() is recursive, so it will call itself every frame (when the browser deems fit 🤷‍♂️)
        setInterval(this.cpuTick.bind(this), TICKRATE); // call cpuTick() every 16th of a second

        // Set up onclick for touch controls
        this.canvas.ui.addEventListener('click', (event) => {
            // Menu clicking logic
            if (this._currentMenu) {
                this._currentMenu.click(this, event);
                return;
            }

            // Check if they clicked on a hud element
            if (this.hud.click(this, event)) {
                return;
            }

            // Otherwise, move the player to the clicked position
            const offset = this.screenCenter.sub(this.interpPosPlayer!);
            const elemRect = this.canvas.ui.getBoundingClientRect();
            const newPos = new Vec2(0, 0);
            newPos.x = event.clientX - elemRect.left - offset.x - (this.player.size.x * TILE_SCALING) / 2;
            newPos.y = event.clientY - elemRect.top - offset.y - (this.player.size.y * TILE_SCALING) / 2;
            this.touchPosition = newPos;

            // Add touch icon to the level
            const touchIcon = new TouchIcon(this.touchPosition);
            this.currentLevel?.entities.push(touchIcon);

            // Set to delete after delay
            setTimeout(() => {
                this.currentLevel?.entities.splice(this.currentLevel?.entities.indexOf(touchIcon), 1);
            }, Math.pow(2, 6) * 6); // lifetime is ((lifetime*tickrate) >> 6) * 6 frames, because we can't divide a bigint
        });

        // Set up listeners for pause menu
        window.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && (this._currentMenu === undefined || this._currentMenu === this.pauseMenu)) {
                this._currentMenu = this._currentMenu === undefined ? this.pauseMenu : undefined; // Toggle pause menu
            }
        });

        // Load the main menu
        this._currentMenu = new MainMenu(this);
    }

    // Pass in am import to the menu, ie. `loadMenu(import('./ui/MainMenu.js'))`
    public async loadMenu(menu: Promise<typeof import('../ui/PauseMenu.js')>) {
        this._currentMenu = await menu.then((module) => {
            return module;
        }).then(module => new module.default(this));
    }

    // Pass in am import to the level, ie. `loadLevel(import('./levels/Level1.js'))`
    public async loadLevel(level: Promise<typeof import('../levels/Level1.js')>) {
        // Close any open menus
        this._currentMenu = undefined;

        // Store the level
        this.currentLevel = await level.then(module => module.default);;

        // Set player position to spawn point of level
        this.player.pos = new Vec2(this.currentLevel.spawnPoint.x * TILE_SIZE, this.currentLevel.spawnPoint.y * TILE_SIZE);

        // Setup/reset interpolated player position
        this.interpPosPlayer = new Vec2(this.player.pos.x, this.player.pos.y);

        // Unset their touch location
        this.touchPosition = undefined;

        // Wait for level to load
        await this.currentLevel.loaded;

        // Wait for player to load
        await this.player.loaded;

        // Wait for HUD to load
        await this.hud.loaded;

        // Wait for menus to load
        await this.pauseMenu.loaded;

        // Update the players level to be the current level
        switch (this.currentLevel?.constructor.name) {
            case 'Level1':
                this.player.userdata.level = 1;
                break;
            case 'Level2':
                this.player.userdata.level = 2;
                break;
            case 'Level3':
                this.player.userdata.level = 3;
                break;
            // TODO: Add more levels
        }
        if (this.player.userdata.level > this.player.userdata.lastLevel) {
            this.player.userdata.lastLevel = this.player.userdata.level;
        }

        // Save the player's data
        await this.player.userdata.save();
    }

    private async gpuTick() {
        /*
            Problem: when the canvas has a higher framerate than our tickrate, movement gets jittery. So even though
            gpuTick() is being called every frame, player position will only be updated every cpuTick().

            The solution is to perform interpolation between frames based off of the time between frames. This
            interpolated position is stored in interpPosPlayer. It produces small inaccuracies, but they remains
            accurate while moving, and resolve after second of stopping. You can view these inaccuracies with this:
                console.log(this.player.pos.sub(this.player.interpPos).magnitude()); 
        */

        // Calculate the frame time different between cpuTick() and gpuTick()
        this.prevMS = this.currMS;
        this.currMS = performance.now();
        const cpuCompensation = TICKRATE / (this.currMS - this.prevMS);

        // Clear the screen
        this.ctx.ui.clearRect(0, 0, this.size.x, this.size.y);
        this.ctx.foreground.clearRect(0, 0, this.size.x, this.size.y);
        this.ctx.midground.clearRect(0, 0, this.size.x, this.size.y);
        this.ctx.background.clearRect(0, 0, this.size.x, this.size.y);

        // Paint black
        this.ctx.background.fillStyle = '#000';
        this.ctx.background.textAlign = 'left';
        this.ctx.background.fillRect(0, 0, this.size.x, this.size.y);

        if (this.currentLevel) {
            // Get interpolated position, unless paused
            if (!this._currentMenu?.shouldPause) {
                this.interpPosPlayer = this.interpPosPlayer!.add(this.player.pos.sub(this.interpPosPlayer!).div(cpuCompensation));
            }

            // Determine the offset required to center the player on the screen
            const offset = this.screenCenter.sub(this.interpPosPlayer || 0);

            // Draw floor tiles
            for (let y = 0; y < this.currentLevel.map.length; y++) {
                for (let x = 0; x < this.currentLevel.map[y].length; x++) {
                    const tile = this.currentLevel.tileSet[this.currentLevel.map[y][x]];
                    if (tile) {
                        try {
                            const img = tile.draw();

                            // Draw floating junk underneath
                            this.ctx.background.drawImage(stalagmites, (x * TILE_SIZE) + offset.x, ((y + 1) * TILE_SIZE) + offset.y, TILE_SCALING * img.height, TILE_SCALING * img.width);

                            // Draw tile
                            (tile.layer === 'floor' ? this.ctx.background : this.ctx.foreground).drawImage(img, (x * TILE_SIZE) + offset.x, (y * TILE_SIZE) + offset.y, TILE_SCALING * img.width, TILE_SCALING * img.height);

                        } catch (e) { }
                    }
                }
            }

            // Tile entity debug colours
            this.ctx.ui.strokeStyle = '#00FF00';
            this.ctx.ui.fillStyle = '#00FF00';

            // Draw tile entities
            for (const tileEntity of this.currentLevel.tileEntities) {
                try {
                    // Translate tile position to screen position
                    const tileX = (tileEntity.pos.x * TILE_SIZE) + offset.x;
                    const tileY = (tileEntity.pos.y * TILE_SIZE) + offset.y;

                    // Draw the sprite
                    const img = tileEntity.draw();
                    this.ctx.midground.drawImage(img, tileX, tileY, TILE_SCALING * img.height, TILE_SCALING * img.width);
                    if (DEBUG) {
                        // Draw hitbox
                        this.ctx.ui.fillRect(tileX, tileY, TILE_SCALING, TILE_SCALING);
                        this.ctx.ui.strokeRect(tileX, tileY, TILE_SCALING * img.width, TILE_SCALING * img.height);

                        // Draw title
                        this.ctx.ui.fillText(tileEntity.constructor.name, tileX, tileY - 5);
                    }
                } catch (e) { }

            }

            // Entity debug colours
            this.ctx.ui.strokeStyle = '#0000FF';
            this.ctx.ui.fillStyle = '#0000FF';

            // Draw entities
            const scaling = TILE_SCALING / 2;
            for (const entity of this.currentLevel.entities) {
                const calcOffset = entity.pos.add(offset);
                try {
                    // Draw a drop shadow
                    if (entity.constructor.name !== "Poof" && entity.constructor.name !== "TouchIcon") {
                        this.ctx.midground.fillStyle = 'rgba(0, 0, 0, 0.5)';
                        this.ctx.midground.beginPath();
                        this.ctx.midground.arc(calcOffset.x + (entity.size.x * scaling), calcOffset.y + (entity.size.y * scaling) + 10, entity.size.y * (scaling / 2), 0, 2 * Math.PI);
                        this.ctx.midground.fill();
                    }

                    // Draw the sprite
                    const img = entity.draw();
                    this.ctx.midground.drawImage(img, calcOffset.x, calcOffset.y, TILE_SCALING * entity.size.x, TILE_SCALING * entity.size.y);
                    if (DEBUG) {
                        // Draw hitbox
                        this.ctx.ui.fillRect(calcOffset.x, calcOffset.y, TILE_SCALING, TILE_SCALING);
                        this.ctx.ui.strokeRect(calcOffset.x, calcOffset.y, TILE_SCALING * entity.size.x, TILE_SCALING * entity.size.y);

                        // Draw entity name
                        this.ctx.ui.fillText(entity.constructor.name, calcOffset.x, calcOffset.y - 5);
                    }

                    // Draw entity health if it's health is not full
                    if (entity.constructor.name !== "Player" && isCharacter(entity) && entity.userdata.health < entity.userdata.maxHealth) {
                        // Draw background
                        this.ctx.ui.fillStyle = '#2a0000';
                        this.ctx.ui.fillRect(calcOffset.x, calcOffset.y - 5, 60, 5);

                        // Draw health
                        this.ctx.ui.fillStyle = '#FF0000';
                        this.ctx.ui.fillRect(calcOffset.x, calcOffset.y - 5, (entity.userdata.health / entity.userdata.maxHealth) * 60, 5);

                        // Revert fill style here for performance
                        this.ctx.ui.strokeStyle = '#0000FF';
                        this.ctx.ui.fillStyle = '#0000FF';
                    }
                } catch (e) { }
            }

            // Draw a drop shadow for the player
            this.ctx.midground.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.midground.beginPath();
            this.ctx.midground.arc(this.screenCenter.x + (this.player.size.x * scaling), this.screenCenter.y + (this.player.size.y * scaling) + 20, this.player.size.y * (scaling / 2), 0, 2 * Math.PI);
            this.ctx.midground.fill();

            // Draw player
            const playerImg = this.player.draw();
            this.ctx.midground.drawImage(playerImg, this.screenCenter.x, this.screenCenter.y, TILE_SCALING * this.player.size.x, TILE_SCALING * this.player.size.y);
            if (DEBUG) {
                // Player debug colours
                this.ctx.ui.strokeStyle = '#FF0000';
                this.ctx.ui.fillStyle = '#FF0000';

                // Draw title
                this.ctx.ui.fillText(this.player.constructor.name, this.screenCenter.x, this.screenCenter.y - 5);

                // Draw hitbox
                this.ctx.ui.fillRect(this.screenCenter.x, this.screenCenter.y, TILE_SCALING, TILE_SCALING);
                this.ctx.ui.strokeRect(this.screenCenter.x, this.screenCenter.y, TILE_SCALING * this.player.size.x, TILE_SCALING * this.player.size.y);
            }

            // Draw HUD
            this.hud.draw(this.ctx.ui);
        }

        // Draw menu if there is one
        if (this._currentMenu) {
            this._currentMenu.draw(this.ctx.ui);
        }

        // Draw debug info in the top right corner
        if (DEBUG) {
            this.ctx.ui.fillStyle = '#fff';
            this.ctx.ui.font = '12px Arial';

            // FPS
            this.ctx.ui.fillText(`FPS: ${Math.round(1000 / (this.currMS - this.prevMS))}`, this.canvas.ui.width - 150, 15);

            // Level name
            this.ctx.ui.fillText(`Level: ${this.currentLevel?.constructor.name}`, this.canvas.ui.width - 150, 30);

            // Player position
            this.ctx.ui.fillText(`Player: ${this.player.pos.x}, ${this.player.pos.y}`, this.canvas.ui.width - 150, 45);
        }

        // Draw frame
        window.requestAnimationFrame(this.gpuTick.bind(this));
    }

    private async cpuTick() {
        // Check if the game is paused
        if (this._currentMenu?.shouldPause) { return; }

        // If the level is loaded, then paint it
        // TODO: menus and stuff
        if (this.currentLevel) {
            // Move player
            // TODO: add more movement options
            // Both functions return under different circumstances, but I've generally made it so that they'll return when we want to cancel touch movement.
            // This is to say when either any keyboard input, or touch input is finished.
            if (KeyboardController(this.player, this.currentLevel) || TouchController(this.player, this.touchPosition)) { this.touchPosition = undefined; };

            // Pathfinding stuff
            for (const entity of this.currentLevel.entities) {
                if (entity.pathfinding && entity.move) {
                    entity.move(entity.vel.sub(entity.pathfinding.update(this.currentLevel, this.player, entity as Character)));
                }
            }

            // Check if players is dead
            if (this.player.userdata.health <= 0) {
                this._currentMenu = new DeathMenu(this);
                setTimeout(() => {
                    this._currentMenu = undefined;

                    // Reset player
                    this.player.userdata.health = this.player.userdata.maxHealth;
                    this.player.userdata.level = 1;
                    this.player.userdata.save();

                    // Unload level
                    this.currentLevel = undefined;

                    // Load main menu
                    this._currentMenu = new MainMenu(this);
                }, 3000);
            }

            // Do logic on all entities, including player
            for (const entity of [this.player, ...this.currentLevel.entities]) {
                if (isCharacter(entity)) {
                    // See if they're dead
                    if (entity.userdata.health <= 0) {
                        // Add touch icon to the level
                        const poof = new Poof(entity.pos);
                        this.currentLevel?.entities.push(poof);

                        // Set to delete after a second
                        setTimeout(() => {
                            this.currentLevel?.entities.splice(this.currentLevel?.entities.indexOf(poof), 1);
                        }, 400);

                        // Remove from the level
                        this.currentLevel?.entities.splice(this.currentLevel?.entities.indexOf(entity), 1);

                        // If final boss, trigger win screen
                        if (entity.constructor.name === "BigZombie") {
                            this._currentMenu = new WinMenu(this);
                            setTimeout(() => {
                                this._currentMenu = undefined;

                                // Reset player
                                this.player.userdata.health = this.player.userdata.maxHealth;
                                this.player.userdata.level = 1;
                                this.player.userdata.save();

                                // Unload level
                                this.currentLevel = undefined;

                                // Load main menu
                                this._currentMenu = new MainMenu(this);
                            }, 3000);

                        }

                        // Add drops
                        for (let i = 0; i < Math.floor(Math.random() * 3); i++) {
                            const drop = new Heart(entity);
                            this.currentLevel?.entities.push(drop);
                        }
                    }
                } else if (isDrop(entity)) {
                    // See if the player is close enough to pick up the drop
                    const distance = entity.pos.add(entity.size.div(2)).sub(this.player.pos.add(this.player.size.div(2)));
                    if (Math.abs(distance.magnitude()) < 32) {
                        // Pick up the drop
                        entity.pickup(this.player);

                        // Remove from the level
                        this.currentLevel?.entities.splice(this.currentLevel?.entities.indexOf(entity), 1);
                    }
                }

                // Increase lifetime
                entity.lifetime++;

                // Set current position to previous position
                // I'd thinking this is pretty important to preserve visual accuracy, but I commented these out, and the game instantly got 100x smoother, so whatever.
                // entity.interpPos.y = entity.pos.y;
                // entity.interpPos.x = entity.pos.x;

                // If the entity has velocity, calculate its new position
                if (entity.vel.x || entity.vel.y) {

                    // Precalculate dimensions of the entity
                    const xDiff = entity.size.x * TILE_SCALING;
                    const yDiff = entity.size.y * TILE_SCALING;

                    // Get the position of each corner of the entity
                    const topLeftNew = entity.pos.add(entity.vel);
                    const topRightNew = entity.pos.add(entity.vel).add(new Vec2(xDiff, 0));
                    const bottomLeftNew = entity.pos.add(entity.vel).add(new Vec2(0, yDiff));
                    const bottomRightNew = entity.pos.add(entity.vel).add(new Vec2(xDiff, yDiff));
                    const topLeftOld = entity.pos;
                    const topRightOld = entity.pos.add(new Vec2(xDiff, 0));
                    const bottomRightOld = entity.pos.add(new Vec2(xDiff, yDiff));
                    const bottomLeftOld = entity.pos.add(new Vec2(0, yDiff));

                    let [moveX, moveY] = [true, true];
                    for (const [index, data] of [[topLeftNew, topLeftOld], [bottomRightNew, bottomRightOld], [topRightNew, topRightOld], [bottomLeftNew, bottomLeftOld]].entries()) {
                        const newPos = data[0];
                        const oldPos = data[1];

                        // See which tiles the entity would be on for the x & y axis separately
                        // We do this separately because we want the entity to slide along the wall, not stop. If we calcualted this
                        // in one go, there wouldn't be a way to tell which direction the entity is unable to move in.
                        const xTile = this.currentLevel.tileSet?.[this.currentLevel.map[Math.floor((oldPos.y / TILE_SIZE))]?.[Math.floor((newPos.x / TILE_SIZE))]];
                        const yTile = this.currentLevel.tileSet?.[this.currentLevel.map[Math.floor((newPos.y / TILE_SIZE))]?.[Math.floor((oldPos.x / TILE_SIZE))]];

                        // Check for each axis, check if:
                        // 1. The entity is colliding with a tile
                        // 2. The entity is colliding with the edge of the level

                        // X axis
                        if ((!xTile && !isProjectile(entity)) || xTile?.solid || newPos.x < 0 || newPos.x > (this.currentLevel.map[0].length * TILE_SIZE)) {
                            moveX = false;
                        }

                        // Y axis
                        if ((!yTile && !isProjectile(entity)) || yTile?.solid || newPos.y < 0 || newPos.y > (this.currentLevel.map.length * TILE_SIZE)) {
                            moveY = false;
                        }

                        // The !xTile and !yTile checks are to prevent the entity from walking on air. The isProjectile is some sneaky logic to allow projectiles to move through air.
                    }

                    // Check if they are colliding with any tile entities
                    for (const tile of this.currentLevel.tileEntities) {
                        if (tile.pos.x * TILE_SIZE < entity.pos.x + entity.size.x * TILE_SCALING && tile.pos.x * TILE_SIZE + TILE_SIZE > entity.pos.x && tile.pos.y * TILE_SIZE < entity.pos.y + entity.size.y * TILE_SCALING && tile.pos.y * TILE_SIZE + TILE_SIZE > entity.pos.y) {
                            // Collide with the tile
                            tile.onCollide && tile.onCollide(entity);
                        }
                    }

                    /*
                        This part applies the movement to the entity. if moveX/moveY is true, we'll move the entity.
                        If it's false, we'll cancel out the movement, but we also want to move the entity to the edge
                        of the tile.
        
                        (Math.floor(topLeftNew.x / TILE_SIZE) * TILE_SIZE)
                        ^ This part moves the entity to the edge of the tile it's colliding with.
                        
                        (entity.vel.x > 0 ? (TILE_SIZE - xDiff - 1) : TILE_SIZE)
                        ^ This part adds/subtracts the entity's width, depending on if the entity is colliding with the
                        left or right side of the tile. Same applies to the Y axis.
                    */

                    // If it's a projectile, remove it if it's out of bounds or if it's colliding with a solid tile
                    if (isProjectile(entity)) {
                        if (!moveX || !moveY) {
                            this.currentLevel?.entities.splice(this.currentLevel?.entities.indexOf(entity), 1);
                            continue;
                        }
                    }

                    if (moveX) {
                        entity.pos.x = Math.trunc(topLeftNew.x * POSITION_ACCURACY) / POSITION_ACCURACY;
                    } else {
                        entity.pos.x = (Math.floor(topLeftNew.x / TILE_SIZE) * TILE_SIZE) + (entity.vel.x > 0 ? (TILE_SIZE - xDiff - 1) : TILE_SIZE);
                        entity.vel.x = 0;
                    }
                    if (moveY) {
                        entity.pos.y = Math.trunc(topLeftNew.y * POSITION_ACCURACY) / POSITION_ACCURACY;
                    } else {
                        entity.pos.y = (Math.floor(topLeftNew.y / TILE_SIZE) * TILE_SIZE) + (entity.vel.y > 0 ? (TILE_SIZE - yDiff - 1) : TILE_SIZE);
                        entity.vel.y = 0;
                    }

                    if (isProjectile(entity)) {
                        continue;
                    }


                    // Apply friction
                    entity.vel.x = Math.trunc(entity.vel.x * FRICTION * VELOCITY_ACCURACY) / VELOCITY_ACCURACY;
                    entity.vel.y = Math.trunc(entity.vel.y * FRICTION * VELOCITY_ACCURACY) / VELOCITY_ACCURACY;
                }
            }
        }
    }
}