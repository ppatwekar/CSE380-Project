import Vec2 from "../../../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../../../../Wolfie2D/Events/GameEvent";
import AnimationDirection from "../StateMachines/AnimationDirection";
import { Direction } from "./DirectionEnums";
import DirectionStates from "./DirectionStates";

export default class Left extends DirectionStates{

    constructor(parent: AnimationDirection){
        super(parent,Direction.L);
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