import PositionComponent from "../components/PositionComponent.js";
import BaseEntityFactory from "./BaseEntityFactory.js";
import SpriteComponent from "../components/SpriteComponent.js";
import GridNavigatorComponent from "../components/GridNavigatorComponent.js";
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
        this._addComponents(entityId, PositionComponent, GridNavigatorComponent, SpriteComponent, CollisionComponent);
        PositionComponent.x[entityId] = x;
        PositionComponent.y[entityId] = y;
        GridNavigatorComponent.movementSpeed[entityId] = movementSpeed;
        SpriteComponent.textureId[entityId] = 0;

        // Note we make the all elements a bit smaller than the tile size so they don't overlap when
        // Standing next to each other
        CollisionComponent.verticesX[entityId] = new Float32Array([-30, 30, 30, -30]);
        CollisionComponent.verticesY[entityId] = new Float32Array([-30, -30, 30, 30]);
        CollisionComponent.vertexCount[entityId] = 4;
    }

}
export default PlayerFactory;