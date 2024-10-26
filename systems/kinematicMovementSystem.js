import {defineQuery, defineSystem} from "../bitecs.mjs";
import KinematicBodyComponent from "../components/KinematicBodyComponent.js";
import PositionComponent from "../components/PositionComponent.js";

export function createKinematicMovementSystem() {
    const kinematicQuery = defineQuery([KinematicBodyComponent, PositionComponent])

    return defineSystem((world, dt) => {
        const entities = kinematicQuery(world);
        for (let i = 0; i < entities.length; ++i) {
            const eid = entities[i];
            PositionComponent.x[eid] += KinematicBodyComponent.velocityX[eid] * dt;
            PositionComponent.y[eid] += KinematicBodyComponent.velocityY[eid] * dt;

            const maxSpeed = KinematicBodyComponent.maxSpeed[eid];
            if (maxSpeed > 0) {
                // Would be the magnitute of the velocity vector
                const currentSpeed = Math.sqrt(
                    KinematicBodyComponent.velocityX[eid] ** 2 +
                    KinematicBodyComponent.velocityY[eid] ** 2
                );

                if (currentSpeed > maxSpeed) {
                    // I will just divide it by the currentSpeed for now
                    const scale = maxSpeed / currentSpeed;
                    KinematicBodyComponent.velocityX[eid] *= scale;
                    KinematicBodyComponent.velocityY[eid] *= scale;
                }
            }
        }

        return world
    })
}

export default createKinematicMovementSystem;