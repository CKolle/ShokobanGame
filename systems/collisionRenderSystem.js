import {defineQuery, defineSystem} from "../bitecs.mjs";
import CollisionComponent from "../components/CollisionComponent.js";
import PositionComponent from "../components/PositionComponent.js";

const COLORS = {
    DEFAULT: 0x00ff00, // This is green btw
    COLLIDING: 0xff0000, // This is red
}

/**
 * @typedef {function(World): void} CollisionRenderSystem
 */

/**
 * Creates a box around all entities with a collision component. Used for debugging
 *
 * @param {Phaser.Scene} scene - The Phaser scene to which the collision render system will be added.
 * @return {CollisionRenderSystem} A function that processes the collision render system for the given world.
 */
export function createCollisionRenderSystem(scene) {
    const collisionQuery = defineQuery([CollisionComponent, PositionComponent]);

    // See https://docs.phaser.io/api-documentation/class/gameobjects-graphics
    const graphics = scene.add.graphics({
        lineStyle: {
            width: 2,
            color: COLORS.DEFAULT,
            alpha: 1
        }
    });
    // Ensure it is always rendered on top
    graphics.setDepth(1000);

    const graphicsNormals = scene.add.graphics({
        lineStyle: {
            width: 10,
            color: 0x0000ff,
            alpha: 1
        }
    });
    graphicsNormals.setDepth(1000);


    return defineSystem((world) => {
        const entities = collisionQuery(world);

        graphics.clear();
        graphicsNormals.clear();


        for (let i = 0; i < entities.length; ++i) {
            const eid = entities[i];
            const posX = PositionComponent.x[eid];
            const posY = PositionComponent.y[eid];
            const vertexX = CollisionComponent.verticesX[eid];
            const vertexY = CollisionComponent.verticesY[eid];
            const normalX = CollisionComponent.lastCollisionNormalX[eid];
            const normalY = CollisionComponent.lastCollisionNormalY[eid];
            const isColliding = CollisionComponent.isColliding[eid];

            if (vertexX && vertexY && vertexX.length > 0) {
                const color = isColliding ? COLORS.COLLIDING : COLORS.DEFAULT;
                graphics.lineStyle(2, color, 1);

                const points = [];
                for (let j = 0; j < vertexX.length; j++) {
                    points.push({
                        x: posX + vertexX[j],
                        y: posY + vertexY[j]
                    });
                }

                graphics.beginPath();
                graphics.moveTo(points[0].x, points[0].y);

                for (let j = 1; j < points.length; j++) {
                    graphics.lineTo(points[j].x, points[j].y);
                }

                graphics.lineTo(points[0].x, points[0].y);
                graphics.strokePath();


                graphics.lineTo(points[0].x, points[0].y);
                graphics.strokePath();

                graphicsNormals.lineStyle(10, 0x0000ff, 1);
                graphicsNormals.beginPath();
                graphicsNormals.moveTo(posX, posY);
                graphicsNormals.lineTo(posX + normalX * 30, posY + normalY * 30);
                graphicsNormals.strokePath();
                graphicsNormals.closePath();

            }
        }

        return world;
    })

}

export default createCollisionRenderSystem;