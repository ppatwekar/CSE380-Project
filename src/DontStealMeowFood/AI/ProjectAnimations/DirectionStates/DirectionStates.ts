import State from "../../../../Wolfie2D/DataTypes/State/State";
import Vec2 from "../../../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../../../../Wolfie2D/Events/GameEvent";
import AnimationDirection from "../StateMachines/AnimationDirection";
import { Direction } from "./DirectionEnums";

export default abstract class DirectionStates extends State{
    protected description : string;
    constructor(parent: AnimationDirection, description: string){
        super(parent);
        this.description = description;
    }
    getDescription(){
        return this.description;
    }

    //change states here based on direction Left,Right,Up,Down
    //if [x,y] x and y are same magnitude, choose to transition to xth direction 
    updateDirection(input : Vec2){
        if(!input.equals(Vec2.ZERO)){
        if(Math.abs(input.x) == Math.abs(input.y)){
            if(input.x < 0){
                this.parent.changeState(Direction.L);
            }
            else{
                this.parent.changeState(Direction.R);
                
            }
        }
        else{
            Math.abs(input.x) > Math.abs(input.y) ? (input.x < 0 ? this.parent.changeState(Direction.L) : this.parent.changeState(Direction.R)) : (input.y < 0 ? this.parent.changeState(Direction.U) : this.parent.changeState(Direction.D));
        }
    }

    }

    update(deltaT: number): void {
        
    }

    onEnter(options: Record<string, any>): void {
        
    }

    onExit(): Record<string, any> {
        return {};
    }

    handleInput(event: GameEvent): void {
        
    }

        
    
}