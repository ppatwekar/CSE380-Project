import State from "../../../../Wolfie2D/DataTypes/State/State";
import Vec2 from "../../../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../../../../Wolfie2D/Events/GameEvent";
import { AState } from "../DirectionStates/DirectionEnums";
import AnimationState from "../StateMachines/AnimationState";

export default abstract class ActualStates extends State{
    protected description : string;
    constructor(parent : AnimationState, description : string ){
        super(parent);
        this.description = description;
    }
    getDescription(){
        return this.description;
    }

    updateState(input : Vec2){
        if(input.equals(Vec2.ZERO)){
            this.parent.changeState(AState.Run);
        }
        else{
            this.parent.changeState(AState.Run);
        }
    }

    onEnter(options: Record<string, any>): void {
    }
    handleInput(event: GameEvent): void {
    }
    update(deltaT: number): void {
    }
    onExit(): Record<string, any> {
        return {};
    }
}