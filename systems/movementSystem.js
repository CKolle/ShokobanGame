import {addComponent, defineQuery, defineSystem, exitQuery, removeComponent} from "../bitecs.mjs";
import GridNavigatorComponent, {GRID_DIRECTIONS} from "../components/GridNavigatorComponent.js";
import PositionComponent from "../components/PositionComponent.js";
import GridPathMovementComponent from "../components/GridPathMovementComponent.js";
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
 * @typedef {function(World): void} GridNavigationSystem
 */

/**
 * Creates the movement system
 * The movement system will update the position of all entities with a velocity component
 * @param {Phaser.Scene} scene The scene
 * @param {number} gridSize The size of the grid
 * @returns {GridNavigationSystem}
 */
export function createGridNavigationSystem(scene, gridSize) {
    const movementQuery = defineQuery([GridNavigatorComponent, PositionComponent]);

    // We declare it here to avoid creating garbage
    const dirVec = new Phaser.Math.Vector2();

    return defineSystem((world) => {
        const entities = movementQuery(world);

        for (let i = 0; i < entities.length; ++i) {
            const eid = entities[i];

            const direction = GridNavigatorComponent.direction[eid];


            if (!direction) continue;

            const currentX = PositionComponent.x[eid];
            const currentY = PositionComponent.y[eid];
            const speed = GridNavigatorComponent.movementSpeed[eid];

            const {x, y} = DIRECTION_VECTORS[direction];
            dirVec.set(x, y).normalize();

            addComponent(world, GridPathMovementComponent, eid);
            GridPathMovementComponent.startX[eid] = currentX;
            GridPathMovementComponent.startY[eid] = currentY;
            GridPathMovementComponent.targetX[eid] = currentX + dirVec.x * gridSize;
            GridPathMovementComponent.targetY[eid] = currentY + dirVec.y * gridSize;
            GridPathMovementComponent.progress[eid] = 0;
            GridPathMovementComponent.speed[eid] = speed;
            GridPathMovementComponent.direction[eid] = direction;

            // Remove grid movement component while active movement processes
            removeComponent(world, GridNavigatorComponent, eid);
        }

        return world;
    })

}

export default createGridNavigationSystem;