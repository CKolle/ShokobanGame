import {BaseEntityFactory} from "./BaseEntityFactory.js";
import CollisionComponent from "../components/CollisionComponent.js";
import SpriteComponent from "../components/SpriteComponent.js";
import PositionComponent from "../components/PositionComponent.js";
import GridMovementComponent from "../components/GridMovementComponent.js";


export class BoxFactory extends BaseEntityFactory {

    _initializeComponents(entityId, x, y) {
        this._addComponents(entityId, CollisionComponent, SpriteComponent, PositionComponent)
        PositionComponent.x[entityId] = x;
        PositionComponent.y[entityId] = y;
        GridMovementComponent.movementSpeed[entityId] = 0;
        SpriteComponent.textureId[entityId] = 0;

        // Make the box a bit smaller than the tile size

        CollisionComponent.verticesX[entityId] = new Float32Array([-29, 29, 29, -29, -60]);
        CollisionComponent.verticesY[entityId] = new Float32Array([-29, -29, 29, 29, 0]);

        // Set the vertex count
        CollisionComponent.vertexCount[entityId] = 5;
    }
}

export default BoxFactory;