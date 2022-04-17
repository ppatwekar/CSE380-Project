import StateMachine from "../../../../Wolfie2D/DataTypes/State/StateMachine"
import Vec2 from "../../../../Wolfie2D/DataTypes/Vec2";
import ActualStates from "../ActualStates/ActualStates";
import Idle from "../ActualStates/Idle";
import { AState } from "../DirectionStates/DirectionEnums";
import AnimationDirection from "./AnimationDirection"

export default class AnimationState extends StateMachine{

    constructor(states : {key : string, state : {new(parent : AnimationState) : ActualStates}}[]){
        super();
        states.forEach((s) => this.addState(s.key, new s.state(this) )); 
        this.initialize(AState.Idle);

    }

    getDescription(){
        return (<ActualStates>this.currentState).getDescription();
    }

    updateState(input : Vec2){
         (<ActualStates>this.currentState).updateState(input);
    }
}