import ControllerAI from "../../Wolfie2D/AI/ControllerAI"
import AABB from "../../Wolfie2D/DataTypes/Shapes/AABB";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import Emitter from "../../Wolfie2D/Events/Emitter";
import GameEvent from "../../Wolfie2D/Events/GameEvent";
import Receiver from "../../Wolfie2D/Events/Receiver";
import GameNode from "../../Wolfie2D/Nodes/GameNode";
import { GraphicType } from "../../Wolfie2D/Nodes/Graphics/GraphicTypes";
import Line from "../../Wolfie2D/Nodes/Graphics/Line";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Sprite from "../../Wolfie2D/Nodes/Sprites/Sprite";
import OrthogonalTilemap from "../../Wolfie2D/Nodes/Tilemaps/OrthogonalTilemap";
import Color from "../../Wolfie2D/Utils/Color";
import { Custom_Events } from "../GameConstants";
export default class YoyoController extends ControllerAI{

    belongsTo : AnimatedSprite //cat player
    speed : number;
    owner : Sprite
    goTo : Vec2
    hasReachedGoTo : boolean = false;
    hasReachedPlayer : boolean = true;
    range : number;
    directionVec :  Vec2;
    reciever : Receiver;
    emitter : Emitter;
    enemies : AnimatedSprite[]
    velocity : Vec2;

    initializeAI(owner: GameNode, options: Record<string, any>): void {
        this.owner = <Sprite>owner;
        this.speed = options.speed;
        this.belongsTo = options.belongsTo;
        this.owner.position = this.belongsTo.position.clone();
        this.range = options.range;
        this.directionVec = Vec2.ZERO;
        this.reciever = new Receiver();
        this.emitter = new Emitter();

        this.bushes = <OrthogonalTilemap>this.owner.getScene().getLayer("Bushes").getItems()[0];

        this.reciever.subscribe([Custom_Events.YOYO_HIT_PLAYER, Custom_Events.YOYO_HIT_ENEMY]);
        
        

    }

    activate(options: Record<string, any>): void {
    }

    handleEvent(event: GameEvent): void {
        switch(event.type){
            case Custom_Events.YOYO_HIT_PLAYER:
                this.owner.position = this.belongsTo.position.clone();
                break;
                /*

            case Custom_Events.YOYO_HIT_ENEMY:
                this.hasReachedGoTo = true;
                this.directionVec.scale(-1);
                this.velocity = this.directionVec.scaled(this.speed);
                break;
                */
        }

    }

    //if goTo is not equal to position of cat player, that means we have to move to goTo
    //if we reached goTo, change goTo to location of cat player 
    // if reachedGoToOrMaxLength, then goBack()
    //
    update(deltaT: number): void {
        //check for events such as if collided with a player!
        //have enemyAI send out an event (both for yoyo and enemyAI (to reduce raccoon health)
        //) if it collides with yoyo.
        while(this.reciever.hasNextEvent()){
            this.handleEvent(this.reciever.getNextEvent());
        }
        

        if(!this.hasReachedPlayer){
            if(!this.hasReachedGoTo){
                if(this.reachedGoToOrMaxLength() || this.owner.collidedWithTilemap){
                    this.hasReachedGoTo = true;
                    this.directionVec.scale(-1);
                    this.velocity = this.directionVec.scaled(this.speed);
                }
                else{
                    this.owner.move(this.velocity); //.scale is being called again and again so speed keeps increasing.
                }
            }
            else{
                this.goBack();
            }
            this.drawString();

        }
        //this.owner.position = this.belongsTo.position.clone();

    }

    private yoyoString : Line;
    drawString(){
        if(this.yoyoString){
            this.yoyoString.destroy();
            this.yoyoString = null;
        }

        this.yoyoString = <Line>this.owner.getScene().add.graphic(GraphicType.LINE,"primary",{start : this.belongsTo.position.clone(), end : this.owner.position.clone()});
        this.yoyoString.color = Color.WHITE;
    }

    hasReturned(){
        //return this.owner.position.equals(this.belongsTo.position);
        return this.hasReachedGoTo == false && this.hasReachedPlayer == true;
    }

    /**
     * 
     * Check if inputed position is visible to the yoyo, if yes, change goTo to position. 
     */
    moveTo(position : Vec2){
        if(this.locationIsVisible(position)){
            this.goTo = position.clone();
            this.directionVec = position.clone().sub(this.owner.position).normalize();
            this.hasReachedPlayer = false;
            this.velocity = this.directionVec.scaled(this.speed);
        }
    }

    reachedGoToOrMaxLength() : boolean{
        return this.owner.position.distanceTo(this.belongsTo.position) >= this.range  || this.owner.position.distanceTo(this.goTo) < 0.1 || this.owner.position.equals(this.goTo);
    }

    private zeroPos : Vec2 = Vec2.ZERO;
    private startTileIndex : Vec2 = Vec2.ZERO;
    private endTileIndex : Vec2 = Vec2.ZERO;
    private bushes : OrthogonalTilemap;
    private tilePos: Vec2 = Vec2.ZERO;
    private colliderTileAABB : AABB = new AABB();

    locationIsVisible(position : Vec2) : boolean{
        let myPos = this.owner.position.clone();
        let difference = position.clone().sub(myPos);

        this.startTileIndex.x = Math.min(myPos.x, position.x);
        this.startTileIndex.y = Math.min(myPos.y, position.y);
        this.endTileIndex.x = Math.max(myPos.x, position.x);
        this.endTileIndex.y = Math.max(myPos.y, position.y);

        let startTileIndex = this.bushes.getColRowAt(this.startTileIndex);
        let endTileIndex = this.bushes.getColRowAt(this.endTileIndex);

        let tileSize = this.bushes.getTileSize(); //gets the size of the tile

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

                    if(hit !== null && myPos.distanceSqTo(hit.pos) < myPos.distanceSqTo(position)){
                        return false;
                    }
                    
                }

            }
        }
        return true;


    }

    //use same goTo vector but reverse direction.
    goBack(){
        if(this.owner.position.distanceTo(this.belongsTo.position) < 15){
            this.owner.position = this.belongsTo.position.clone();
            this.hasReachedPlayer = true;
            this.hasReachedGoTo = false;
        }
        else{
            //if(this.owner.boundary.overlaps(this.belongsTo.boundary)){
             //   console.log("touched!!")
            //    this.owner.position = this.belongsTo.position.clone();
            //}
            //else{
            this.owner.move(this.velocity);
            //}
        }
    }

    checkCollisionWithEnemies() : boolean{
        let touched = false;
        for(let enemy of this.enemies){
            if(enemy.boundary.touchesAABB(this.owner.boundary)){
                touched = true;
                this.emitter.fireEvent("yoyoToEnemy",{enemy : enemy});
            }
        }
        return touched;
    }

}