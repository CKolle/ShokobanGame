import BaseEntityFactory from "./BaseEntityFactory.js";
import CollisionComponent from "../components/CollisionComponent.js";
import SpriteComponent from "../components/SpriteComponent.js";
import PositionComponent from "../components/PositionComponent.js";
import GridNavigatorComponent from "../components/GridNavigatorComponent.js";
import KinematicBodyComponent from "../components/KinematicBodyComponent.js";


export class BoxFactory extends BaseEntityFactory {

    _initializeComponents(entityId, x, y) {
        this._addComponents(entityId, CollisionComponent, SpriteComponent, PositionComponent);
        PositionComponent.x[entityId] = x;
        PositionComponent.y[entityId] = y;
        //GridNavigatorComponent.movementSpeed[entityId] = 0;
        SpriteComponent.textureId[entityId] = 0;

        // Note we make the all elements a bit smaller than the tile size so they don't overlap when
        // Standing next to each other
        CollisionComponent.verticesX[entityId] = new Float32Array([-30, 30, 30, -30, -60]);
        CollisionComponent.verticesY[entityId] = new Float32Array([-30, -30, 30, 30, 0]);
        CollisionComponent.vertexCount[entityId] = 5;
        CollisionComponent.restitution[entityId] = 1;
    }
}

export default BoxFactory;