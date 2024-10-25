import {addComponent, defineQuery, defineSystem, removeComponent} from "../bitecs.mjs";
import GridPathMovementComponent from "../components/GridPathMovementComponent.js";
import PositionComponent from "../components/PositionComponent.js";
import GridNavigatorComponent from "../components/GridNavigatorComponent.js";
import CollisionComponent from "../components/CollisionComponent.js";

/**
 * @typedef {function(World, number): void} GridPathingSystem
 */


/**
 * Creates the active movement system
 * @param options - These are the options for the active movement system. E.g. easing function
 * @return {GridPathingSystem}
 */
export function createGridPathingSystem(options = {}) {
    const activeMovementQuery = defineQuery([GridPathMovementComponent, PositionComponent, CollisionComponent]);
    const {
        easing = (t) => t,
    } = options;

    function lerp(start, end, t) {
        return start + (end - start) *  easing(Math.min(Math.max(t, 0), 1));
    }

    return defineSystem((world, dt) => {
        const deltaSec = dt / 1000;
        const entities = activeMovementQuery(world);

        for (let i = 0; i < entities.length; ++i) {
            const eid  = entities[i];
            // Check for collision
            const collision = CollisionComponent.isColliding[eid];


            if (collision) {

                // Reset the position to the starting position
                PositionComponent.x[eid] = GridPathMovementComponent.startX[eid];
                PositionComponent.y[eid] = GridPathMovementComponent.startY[eid];

                // Restore grid movement component
                addComponent(world, GridNavigatorComponent, eid);
                GridNavigatorComponent.movementSpeed[eid] = GridPathMovementComponent.speed[eid];

                // Reset the collision flag
                CollisionComponent.isColliding[eid] = 0;

                // Remove active movement last to preserve starting positions
                removeComponent(world, GridPathMovementComponent, eid);

                return world;

            }

            const speed = GridPathMovementComponent.speed[eid];

            GridPathMovementComponent.progress[eid] += speed * deltaSec;

            if (GridPathMovementComponent.progress[eid] < 1) {
                PositionComponent.x[eid] = lerp(
                    GridPathMovementComponent.startX[eid],
                    GridPathMovementComponent.targetX[eid],
                    GridPathMovementComponent.progress[eid]
                )
                PositionComponent.y[eid] = lerp(
                    GridPathMovementComponent.startY[eid],
                    GridPathMovementComponent.targetY[eid],
                    GridPathMovementComponent.progress[eid]
                )
            } else {
                // Movement complete
                PositionComponent.x[eid] = GridPathMovementComponent.targetX[eid];
                PositionComponent.y[eid] = GridPathMovementComponent.targetY[eid];

                // Restore grid movement component
                addComponent(world, GridNavigatorComponent, eid);
                GridNavigatorComponent.movementSpeed[eid] = GridPathMovementComponent.speed[eid];

                // Remove active movement
                removeComponent(world, GridPathMovementComponent, eid);
            }
        }
        return world;
    })
}

export default createGridPathingSystem;