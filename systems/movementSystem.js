import {addComponent, defineQuery, defineSystem, exitQuery, removeComponent} from "../bitecs.mjs";
import GridMovementComponent, {GRID_DIRECTIONS} from "../components/GridMovementComponent.js";
import PositionComponent from "../components/PositionComponent.js";
import ActiveMovementComponent from "../components/ActiveMovementComponent.js";
import CollisionComponent from "../components/CollisionComponent.js";


const DIRECTION_VECTORS = {
    [GRID_DIRECTIONS.UP]: {x: 0, y: -1},
    [GRID_DIRECTIONS.DOWN]: {x: 0, y: 1},
    [GRID_DIRECTIONS.LEFT]: {x: -1, y: 0},
    [GRID_DIRECTIONS.RIGHT]: {x: 1, y: 0},
    [GRID_DIRECTIONS.UP | GRID_DIRECTIONS.LEFT]: {x: -1, y: -1},
    [GRID_DIRECTIONS.UP | GRID_DIRECTIONS.RIGHT]: {x: 1, y: -1},
    [GRID_DIRECTIONS.DOWN | GRID_DIRECTIONS.LEFT]: {x: -1, y: 1},
    [GRID_DIRECTIONS.DOWN | GRID_DIRECTIONS.RIGHT]: {x: 1, y: 1},
}


/**
 * @typedef {function(World): void} MovementInitSystem
 */

/**
 * Creates the movement system
 * The movement system will update the position of all entities with a velocity component
 * @param {Phaser.Scene} scene The scene
 * @param {number} gridSize The size of the grid
 * @returns {MovementInitSystem}
 */
export function createMovementInitSystem(scene, gridSize) {
    const movementQuery = defineQuery([GridMovementComponent, PositionComponent]);

    // We declare it here to avoid creating garbage
    const dirVec = new Phaser.Math.Vector2();

    return defineSystem((world) => {
        const entities = movementQuery(world);

        for (let i = 0; i < entities.length; ++i) {
            const eid = entities[i];

            const direction = GridMovementComponent.direction[eid];


            if (!direction) continue;

            const currentX = PositionComponent.x[eid];
            const currentY = PositionComponent.y[eid];
            const speed = GridMovementComponent.movementSpeed[eid];

            const {x, y} = DIRECTION_VECTORS[direction];
            dirVec.set(x, y).normalize();

            addComponent(world, ActiveMovementComponent, eid);
            ActiveMovementComponent.startX[eid] = currentX;
            ActiveMovementComponent.startY[eid] = currentY;
            ActiveMovementComponent.targetX[eid] = currentX + dirVec.x * gridSize;
            ActiveMovementComponent.targetY[eid] = currentY + dirVec.y * gridSize;
            ActiveMovementComponent.progress[eid] = 0;
            ActiveMovementComponent.speed[eid] = speed;
            ActiveMovementComponent.direction[eid] = direction;

            // Remove grid movement component while active movement processes
            removeComponent(world, GridMovementComponent, eid);
        }

        return world;
    })

}

export default createMovementInitSystem;