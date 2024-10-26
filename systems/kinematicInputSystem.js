import {defineSystem} from "../bitecs.mjs";
import {GRID_DIRECTIONS} from "../components/GridNavigatorComponent.js";
import {KinematicBodyComponent} from "../components/KinematicBodyComponent.js";

/**
 * Creates the player input system.
 * @param {Phaser.Types.Input.Keyboard.CursorKeys} cursors The cursor keys
 * @param {number} playerEntity The player entity id
 * @returns {PlayerGridInputSystem}
 */
export function createKinematicInputSystem(cursors, playerEntity) {
    const baseMovementSpeed = 0.2

    return defineSystem((world) => {

        let inputVector = new Phaser.Math.Vector2(0, 0);

        if (cursors.left.isDown) {
            inputVector.x -= 1;
        }
        if (cursors.right.isDown) {
            inputVector.x += 1;
        }
        if (cursors.up.isDown) {
            inputVector.y -= 1;
        }
        if (cursors.down.isDown) {
            inputVector.y += 1;
        }

        if (inputVector.x !== 0 || inputVector.y !==0) {
            inputVector = inputVector.normalize().scale(baseMovementSpeed);

            KinematicBodyComponent.velocityX[playerEntity] = inputVector.x;
            KinematicBodyComponent.velocityY[playerEntity] = inputVector.y;
        }

        return world;

    })

}

export default createKinematicInputSystem;