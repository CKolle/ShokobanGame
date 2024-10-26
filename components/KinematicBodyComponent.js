import {defineComponent, Types} from "../bitecs.mjs";

export const KinematicBodyComponent = defineComponent({
    velocityX: Types.f32,
    velocityY: Types.f32,
    accelerationX: Types.f32,
    accelerationY: Types.f32,
    maxSpeed: Types.f32,
})

export default KinematicBodyComponent