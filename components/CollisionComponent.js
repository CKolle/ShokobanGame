import {defineComponent, Types} from "../bitecs.mjs";

// Note do not change the order of the properties
// We want to align the memory layout as it uses a C++ struct under the hood in the JIT
export const collisionComponent = defineComponent({
    // Each collision can have up to 8 vertices for now
    verticesX: [Types.f32, 16],
    verticesY: [Types.f32, 16],
    mass: Types.f32,
    // We can remove restitution later I just want to try somethings out
    restitution: Types.f32, // Spretthet på godt norsk
    isTrigger: Types.ui8, // 1 if it has just triggered
    vertexCount: Types.ui8,
    isColliding: Types.ui8,
});

export default  collisionComponent;