import GameEvent from "../../../../Wolfie2D/Events/GameEvent";
import { AState } from "../DirectionStates/DirectionEnums";
import AnimationState from "../StateMachines/AnimationState";
import ActualStates from "./ActualStates";

export default class Idle extends ActualStates{
    constructor(parent : AnimationState){
        super(parent, AState.Idle);
    }


    

}