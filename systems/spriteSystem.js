import {defineQuery, defineSystem, enterQuery, exitQuery} from "../bitecs.mjs";
import PositionComponent from "../components/PositionComponent.js";
import SpriteComponent from "../components/SpriteComponent.js";

/**
 * @typedef {function(World): void} SpriteSystem
 */

/**
 *
 * @param {Phaser.Scene} scene
 * @param {String[]}textures
 * @returns {(function(*, ...[*]): *)|*}
 */
export function createSpriteSystem(scene, textures)
{
    const spriteTextureMap = new Map();
    const spriteQuery = defineQuery([PositionComponent, SpriteComponent]);

    // When sprites enter the game world
    const spriteQueryEnter = enterQuery(spriteQuery);
    // When sprites exist the game world
    const spriteQueryExit = exitQuery(spriteQuery);

    return defineSystem((world) => {
        const entitiesEntered = spriteQueryEnter(world);
        for (let i = 0; i < entitiesEntered.length; ++i)
        {
            const eid = entitiesEntered[i];
            const textureId = SpriteComponent.textureId[eid];
            const texture = textures[textureId]
            spriteTextureMap.set(eid, scene.add.sprite(0,0,texture))
        }

        const entities = spriteQuery(world);
        for (let i = 0; i < entities.length; ++i)
        {
            const eid = entities[i];

            const sprite = spriteTextureMap.get(eid);
            if(!sprite)
            {
                console.warn("Sprite was not found in spriteSystem continuing to next sprite");
                continue;
            }
            sprite.x = PositionComponent.x[eid];
            sprite.y = PositionComponent.y[eid];
        }

        const entitiesExited = spriteQueryExit(world);
        for (let i = 0; i < entitiesExited.length; ++i)
        {
            const eid =entitiesExited[i];
            spriteTextureMap.delete(eid);
        }
        return world;
    })
}

export default createSpriteSystem;