import GoapActionPlanner from "../../Wolfie2D/AI/GoapActionPlanner";
import StateMachineGoapAI from "../../Wolfie2D/AI/StateMachineGoapAI";
import GoapAction from "../../Wolfie2D/DataTypes/Interfaces/GoapAction";
import AABB from "../../Wolfie2D/DataTypes/Shapes/AABB";
import Stack from "../../Wolfie2D/DataTypes/Stack";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import GameNode from "../../Wolfie2D/Nodes/GameNode";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import OrthogonalTilemap from "../../Wolfie2D/Nodes/Tilemaps/OrthogonalTilemap";
import NavigationPath from "../../Wolfie2D/Pathfinding/NavigationPath";
import { Custom_Events, Custom_Statuses } from "../GameConstants";
import Weapon from "../GameSystems/items/Weapon";
import Visiblity from "../GameSystems/Visiblity";
import Active from "./EnemyStates/Active";
import Alert from "./EnemyStates/Alert";
import Guard from "./EnemyStates/Guard";
import Patrol from "./EnemyStates/Patrol";
import Idle from "./ProjectAnimations/ActualStates/Idle";
import Melee from "./ProjectAnimations/ActualStates/Melee";
import RaccoonMelee from "./ProjectAnimations/ActualStates/RaccoonMelee";
import Run from "./ProjectAnimations/ActualStates/Run";
import { AState, Direction } from "./ProjectAnimations/DirectionStates/DirectionEnums";
import Down from "./ProjectAnimations/DirectionStates/Down";
import Left from "./ProjectAnimations/DirectionStates/Left";
import Right from "./ProjectAnimations/DirectionStates/Right";
import Up from "./ProjectAnimations/DirectionStates/Up";
import ProjectAnimationManager from "./ProjectAnimations/ProjectAnimationManager";
import EnemyVision from "../GameSystems/EnemyVision";

export default class EnemyAI extends StateMachineGoapAI{
    owner : AnimatedSprite;

    maxHealth : number;

    currentHealth : number;

    speed : number = 20;

    weapon : Weapon;

    player : GameNode;

    playerPos : Vec2;

    lastPlayerPos : Vec2 = null;

    attackRange : number;

    path : NavigationPath;

    inRange : number;

    retreatPath : NavigationPath; //if we want the retreat option

    anime : ProjectAnimationManager;

    vision : number;


    initializeAI(owner: AnimatedSprite, options: Record<string, any>): void {
        this.owner = owner;

        if(options.defaultMode === "Guard"){
            this.addState(EnemyStates.DEFAULT, new Guard(this,this.owner,options.guardPosition));
        }
        else {
            this.addState(EnemyStates.DEFAULT, new Patrol(this,this.owner,options.patrolRoute));
        }

        this.addState(EnemyStates.ALERT, new Alert(this,this.owner));
        this.addState(EnemyStates.TARGETING, new Active(this,this.owner));
        //this.addState(CommonStates.INFECTED, new Infected(this,this.owner));

        this.maxHealth = options.health;

        this.currentHealth = options.health;

        //this.weapon = options.weapon;

        this.player = options.player;

        this.inRange = options.inRange;

        this.goal = options.goal;

        this.currentStatus = options.status;

        this.possibleActions = options.actions;

        this.vision = options.vision;

        this.plan = new Stack<GoapAction>();

        this.planner = new GoapActionPlanner();

        // Initialize to the default state
        this.initialize(EnemyStates.DEFAULT);

        this.bushes = <OrthogonalTilemap>this.owner.getScene().getLayer("Bushes").getItems()[0];

        this.addAnimations(this.owner);

        this.receiver.subscribe(Custom_Events.HIT_ENEMY);
        //handle Enemy damage updates in it's states.

        this.getPlayerPosition();


    }

    activate(options: Record<string, any>): void {
        
    }

    damage(damage : number){
        this.currentHealth -= damage;
        console.log("Enemy took Damage! Remaining Health: " + this.currentHealth);

        //if health is less than or equal to maxHealth assigned
        if(this.currentHealth <= Math.floor(this.maxHealth/2)){
            if(this.currentStatus.indexOf(Custom_Statuses.LOW_HEALTH) === -1){
                this.currentStatus.push(Custom_Statuses.LOW_HEALTH);
            }
        }

        if(this.currentHealth <= 0){ //player lost life
            this.owner.setAIActive(false,{}); 
            this.owner.isCollidable = false;
            this.owner.visible = false;
            this.emitter.fireEvent(Custom_Events.ENEMY_DEATH ,{enemy : this.owner});

            if(Math.random() < 0.2){ 
                //spawn a health pack or something else like cat food or water
                //this.emitter.fireEvent("healthPack",{position : this.owner});
            }
        }
    }

    isAssassinated(){
        
    }

    private bushes : OrthogonalTilemap;


    getPlayerPosition() : Vec2{
        //return this.isPlayerVisible(this.player.position);
        return EnemyVision.positionsVisible(this.player.position.clone(),this.owner.position.clone(), this.vision, this.anime.direction, this.bushes);
        //return Visiblity.positionsVisible(this.player.position.clone(),this.owner.position.clone(), this.vision, this.bushes);
    }


    update(deltaT: number): void {
        super.update(deltaT);
        if(this.plan.isEmpty()){
            this.plan = this.planner.plan(Custom_Statuses.REACHED_GOAL, this.possibleActions, this.currentStatus, null);
        }
        this.anime.update(this.currentAnimatiionMoveDirection, this.currentAnimationActualState);
        
    }

    currentAnimationActualState : AState;
    currentAnimatiionMoveDirection : Vec2 = Vec2.ZERO;

    setAnimation(direction : Vec2, changeState?: AState){
        this.currentAnimatiionMoveDirection = direction;
        this.currentAnimationActualState = changeState;
    }

    

    addAnimations(owner : AnimatedSprite){

        this.anime = new ProjectAnimationManager(owner,
            [{key : AState.Idle, state : Idle},{key: AState.Run, state : Run}, {key : AState.Attack, state : RaccoonMelee}],
            [{key : Direction.D, state : Down},{key : Direction.L, state : Left},{key : Direction.R, state : Right},{key : Direction.U, state : Up}]);
      

    }

}

export enum EnemyStates {
    DEFAULT = "default", //patrol or guard
    ALERT = "alert", //alert
    TARGETING = "targeting", //active
    PREVIOUS = "previous",
    FOLLOWING = "FOLLOWING"
}