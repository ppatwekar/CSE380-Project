import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../../Wolfie2D/Events/GameEvent";
import Receiver from "../../Wolfie2D/Events/Receiver";
import Input from "../../Wolfie2D/Input/Input";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import NavigationPath from "../../Wolfie2D/Pathfinding/NavigationPath";
import InventoryManager from "../GameSystems/InventoryManager";
import Healthpack from "../GameSystems/items/Healthpack";
import Item from "../GameSystems/items/Item";
import Weapon from "../GameSystems/items/Weapon";
import { Custom_Events, Custom_Names } from "../GameConstants";
import BattlerAI from "./BattlerAI";
import PlayerAnimationManager  from "./ProjectAnimations/ProjectAnimationManager";
import AABB from "../../Wolfie2D/DataTypes/Shapes/AABB";
import StateMachineAI from "../../Wolfie2D/AI/StateMachineAI";
//import IdleD from "./PlayerCat/AnimationStates/IdleD";
//import IdleL from "./PlayerCat/AnimationStates/IdleL";
//import IdleR from "./PlayerCat/AnimationStates/IdleR";
//import State from "../../Wolfie2D/DataTypes/State/State";
//import IdleU from "./PlayerCat/AnimationStates/IdleU";
//import RunR from "./PlayerCat/AnimationStates/RunR";
//import RunL from "./PlayerCat/AnimationStates/RunL";
//import RunD from "./PlayerCat/AnimationStates/RunD";
//import RunU from "./PlayerCat/AnimationStates/RunU";
//import AnimationState from "./PlayerCat/AnimationState";
//import StateMachine from "../../Wolfie2D/DataTypes/State/StateMachine";
//import GameNode from "../../Wolfie2D/Nodes/GameNode";
import ProjectAnimationManager from "./ProjectAnimations/ProjectAnimationManager";
import { AState, Direction } from "./ProjectAnimations/DirectionStates/DirectionEnums";
import Idle from "./ProjectAnimations/ActualStates/Idle";
import Down from "./ProjectAnimations/DirectionStates/Down";
import Run from "./ProjectAnimations/ActualStates/Run";
import Left from "./ProjectAnimations/DirectionStates/Left";
import Right from "./ProjectAnimations/DirectionStates/Right";
import Up from "./ProjectAnimations/DirectionStates/Up";


export default class PlayerController extends StateMachineAI implements BattlerAI {
    // Fields from BattlerAI
    health: number;

    // The actual player sprite
    owner: AnimatedSprite;

    // Attack range
    range: number;

    // Current targeted enemy
    target: Vec2;

    // Used for swapping control between both players
    inputEnabled: boolean;

    // The inventory of the player
    inventory: InventoryManager;

    /** A list of items in the game world */
    private items: Array<Item>;

    // Movement
    private speed: number;

    private lookDirection: Vec2;
    private path: NavigationPath;

    receiver: Receiver;

    private playerAnimationManager : PlayerAnimationManager;
    private directionVector : Vec2;
    private playerAABB : AABB;
    private viewPortAABB : AABB;
    anime : ProjectAnimationManager;


    initializeAI(owner: AnimatedSprite, options: Record<string, any>): void {
        this.owner = owner;
        this.lookDirection = Vec2.ZERO;
        this.speed = options.speed;
        this.health = options.health;
        this.inputEnabled = options.inputEnabled;
        this.range = options.range;

        this.items = options.items;
        this.inventory = options.inventory;

        this.receiver = new Receiver();

        //this.playerAnimationManager = new PlayerAnimationManager(this.owner);
        this.directionVector = Vec2.ZERO;
        this.playerAABB = this.owner.boundary;
        this.viewPortAABB = this.owner.getScene().getViewport().getView();
        //this.addAnimationStates();
        this.addAnimationStates2(this.owner);

    }

    activate(options: Record<string, any>): void { }

    handleEvent(event: GameEvent): void { }

    // TODO
    update(deltaT: number): void {
        while(this.receiver.hasNextEvent()){
            this.handleEvent(this.receiver.getNextEvent());
        }
        if (this.inputEnabled && this.health > 0) { //can remove this for now. maybe not


            const distance = Vec2.ZERO;

            this.directionVector.y = distance.y = (Input.isPressed("up") ? -1 : 0) + (Input.isPressed("down") ? 1 : 0);
            this.directionVector.x = distance.x = (Input.isPressed("left") ? -1 : 0) + (Input.isPressed("right") ? 1 : 0);

            //here, check where the animatedSprite is w.r.t the viewPort. Check if AABB size and stuff
            //i.e if distance from animatedSprite to viewport edge is less than or equal the half size, then do not move 
            //the AnimatedSprite in that direction. But it can move in other direction
            //for example if animatedSprite is touching right edge, check if directionVector.x == 1. If so, make it 0
            //otherwise if it is -1 or 0 (only other options) then no worries. Same for the y - coordinate.
            this.boundPlayerInViewPort(distance);

            distance.normalize();
            distance.scale(this.speed * deltaT);

            this.owner.move(distance);
            //super.update(deltaT);
            this.anime.update(distance);

            this.updateRotation();
            
            //this.playerAnimationManager.handleInput(this.directionVector);
            
            /*
            // Check for slot change
            if (Input.isJustPressed("slot1")) {
                this.inventory.changeSlot(0);
            } else if (Input.isJustPressed("slot2")) {
                this.inventory.changeSlot(1);
            }

            if (Input.isJustPressed("pickup")) {
                // Check if there is an item to pick up
                for (let item of this.items) {
                    if (this.owner.collisionShape.overlaps(item.sprite.boundary)) {
                        // We overlap it, try to pick it up
                        this.inventory.addItem(item);
                        break;
                    }
                }
            }

            if (Input.isJustPressed("drop")) {
                // Check if we can drop our current item
                let item = this.inventory.removeItem();

                if (item) {
                    // Move the item from the ui to the gameworld
                    item.moveSprite(this.owner.position, "primary");

                    // Add the item to the list of items
                    this.items.push(item);
                }
            }
            */
        }
        
        //Target an enemy and attack
        /*
        if (this.target != null) {
            let item = this.inventory.getItem();
            this.lookDirection = this.owner.position.dirTo(this.target);

            // If there is an item in the current slot, use it
            if (item) {
                item.use(this.owner, "player", this.lookDirection);
                this.owner.rotation = Vec2.UP.angleToCCW(this.lookDirection);

                if (item instanceof Healthpack) {
                    // Destroy the used healthpack
                    this.inventory.removeItem();
                    item.sprite.visible = false;
                }
            }
        } */
    }

    private updateRotation(){
        let currentState = this.anime.currentState;
        let rotate : number;
        let angle : number;
        if(currentState === "IdleR" || currentState === "RunR"){
            angle = (Vec2.RIGHT.angleToCCW(Input.getGlobalMousePosition().sub(this.owner.position)));
        }
        else if(currentState === "IdleL" || currentState === "RunL"){
            angle = Vec2.LEFT.angleToCCW(Input.getGlobalMousePosition().sub(this.owner.position));
        }
        else if(currentState === "IdleU" || currentState === "RunU"){
            angle = Vec2.UP.angleToCCW(Input.getGlobalMousePosition().sub(this.owner.position));
        }
        else {
            angle = Vec2.DOWN.angleToCCW(Input.getGlobalMousePosition().sub(this.owner.position));
        }

        angle = angle > Math.PI/4 && angle < Math.PI ? (Math.PI/4) : (angle > Math.PI && angle < 7 * Math.PI/4 ? (7 * Math.PI/4) : angle); 

        this.owner.rotation = angle;
    
    }

    private boundPlayerInViewPort(direction : Vec2){
        const vpLeftEdge : number = 0;
        const vpTopEdge : number = 0;
        let vpRightEdge : number = this.viewPortAABB.center.x + this.viewPortAABB.getHalfSize().x;
        let vpBottomEdge : number = this.viewPortAABB.center.y + this.viewPortAABB.getHalfSize().y;

        let playerLeftEdge : number = this.playerAABB.center.x - this.playerAABB.halfSize.x;
        let playerRightEdge : number = this.playerAABB.center.x + this.playerAABB.halfSize.x;
        let playerTopEdge : number = this.playerAABB.center.y - this.playerAABB.halfSize.y;
        let playerBottomEdge : number = this.playerAABB.center.y + this.playerAABB.halfSize.y;

        if(direction.x == 1){
            if(playerRightEdge >= vpRightEdge){
                direction.x = 0;
            }
        }
        if(direction.x == -1){
            if(playerLeftEdge <= vpLeftEdge){
                direction.x = 0;
            }
        }
        if(direction.y == 1){
            if(playerBottomEdge >= vpBottomEdge){
                direction.y = 0;
            }
            
        }
        if(direction.y == -1){
            if(playerTopEdge <= vpTopEdge){
                direction.y = 0;
            }
        }
    }

    changeState(state: string): void {
        
    }

    /*
    addAnimationStates(){

        let states : { stateName : string, constructor : {new(parent : StateMachineAI, owner : GameNode, direction : Vec2, currentState : string) : AnimationState}}[] = 
        [{stateName : States.IdleR, constructor : IdleR},
        {stateName : States.IdleL, constructor : IdleL},
        {stateName : States.IdleD, constructor : IdleD},
        {stateName : States.IdleU, constructor : IdleU},
    
        {stateName : States.RunD, constructor : RunD},
        {stateName : States.RunL, constructor : RunL},
        {stateName : States.RunR, constructor : RunR},
        {stateName : States.RunU, constructor : RunU}];

        for(let state of states){
            this.addState(state.stateName, new state.constructor(this,this.owner,this.directionVector, States.IdleR));
        }

        this.initialize(States.IdleR);

        
    } */

    addAnimationStates2(owner : AnimatedSprite){
        this.anime = new ProjectAnimationManager(owner,
            [{key : AState.Idle, state : Idle},{key: AState.Run, state : Run}],
            [{key : Direction.D, state : Down},{key : Direction.L, state : Left},{key : Direction.R, state : Right},{key : Direction.U, state : Up}]);
        
    }

    damage(damage: number): void {
        this.health -= damage;
    }

    destroy() {

    }
}