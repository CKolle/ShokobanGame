import {defineSystem, hasComponent} from "../bitecs.mjs";
import GridNavigatorComponent, {GRID_DIRECTIONS} from "../components/GridNavigatorComponent.js";

/**
 * @typedef {function(World): void} PlayerInputSystem
 */

/**
 * Creates the player input system.
 * @param {Phaser.Types.Input.Keyboard.CursorKeys} cursors The cursor keys
 * @param {number} player The player entity id
 * @returns {PlayerInputSystem}
 */
export function createPlayerInputSystem(cursors, player) {
    // We pass in the player entity id to avoid having to query for it


    return defineSystem((world) => {
        // Check if the player has the GridMovementComponent gets removed during an active movement

        if (!hasComponent(world, GridNavigatorComponent, player)) {
            return world;
        }

        const inputMappings = [
            { isDown: cursors.left.isDown, direction: GRID_DIRECTIONS.LEFT },
            { isDown: cursors.right.isDown, direction: GRID_DIRECTIONS.RIGHT },
            { isDown: cursors.up.isDown, direction: GRID_DIRECTIONS.UP },
            { isDown: cursors.down.isDown, direction: GRID_DIRECTIONS.DOWN }
        ];

        const activeInput = inputMappings.find(input => input.isDown);

        GridNavigatorComponent.direction[player] = activeInput ? activeInput.direction : GRID_DIRECTIONS.NONE;

        return world;
    });
}

export default createPlayerInputSystem