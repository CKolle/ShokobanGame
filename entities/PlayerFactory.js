import PositionComponent from "../components/PositionComponent.js";
import {BaseEntityFactory} from "./BaseEntityFactory.js";
import SpriteComponent from "../components/SpriteComponent.js";
import GridMovementComponent from "../components/GridMovementComponent.js";
import CollisionComponent from "../components/CollisionComponent.js";


export class PlayerFactory  extends BaseEntityFactory {


    /**
     * Initializes components for a player entity
     * @protected
     * @param {number} entityId - The entity ID to initialize
     * @param {number} x - The inital x coordinate
     * @param {number} y - The initial y coordinate
     * @param {number} movementSpeed - The movement speed
     */
    _initializeComponents(entityId, x, y, movementSpeed) {
        this._addComponents(entityId, PositionComponent, GridMovementComponent, SpriteComponent, CollisionComponent);
        PositionComponent.x[entityId] = x;
        PositionComponent.y[entityId] = y;
        GridMovementComponent.movementSpeed[entityId] = movementSpeed;
        SpriteComponent.textureId[entityId] = 0;

        // Define the collision vertices
        CollisionComponent.verticesX[entityId] = new Float32Array([-30, 30, 30, -30]);
        CollisionComponent.verticesY[entityId] = new Float32Array([-30, -30, 30, 30]);

        // Set the vertex count
        CollisionComponent.vertexCount[entityId] = 4;
    }

}
export default PlayerFactory;