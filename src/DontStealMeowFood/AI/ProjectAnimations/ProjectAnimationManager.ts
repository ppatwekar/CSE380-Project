import AnimationDirection from "./StateMachines/AnimationDirection";
import AnimationState from "./StateMachines/AnimationState";
import AnimatedSprite from "../../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import ActualStates from "./ActualStates/ActualStates";
import DirectionStates from "./DirectionStates/DirectionStates";
import Vec2 from "../../../Wolfie2D/DataTypes/Vec2";

export default class ProjectAnimationManager {
    state : AnimationState;
    direction : AnimationDirection;
    owner : AnimatedSprite
    currentState : string;

    constructor(owner : AnimatedSprite , animationStates :  {key : string, state : {new(parent: AnimationState) : ActualStates}}[], directionStates : {key : string, state : {new(parent : AnimationDirection) : DirectionStates}}[]){
        this.state = new AnimationState(animationStates);
        this.direction = new AnimationDirection(directionStates);
        this.owner = owner;
        this.currentState = this.getDesciption();
        this.play();
    }

    play(){
        let currentAnimation =  this.state.getDescription() + this.direction.getDescription();
        this.owner.animation.play(currentAnimation);
    }

    update(input : Vec2, changeState? : string){
        this.state.updateState(input,changeState);
        this.direction.updateDirection(input);

        if(this.getDesciption() != this.currentState){
            this.currentState = this.getDesciption();
            this.play();
        }
    }


    getDesciption(){
        return this.state.getDescription() + this.direction.getDescription();
    }
}