import {createWorld} from "../bitecs.mjs";
import PlayerFactory from "../entities/PlayerFactory.js";
import createGridNavigationSystem from "../systems/movementSystem.js";
import createSpriteSystem from "../systems/spriteSystem.js";
import createPlayerInputSystem from "../systems/playerInputSystem.js";
import createGridPathingSystem from "../systems/activeMovementSystem.js";
import createCollisionSystem from "../systems/collisionSystem.js";
import BoxFactory from "../entities/BoxFactory.js";
import createCollisionRenderSystem from "../systems/collisionRenderSystem.js";

export class GameScene extends Phaser.Scene {
    /** @private {World} */
    #world;
    /** @private {PlayerFactory} */
    #playerFactory;
    /** @private {number} The player entity id*/
    #player
    /** @private {SpriteSystem} */
    #spriteSystem
    /** @private {GridNavigationSystem} */
    #gridNavigationSystem
    /** @private {PlayerInputSystem} */
    #playerInputSystem
    /** @private {GridPathingSystem} */
    #gridPathingSystem
    /** @private {CollisionSystem} */
    #collisionSystem
    /** @private {BoxFactory} */
    #boxFactory;
    #debugCollisionRendererSystem;


    // Apparently Phaser is missing this type definition
    /**
     * @interface Phaser.Types.Input.Keyboard.CursorKeys
     * @property {Phaser.Input.Keyboard.Key} up - The key object for the Up arrow key.
     * @property {Phaser.Input.Keyboard.Key} down - The key object for the Down arrow key.
     * @property {Phaser.Input.Keyboard.Key} left - The key object for the Left arrow key.
     * @property {Phaser.Input.Keyboard.Key} right - The key object for the Right arrow key.
     * @property {Phaser.Input.Keyboard.Key} space - The key object for the Space Bar key.
     * @property {Phaser.Input.Keyboard.Key} shift - The key object for the Shift key.
     */

    /** @type {Phaser.Types.Input.Keyboard.CursorKeys}*/
    #cursors

    constructor() {
        super({
            key: "Game"
        });
    }

    init(data) {
        this.#cursors = this.input.keyboard.createCursorKeys();
        this.name = data.name;
        this.number = data.number || 0;
    }

    preload() {
        this.load.setPath("../assets");
        this.loadImages();
    }


    create(_) {
        this.#world = createWorld();
        this.#playerFactory = new PlayerFactory(this.#world);
        this.#boxFactory = new BoxFactory(this.#world)
        this.#boxFactory.create(160, 32);
        // TODO: Positions should be a part of the map data.
        this.#player = this.#playerFactory.create(32, 32, 1);
        this.#gridNavigationSystem = createGridNavigationSystem(this, 64);
        this.#spriteSystem = createSpriteSystem(this, ["heart"]);
        this.#playerInputSystem = createPlayerInputSystem(this.#cursors, this.#player);
        this.#gridPathingSystem = createGridPathingSystem()
        this.#collisionSystem = createCollisionSystem();
        this.#debugCollisionRendererSystem = createCollisionRenderSystem(this);
    }

    update(time, delta) {
        this.#playerInputSystem(this.#world);
        this.#collisionSystem(this.#world);
        this.#gridNavigationSystem(this.#world);
        this.#gridPathingSystem(this.#world, delta);
        this.#spriteSystem(this.#world);
        this.#debugCollisionRendererSystem(this.#world)
    }

    loadImages() {
        this.load.image("heart", "ui/heart.png");
    }
}