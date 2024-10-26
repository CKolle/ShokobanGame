import {defineComponent, Types} from "../bitecs.mjs";

// Note do not change the order of the properties
export const CollisionComponent = defineComponent({
    // Each collision can have up to 8 vertices for now
    verticesX: [Types.f32, 16],
    verticesY: [Types.f32, 16],
    mass: Types.f32,
    // We can remove restitution later I just want to try somethings out
    restitution: Types.f32, // Spretthet på godt norsk
    isTrigger: Types.ui8, // 1 if it has just triggered
    vertexCount: Types.ui8,
    isColliding: Types.ui8,
    lastCollisionNormalX: Types.f32,
    lastCollisionNormalY: Types.f32,
});

export default  CollisionComponent;