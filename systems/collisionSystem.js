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
    const i = furthestVertex(vertices1, count1, direction);

    const negDirection = direction.clone().negate();
    const j = furthestVertex(vertices2, count2, negDirection);

    // The Minkowski difference
    return vertices1[i].clone().subtract(vertices2[j]);
}

/**
 * Finds the index of the vertex that is furthest in the given direction.
 *
 * @param {Phaser.Math.Vector2[]} vertices - An array of vertices.
 * @param {number} count - The number of vertices in the array.
 * @param {Phaser.Math.Vector2} direction - The direction in which to find the furthest vertex.
 * @return {number} The index of the furthest vertex in the given direction.
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

    return index;
}

/**
 * Performs the Gilbert-Johnson-Keerthi (GJK) collision detection algorithm to determine if two shapes intersect.
 *
 * @param {Phaser.Math.Vector2[]} verticesA - An array of vertices representing the first shape.
 * @param {number} countA - The number of vertices in the first shape.
 * @param {Phaser.Math.Vector2[]} verticesB - An array of vertices representing the second shape.
 * @param {number} countB - The number of vertices in the second shape.
 * @return {boolean} Returns true if the shapes intersect, otherwise false.
 */
function gjkCollision(verticesA, countA, verticesB, countB) {
    /** @type {Phaser.Math.Vector2[]} */
    const simplex = [];

    const centerA = getCenterOfShape(verticesA, countA);
    const centerB = getCenterOfShape(verticesB, countB);
    const direction = new Vector2(
        centerB.x - centerA.x,
        centerB.y - centerA.y
    );

    direction.normalize();

    const firstSupport = support(verticesA, countA, verticesB, countB, direction);
    simplex.push(firstSupport);

    direction.x = -firstSupport.x;
    direction.y = -firstSupport.y;
    direction.normalize();

    const MAX_ITERATIONS = 100;
    for (let i = 0; i < MAX_ITERATIONS; i++) {
        const a = support(verticesA, countA, verticesB, countB, direction);

        if (a.dot(direction) < 0) {
            return false;
        }

        simplex.push(a);

        if (handleSimplex(simplex, direction)) {
            return true;
        }
    }
    return false;
}

/**
 * Handles the simplex based on its current state and updates the search direction.
 *
 * @param {Phaser.Math.Vector2[]} simplex - The current simplex, which is an array of points.
 * @param {Phaser.Math.Vector2} direction - The current search direction, which will be updated.
 * @return {boolean} Returns true if the simplex contains the origin, otherwise false.
 */
function handleSimplex(simplex, direction) {
    if (simplex.length === 2) {
        return handleLine(simplex, direction);
    }

    return handleTriangle(simplex, direction);
}

function tripleProduct(a, b, c) {
    const ac = a.dot(c);
    const bc = b.dot(c);

    return new Vector2(
        b.x * ac - a.x * bc,
        b.y * ac - a.y * bc
    ).normalize();
}

/**
 * Handles the case when the simplex is a line segment and updates the search direction.
 *
 * @param {Phaser.Math.Vector2[]} simplex - The current simplex, which is an array of points.
 * @param {Phaser.Math.Vector2} direction - The current search direction, which will be updated.
 */
function handleLine(simplex, direction) {
    const b = simplex[0];
    const a = simplex[1];
    const ab = b.clone().subtract(a);
    const ao = a.clone().negate();
    const perpAB = tripleProduct(ab, ao, ab);
    direction.x = perpAB.x;
    direction.y = perpAB.y;


    return false;
}

/**
 * Handles the case when the simplex is a triangle and updates the search direction.
 *
 * @param {Phaser.Math.Vector2[]} simplex - The current simplex, which is an array of points.
 * @param {Phaser.Math.Vector2} direction - The current search direction, which will be updated.
 * @return {boolean} Returns true if the simplex contains the origin, otherwise false.
 */
function handleTriangle(simplex, direction) {
    const a = simplex[2];
    const b = simplex[1];
    const c = simplex[0];

    const ab = b.clone().subtract(a);
    const ac = c.clone().subtract(a);
    const ao = a.clone().negate();

    const ABperp = tripleProduct(ac, ab, ab);
    const ACperp = tripleProduct(ab, ac, ac);

    // Is in region AB
    if (ABperp.dot(ao) >= 0) {
        simplex.splice(0, 1);
        direction.x = ABperp.x;
        direction.y = ABperp.y;
        return false;
        // Is in region AC
    } else if (ACperp.dot(ao) >= 0) {
        simplex.splice(1, 1);
        direction.x = ACperp.x;
        direction.y = ACperp.y;
        return false;
    }
    return true;
}

function getVerticesWorldSpace(eid, posX, posY, vertexX, vertexY, vertexCount) {
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
/**
 * Creates a collision detection system for the given scene.
 *
 * @param {Phaser.Scene} scene - The Phaser scene to which the collision system will be added.
 * @return {CollisionSystem} The collision system function that processes the world and detects collisions.
 */
export function createCollisionSystem(scene) {
    const collisionQuery = defineQuery([CollisionComponent, PositionComponent]);

    const debugGraphics = scene.add.graphics();
    debugGraphics.setDepth(1000);

    return defineSystem((world) => {
        const entities = collisionQuery(world);

        debugGraphics.clear();

        // We don't need partitioning for our small game. So we just loop through it all 🙃
        for (let i = 0; i < entities.length; ++i) {
            const eidA = entities[i];
            const posAx = PositionComponent.x[eidA];
            const posAy = PositionComponent.y[eidA];
            const verticesAX = CollisionComponent.verticesX[eidA];
            const verticesAY = CollisionComponent.verticesY[eidA];
            const vertexCount = CollisionComponent.vertexCount[eidA];
            const verticesA = getVerticesWorldSpace(eidA, posAx, posAy, verticesAX, verticesAY, vertexCount);

            for (let j = i + 1; j < entities.length; j++) {
                const eidB = entities[j];
                const posBx = PositionComponent.x[eidB];
                const posBy = PositionComponent.y[eidB];
                const verticesBX = CollisionComponent.verticesX[eidB];
                const verticesBY = CollisionComponent.verticesY[eidB];
                const verticesB = getVerticesWorldSpace(eidB, posBx, posBy, verticesBX, verticesBY, CollisionComponent.vertexCount[eidB]);


                const isColliding = gjkCollision(verticesA, vertexCount, verticesB, CollisionComponent.vertexCount[eidB]);
                CollisionComponent.isColliding[eidA] = isColliding ? 1 : 0;
                CollisionComponent.isColliding[eidB] = isColliding ? 1 : 0;

                if (isColliding) {
                    // --- We can add more advanced properties here ---
                    //console.log(`Entity ${eidA} collided with entity ${eidB}`);

                }
            }
        }

        return world
    })
}

export default createCollisionSystem;