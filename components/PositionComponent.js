import {defineComponent, Types} from "../bitecs.mjs";


export const PositionComponent = defineComponent({
        x: Types.f32,
        y: Types.f32
});

export default PositionComponent;