import { defineQuery, defineSystem } from "../bitecs.mjs";
import CollisionComponent from "../components/CollisionComponent.js";
import { KinematicBodyComponent } from "../components/KinematicBodyComponent.js";

export function createCollisionResponseSystem() {
    const collisionQuery = defineQuery([CollisionComponent, KinematicBodyComponent]);

    return defineSystem((world) => {
        const entities = collisionQuery(world);

        for (let i = 0; i < entities.length; ++i) {
            const eid = entities[i];
            if (CollisionComponent.isColliding[eid]) {
                const normalX = CollisionComponent.lastCollisionNormalX[eid];
                const normalY = CollisionComponent.lastCollisionNormalY[eid];

                const velocityX = KinematicBodyComponent.velocityX[eid];
                const velocityY = KinematicBodyComponent.velocityY[eid];

                const dot = velocityX * normalX + velocityY * normalY;

                if (dot < 0) {
                    // We can do R =D −2∗(D ⋅N )∗N to get the reflection vector
                    // This is known as the reflection formula
                    const reflectX = velocityX - 2 * dot * normalX;
                    const reflectY = velocityY - 2 * dot * normalY;

                    const restitution = CollisionComponent.restitution[eid];

                    KinematicBodyComponent.velocityX[eid] = reflectX * restitution;
                    KinematicBodyComponent.velocityY[eid] = reflectY * restitution;
                }
            }
        }

        return world;
    });
}

export default createCollisionResponseSystem;
