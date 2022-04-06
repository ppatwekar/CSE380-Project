import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";

export enum States{
    IdleD = "IdleD",
    IdleL = "IdleL",
    IdleR = "IdleR",
    IdleU = "IdleU",
    RunD = "RunD",
    RunL = "RunL", 
    RunR = "RunR", 
    RunU = "RunU",


}

export class PlayerAnimationManager{
    private currentState : States;
    private owner : AnimatedSprite;
    constructor(owner: AnimatedSprite, initialState?: States){
        this.owner = owner;
        if(initialState != null){
            this.currentState = initialState;
        }
        else {
            this.currentState = States.RunR;
        }
    }

    handleInput(direction : Vec2){
        if(direction.equals(Vec2.ZERO)){
            if(this.currentState == States.RunD){
                this.currentState = States.IdleD;
            }
            else if(this.currentState == States.RunL){
                this.currentState = States.IdleL;
            }
            else if(this.currentState == States.RunU){
                this.currentState = States.IdleU
            }
            else if(this.currentState == States.RunR){
                this.currentState = States.IdleR;
            }
        }
        else{
            if(direction.x == 1){
                this.currentState = States.RunR;
            }
            else if(direction.x == -1){
                this.currentState = States.RunL;
            }
            else if(direction.y == 1){
                this.currentState = States.RunD;
            }
            else{ // direction.y == -1
                this.currentState = States.RunU;
            }
        }

        this.owner.animation.play(this.currentState);
    }
}