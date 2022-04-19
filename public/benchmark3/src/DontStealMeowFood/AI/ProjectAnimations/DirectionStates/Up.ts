import AnimationDirection from "../StateMachines/AnimationDirection";
import { Direction } from "./DirectionEnums";
import DirectionStates from "./DirectionStates";

export default class Up extends DirectionStates{
    constructor(parent : AnimationDirection){
        super(parent,Direction.U);
    }
}