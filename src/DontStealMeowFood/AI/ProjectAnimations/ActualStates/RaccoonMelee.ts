import Vec2 from "../../../../Wolfie2D/DataTypes/Vec2";
import { AState } from "../DirectionStates/DirectionEnums";
import AnimationState from "../StateMachines/AnimationState";
import ActualStates from "./ActualStates";

export default class RaccoonMelee extends ActualStates{
    constructor(parent : AnimationState){
        super(parent,AState.Attack);
    }
    updateState(input: Vec2): void {
        
    }
}