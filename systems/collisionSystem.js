import {defineQuery, defineSystem} from "../bitecs.mjs";
import CollisionComponent from "../components/CollisionComponent.js";
import PositionComponent from "../components/PositionComponent.js";

/** @type {Phaser.Math.Vector2} */
const Vector2 = Phaser.Math.Vector2;
// We will use Gilbert Johnson Keerthi's algorithm to detect collisions between two rectangles
// This gives us flexibility to add more complex shapes in the future
// Note we can't use this alone for concave shapes. We will need to break them down into convex shapes
// https://en.wikipedia.org/wiki/Gilbert%E2%80%93Johnson%E2%80%93Keerthi_distance_algorithm

/**
 * Computes the support point in a given direction for the Minkowski difference of two shapes.
 *
 * @param {Phaser.Math.Vector2[]} vertices1 - An array of vertices representing the first shape.
 * @param {number} count1 - The number of vertices in the first shape.
 * @param {Phaser.Math.Vector2[]} vertices2 - An array of vertices representing the second shape.
 * @param {number} count2 - The number of vertices in the second shape.
 * @param {Phaser.Math.Vector2} direction - The direction in which to find the support point.
 * @return {Phaser.Math.Vector2} The support point in the given direction.
 */
function support(vertices1, count1, vertices2, count2, direction) {
    const p1 = furthestVertex(vertices1, count1, direction);
    const p2 = furthestVertex(vertices2, count2, direction.clone().negate());

    // The Minkowski difference
    return p1.clone().subtract(p2);
}

/**
 * Finds the index of the vertex that is furthest in the given direction.
 *
 * @param {Phaser.Math.Vector2[]} vertices - An array of vertices.
 * @param {number} count - The number of vertices in the array.
 * @param {Phaser.Math.Vector2} direction - The direction in which to find the furthest vertex.
 * @return {Vector2} The index of the vertex that is furthest in the given direction.
 */
function furthestVertex(vertices, count, direction) {
    let maxProduct = vertices[0].dot(direction);
    let index = 0;

    for (let i = 1; i < count; i++) {
        const product = vertices[i].dot(direction);
        if (product > maxProduct) {
            maxProduct = product;
            index = i;
        }
    }

    return vertices[index];
}
/**
 * The result object containing collision status and normal vector.
 *
 * @typedef {Object} CollisionResult
 * @property {boolean} isColliding - Whether the shapes are colliding.
 * @property {number} normalX - The x component of the collision normal.
 * @property {number} normalY - The y component of the collision normal.
 */


/**
 * Performs the Gilbert-Johnson-Keerthi (GJK) collision detection algorithm to determine if two shapes intersect.
 *
 * @param {Phaser.Math.Vector2[]} verticesA - An array of vertices representing the first shape.
 * @param {number} countA - The number of vertices in the first shape.
 * @param {Phaser.Math.Vector2[]} verticesB - An array of vertices representing the second shape.
 * @param {number} countB - The number of vertices in the second shape.
 * @return {CollisionResult} The result of the collision detection.
 */
export function gjkCollision(verticesA, countA, verticesB, countB) {
    /** @type {Phaser.Math.Vector2[]} */
    const simplex = [];

    const result = {
        isColliding: false,
        normalX: 0,
        normalY: 0,
    }

    const centerA = getCenterOfShape(verticesA, countA);
    const centerB = getCenterOfShape(verticesB, countB);
    const direction = centerA.clone().subtract(centerB);

    if (direction.x === 0 && direction.y === 0)
    {
        direction.x = 1;
    }

    const firstSupport = support(verticesA, countA, verticesB, countB, direction);
    simplex.push(firstSupport.clone());

    direction.x = -firstSupport.x;
    direction.y = -firstSupport.y;

    direction.normalize();

    const MAX_ITERATIONS = 100;
    for (let i = 0; i < MAX_ITERATIONS; i++) {
        const a = support(verticesA, countA, verticesB, countB, direction);
        simplex.push(a);

        if (a.dot(direction) <= 0) {
            result.isColliding = false;
            return result
        }

        if (containsOrigin(simplex, direction)) {
            result.isColliding = true;
            const normal = epaCollision(simplex, verticesA, countA, verticesB, countB);
            result.normalX = normal.x;
            result.normalY = normal.y;

            return result;
        }
    }
    return result;
}

function containsOrigin(simplex, direction) {
    const a = simplex[simplex.length - 1];
    const ao = a.clone().negate();
    if (simplex.length === 3) {
        const b = simplex[1];
        const c = simplex[0];

        const ab = b.clone().subtract(a);
        const ac = c.clone().subtract(a);

        const abPerp = tripleProduct(ac, ab, ab);
        const acPerp = tripleProduct(ab, ac, ac);

        if (abPerp.dot(ao) > 0) {
            simplex.splice(0, 1);
            direction.x = abPerp.x;
            direction.y = abPerp.y;
        } else {
            if (acPerp.dot(ao) > 0) {
                simplex.splice(1, 1);
                direction.x = acPerp.x;
                direction.y = acPerp.y;
            } else {
                return true;
            }
        }
    } else {
        // Then the simplex is a line
        const b = simplex[0];
        const ab = b.clone().subtract(a);
        const abPerp = tripleProduct(ab, ao, ab);
        direction.x = abPerp.x;
        direction.y = abPerp.y;
    }

    return false;
}

function tripleProduct(a, b, c) {
    const ac = a.dot(c);
    const bc = b.dot(c);

    return new Vector2(
        b.x * ac - a.x * bc,
        b.y * ac - a.y * bc
    );
}



/**
 * Performs the EPA (Expanding Polytope Algorithm) collision detection.
 *
 * @param {Phaser.Math.Vector2[]} polytope - The vertices of the polytope.
 * @param {Phaser.Math.Vector2[]} verticesA - The vertices of shape A.
 * @param {number} countA - The number of vertices in shape A.
 * @param {Phaser.Math.Vector2[]} verticesB - The vertices of shape B.
 * @param {number} countB - The number of vertices in shape B.
 * @returns {Phaser.Math.Vector2} - The minimum translation vector for collision resolution.
 */
function epaCollision(polytope, verticesA, countA, verticesB, countB) {
    let minIndex = 0;
    let minDistance = Infinity;
    let minNormal;

    let iterations = 0;

    while (minDistance === Infinity) {
        iterations++;

        for (let i = 0; i < polytope.length; i++) {
            const j = (i + 1) % polytope.length;

            const vertexI = polytope[i].clone();
            const vertexJ = polytope[j].clone();

            const edgeIJ = vertexJ.subtract(vertexI);
            /** @type {Phaser.Math.Vector2} */
            const normal = new Vector2(edgeIJ.y, -edgeIJ.x).normalize();
            let distance = normal.dot(vertexI);

            if (distance < 0) {
                distance *= -1;
                normal.negate();
            }
            if (distance < minDistance) {
                minDistance = distance;
                minNormal = normal;
                minIndex = j;
            }
        }

        let sup = support(verticesA, countA, verticesB, countB, minNormal);
        let supDistance = minNormal.dot(sup);

        if (Math.abs(supDistance - minDistance) > 0.001) {
            minDistance = Infinity;
            polytope.splice(minIndex, 0, sup);
        }
    }

    return minNormal.scale(minDistance + 0.001).normalize();
}

function getVerticesWorldSpace(posX, posY, vertexX, vertexY, vertexCount) {
    const worldVertices = [];

    for (let i = 0; i < vertexCount; ++i) {
        const vertex = new Vector2(vertexX[i] + posX, vertexY[i] + posY);
        worldVertices.push(vertex);
    }

    return worldVertices;
}

function getCenterOfShape(vertices, count) {
    const center = new Vector2(0, 0);
    for (let i = 0; i < count; i++) {
        center.add(vertices[i]);
    }
    return center.scale(1 / count);
}

/**
 * @typedef {function(World): void} CollisionSystem
 */

// TODO Create a way to handle collisions between concave shapes by turning them into multiple convex shapes
// TODO Handle collisions for spheres should be fairly simple to implement
/**
 * Creates a collision detection system for the given scene.
 *
 * @return {CollisionSystem} The collision system function that processes the world and detects collisions.
 */
export function createCollisionSystem() {
    const collisionQuery = defineQuery([CollisionComponent, PositionComponent]);


    return defineSystem((world) => {
        const entities = collisionQuery(world);

        // We don't need partitioning for our small game. So we just loop through it all 🙃
        for (let i = 0; i < entities.length; ++i) {
            const eidA = entities[i];
            const posAx = PositionComponent.x[eidA];
            const posAy = PositionComponent.y[eidA];
            const verticesAX = CollisionComponent.verticesX[eidA];
            const verticesAY = CollisionComponent.verticesY[eidA];
            const vertexCount = CollisionComponent.vertexCount[eidA];
            const verticesA = getVerticesWorldSpace(posAx, posAy, verticesAX, verticesAY, vertexCount);

            for (let j = i + 1; j < entities.length; j++) {
                const eidB = entities[j];
                const posBx = PositionComponent.x[eidB];
                const posBy = PositionComponent.y[eidB];
                const verticesBX = CollisionComponent.verticesX[eidB];
                const verticesBY = CollisionComponent.verticesY[eidB];
                const vertexCountB = CollisionComponent.vertexCount[eidB];
                const verticesB = getVerticesWorldSpace(posBx, posBy, verticesBX, verticesBY, vertexCountB);


                const result = gjkCollision(verticesA, vertexCount, verticesB, vertexCountB);
                CollisionComponent.isColliding[eidA] = result.isColliding ? 1 : 0;
                CollisionComponent.isColliding[eidB] = result.isColliding ? 1 : 0;

                if (result.isColliding) {
                    CollisionComponent.lastCollisionNormalX[eidA] = -result.normalX;
                    CollisionComponent.lastCollisionNormalY[eidA] = -result.normalY;

                    CollisionComponent.lastCollisionNormalX[eidB] = result.normalX;
                    CollisionComponent.lastCollisionNormalY[eidB] = result.normalY;
                    console.log(`Entity ${eidA} collided with ${eidB} with normal: ${result.normalX}, ${result.normalY}`);

                }
            }
        }

        return world
    })
}

export default createCollisionSystem;