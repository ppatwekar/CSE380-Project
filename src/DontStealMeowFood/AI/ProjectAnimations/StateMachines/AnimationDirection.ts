import StateMachine from "../../../../Wolfie2D/DataTypes/State/StateMachine";
import Vec2 from "../../../../Wolfie2D/DataTypes/Vec2";
import { Direction } from "../DirectionStates/DirectionEnums";
import DirectionStates from "../DirectionStates/DirectionStates";

export default class AnimationDirection extends StateMachine{
    constructor(states : {key : string, state : {new(parent : AnimationDirection) : DirectionStates}}[]){
        super();
        states.forEach((s) => this.addState(s.key, new s.state(this) ));
        this.initialize(Direction.R);
    }
    getDescription(){
        return (<DirectionStates>this.currentState).getDescription();
    }

    updateDirection(input : Vec2){
        (<DirectionStates>this.currentState).updateDirection(input);
    }

}