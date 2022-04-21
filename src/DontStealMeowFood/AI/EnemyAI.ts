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
//import CommonState, { CommonStates } from "./CommonStates/CommonState";
//import Infected from "./CommonStates/Infected";
import Active from "./EnemyStates/Active";
import Alert from "./EnemyStates/Alert";
import Guard from "./EnemyStates/Guard";
import Patrol from "./EnemyStates/Patrol";
import Idle from "./ProjectAnimations/ActualStates/Idle";
import Run from "./ProjectAnimations/ActualStates/Run";
import { AState, Direction } from "./ProjectAnimations/DirectionStates/DirectionEnums";
import Down from "./ProjectAnimations/DirectionStates/Down";
import Left from "./ProjectAnimations/DirectionStates/Left";
import Right from "./ProjectAnimations/DirectionStates/Right";
import Up from "./ProjectAnimations/DirectionStates/Up";
import ProjectAnimationManager from "./ProjectAnimations/ProjectAnimationManager";

export default class EnemyAI extends StateMachineGoapAI{
    owner : AnimatedSprite;

    maxHealth : number;

    currentHealth : number;

    speed : number = 20;

    weapon : Weapon;

    player : GameNode;

    playerPos : Vec2;

    lastPlayerPos : Vec2;

    attackRange : number;

    path : NavigationPath;

    inRange : number;

    retreatPath : NavigationPath; //if we want the retreat option

    anime : ProjectAnimationManager;


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

        //this.inRange = options.inRange;

        this.goal = options.goal;

        this.currentStatus = []; //options.status;

        this.possibleActions = []; //options.actions;

        this.plan = new Stack<GoapAction>();

        this.planner = new GoapActionPlanner();

        // Initialize to the default state
        this.initialize(EnemyStates.DEFAULT);

        this.bushes = <OrthogonalTilemap>this.owner.getScene().getLayer("Bushes").getItems()[0];

        this.addAnimations(this.owner);

        this.receiver.subscribe(Custom_Events.HIT_ENEMY);
        //handle Enemy damage updates in it's states.


        //this.getPlayerPosition();


    }

    activate(options: Record<string, any>): void {
        
    }

    damage(damage : number){
        this.currentHealth -= damage;

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
            this.emitter.fireEvent("enemyDied",{enemy : this.owner});

            if(Math.random() < 0.2){ 
                //spawn a health pack or something else like cat food or water
                //this.emitter.fireEvent("healthPack",{position : this.owner});
            }
        }
    }

    isAssassinated(){
        
    }

    private zeroPos : Vec2 = Vec2.ZERO;
    private tilePos: Vec2 = Vec2.ZERO;
    private colliderTileAABB : AABB = new AABB();
    private startTileIndex : Vec2 = Vec2.ZERO;
    private endTileIndex : Vec2 = Vec2.ZERO;
    private bushes : OrthogonalTilemap;


    isPlayerVisible(playerPos : Vec2) : Vec2{
        let myPos = this.owner.position.clone(); //get position of this enemy
        let difference = playerPos.clone().sub(myPos); //find displacement between player position and this enemy position


        /**
         *   Say this is the tilemap
         * 
         *      #'s are tiles collidable or non-collidable both.
         *      <spaces> are positions of enemy and player.
         * 
         *      ####################
         *      ############### ####
         *      ####################
         *      ##### ##############
         *      ####################
         *      ####################
         * 
         *      To check if any tiles are collidable (blocks vision) between player and enemy, check all 
         *      tiles that lie in the rectangle created by the two spaces. So this means the first tile to check 
         *      will be 'S' (that is minX, minY )and the last tile to check will be 'E' (maxX, maxY)
         * 
         *      ####################
         *      #####S######### ####
         *      ####################
         *      ##### #########E####
         *      ####################
         *      ####################               
         */


        this.startTileIndex.x = Math.min(myPos.x, playerPos.x); //x position of tile S
        this.startTileIndex.y = Math.min(myPos.y, playerPos.y); //y position of tile S
        this.endTileIndex.x = Math.max(myPos.x, playerPos.y);   //x position of tile E
        this.endTileIndex.y = Math.max(myPos.x, playerPos.x);   //y position of tile E

    

        let startTileIndex = this.bushes.getColRowAt(this.startTileIndex); //index of tile S in tilemap
        let endTileIndex = this.bushes.getColRowAt(this.endTileIndex);     //index of tile E in tilemap

        let tileSize = this.bushes.getTileSize(); //gets the size of the tile

        /**
         * Now if a tile is collidable, draw a line from one space to the other, and check if that tile (AABB),
         *      intersects this line. If yes, The player is not visible. If no, continue to next tile. If all 
         *      collidable tiles do not intersect with this 'line between spaces', the player is visible, nothing is 
         *      blocking the players vision, so the player is visible! 
         */

        for(let col = startTileIndex.x; col <= endTileIndex.x; col++){  //starting from col of 'S' to col of <space>
            for(let row = startTileIndex.y; row<=endTileIndex.y; row++){    //starting from col of <space2> to col of E
                if(this.bushes.isTileCollidable(col,row)){
                    this.tilePos.x = col * tileSize.x + tileSize.x / 2; //x co-ordinate of collidable tile in webpage 
                    this.tilePos.y = row * tileSize.y + tileSize.y / 2; //y co-ordinate of collidable tile in webpage

                    this.colliderTileAABB.center = this.tilePos;    //sets the center of the AABB colliding shape as the position of the collidable
                    this.colliderTileAABB.halfSize = tileSize.scaled(0.5); //sets the half size to that of the collidable tile. 
                                                                        //After this, the .center and .half size fields 
                                                                        //make up the exact area the collidable area
                                                                        //at the exact tile location.

                    let hit = this.colliderTileAABB.intersectSegment(myPos,difference, this.zeroPos); //check if line segment betweem
                                                                                                        //player and this enemy intersects
                                                                                                        //the AABB i.e the collidable tile

                    if(hit !== null && myPos.distanceSqTo(hit.pos) < myPos.distanceSqTo(playerPos)){
                        return null;
                    }
                    
                }

            }
        }
        return playerPos;

    }

    getPlayerPosition() : Vec2{
        return this.isPlayerVisible(this.player.position);
    }


    update(deltaT: number): void {
        super.update(deltaT);

        if(this.plan.isEmpty()){
            //this.plan = this.planner.plan(Custom_Statuses.REACHED_GOAL, this.possibleActions, this.currentStatus, null);
        }
    }

    addAnimations(owner : AnimatedSprite){

        this.anime = new ProjectAnimationManager(owner,
            [{key : AState.Idle, state : Idle},{key: AState.Run, state : Run}],
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