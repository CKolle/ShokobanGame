import {defineComponent, Types} from "../bitecs.mjs";

export const GridPathMovementComponent = defineComponent({
    startX: Types.f32,
    startY: Types.f32,
    targetX: Types.f32,
    targetY: Types.f32,
    progress: Types.f32,
    speed: Types.f32,
    direction: Types.ui8,
});

export default GridPathMovementComponent;