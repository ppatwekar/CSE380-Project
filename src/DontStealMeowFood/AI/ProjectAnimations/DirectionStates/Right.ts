import AnimationDirection from "../StateMachines/AnimationDirection";
import { Direction } from "./DirectionEnums";
import DirectionStates from "./DirectionStates";

export default class Right extends DirectionStates{
    constructor(parent : AnimationDirection){
        super(parent,Direction.R);
    }
}