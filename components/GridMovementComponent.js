import { defineComponent, Types} from "../bitecs.mjs";


export const GRID_DIRECTIONS = {
    NONE: 0b0000,
    UP: 0b0001,
    DOWN: 0b0010,
    LEFT: 0b0100,
    RIGHT: 0b1000,
}


export const GridMovementComponent = defineComponent({
    movementSpeed: Types.f32,
    direction: Types.ui8,
});


export default GridMovementComponent