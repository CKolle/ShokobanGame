import {defineComponent, Types} from "../bitecs.mjs";


export const PositionComponent = defineComponent({
        x: Types.i32,
        y: Types.i32
});

export default PositionComponent;