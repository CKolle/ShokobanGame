import {addComponent, defineQuery, defineSystem, removeComponent} from "../bitecs.mjs";
import ActiveMovementComponent from "../components/ActiveMovementComponent.js";
import PositionComponent from "../components/PositionComponent.js";
import GridMovementComponent from "../components/GridMovementComponent.js";
import CollisionComponent from "../components/CollisionComponent.js";

/**
 * @typedef {function(World, number): void} ActiveMovementSystem
 */


/**
 * Creates the active movement system
 * @param options - These are the options for the active movement system. E.g. easing function
 * @return {ActiveMovementSystem}
 */
export function createActiveMovementSystem(options = {}) {
    const activeMovementQuery = defineQuery([ActiveMovementComponent, PositionComponent, CollisionComponent]);
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
                PositionComponent.x[eid] = ActiveMovementComponent.startX[eid];
                PositionComponent.y[eid] = ActiveMovementComponent.startY[eid];

                // Restore grid movement component
                addComponent(world, GridMovementComponent, eid);
                GridMovementComponent.movementSpeed[eid] = ActiveMovementComponent.speed[eid];

                // Reset the collision flag
                CollisionComponent.isColliding[eid] = 0;

                // Remove active movement last to preserve starting positions
                removeComponent(world, ActiveMovementComponent, eid);

                return world;

            }

            const speed = ActiveMovementComponent.speed[eid];

            ActiveMovementComponent.progress[eid] += speed * deltaSec;

            if (ActiveMovementComponent.progress[eid] < 1) {
                PositionComponent.x[eid] = lerp(
                    ActiveMovementComponent.startX[eid],
                    ActiveMovementComponent.targetX[eid],
                    ActiveMovementComponent.progress[eid]
                )
                PositionComponent.y[eid] = lerp(
                    ActiveMovementComponent.startY[eid],
                    ActiveMovementComponent.targetY[eid],
                    ActiveMovementComponent.progress[eid]
                )
            } else {
                // Movement complete
                PositionComponent.x[eid] = ActiveMovementComponent.targetX[eid];
                PositionComponent.y[eid] = ActiveMovementComponent.targetY[eid];

                // Restore grid movement component
                addComponent(world, GridMovementComponent, eid);
                GridMovementComponent.movementSpeed[eid] = ActiveMovementComponent.speed[eid];

                // Remove active movement
                removeComponent(world, ActiveMovementComponent, eid);
            }
        }
        return world;
    })
}

export default createActiveMovementSystem;