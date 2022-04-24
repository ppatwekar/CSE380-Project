import Vec2 from "../../../../Wolfie2D/DataTypes/Vec2";
import { AState } from "../DirectionStates/DirectionEnums";
import AnimationState from "../StateMachines/AnimationState";
import ActualStates from "./ActualStates";


export default class Melee extends ActualStates{
    constructor(parent : AnimationState){
        super(parent,AState.Melee);
    }
    updateState(input: Vec2): void {
        
    }
}