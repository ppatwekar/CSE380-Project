/**
 * Not needed. Made this file just in case Yoyo.ts is not being initialised whiile initializing scene. 
 */


import AABB from "../../../../Wolfie2D/DataTypes/Shapes/AABB";
import Circle from "../../../../Wolfie2D/DataTypes/Shapes/Circle";
import Vec2 from "../../../../Wolfie2D/DataTypes/Vec2";
import Emitter from "../../../../Wolfie2D/Events/Emitter";
import Receiver from "../../../../Wolfie2D/Events/Receiver";
import CanvasNode from "../../../../Wolfie2D/Nodes/CanvasNode";
import GameNode from "../../../../Wolfie2D/Nodes/GameNode";
import { GraphicType } from "../../../../Wolfie2D/Nodes/Graphics/GraphicTypes";
import Line from "../../../../Wolfie2D/Nodes/Graphics/Line";
import AnimatedSprite from "../../../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Sprite from "../../../../Wolfie2D/Nodes/Sprites/Sprite";
import OrthogonalTilemap from "../../../../Wolfie2D/Nodes/Tilemaps/OrthogonalTilemap";
import Scene from "../../../../Wolfie2D/Scene/Scene";
import SceneGraph from "../../../../Wolfie2D/SceneGraph/SceneGraph";
import Color from "../../../../Wolfie2D/Utils/Color";
import { Custom_Events } from "../../../GameConstants";
import GameLevel from "../../../Scenes/GameLevel";
import Visiblity from "../../Visiblity";
import WeaponType from "./WeaponType";

export default class Yoyo2 extends WeaponType{

    private belongsTo : AnimatedSprite;
    private owner : Sprite;
    private reciever : Receiver;
    private goTo : Vec2;
    private speed : number;
    private hasReachedGoTo : boolean = false;
    private hasReachedPlayer : boolean = true;
    private range : number;
    private directionVec :  Vec2;
    private velocity : Vec2;
    private collidableMap : OrthogonalTilemap;
    private sceneGraph : SceneGraph;
    private enemiesHit : Array<CanvasNode>;
    private beenInitialisedBefore : boolean;
    private emitter : Emitter;


    initialize(options: Record<string, any>): void {
        this.damage = options.damage;
        this.cooldown = 0; //the yoyo itself takes time to come back
        this.spriteKey = options.spriteKey;
        this.speed = options.speed;
        this.range = options.range;
        this.directionVec = Vec2.ZERO;
        this.beenInitialisedBefore = false;
        this.enemiesHit = [];
        

    }

    //acts like update()
    doAnimation(attacker : GameNode, direction : Vec2): void {
        //do the whole go back and stuff basically "update" here
        //acts like moveTo
        this.checkEnemiesHit();
        

        if(!this.hasReachedGoTo && this.hasReachedPlayer){
            this.owner.position = this.belongsTo.position.clone();

            if(Visiblity.positionsVisible(this.owner.position.clone(),direction,this.collidableMap)){
                this.owner.position = this.belongsTo.position.clone();
                this.owner.visible = true;
                this.goTo = direction.clone();
                this.directionVec = direction.clone().sub(this.owner.position).normalize();
                this.hasReachedPlayer = false;
                this.velocity = this.directionVec.scaled(this.speed);
            }
            else{
                this.emitter.fireEvent(Custom_Events.YOYO_RETURNED);
            }

        }
        this.update();
        
    }

    checkEnemiesHit(){
        if(!this.hasReachedPlayer && !this.hasReachedGoTo){
            while(this.reciever.hasNextEvent()){
                let event = this.reciever.getNextEvent();
                switch(event.type){
                    case Custom_Events.YOYO_HIT_ENEMY:
                        {
                            let node = this.sceneGraph.getNode(event.data.get("node"));
                            let other = this.sceneGraph.getNode(event.data.get("other"));

                            node === this.owner ? this.addToEnemiesHit(other) : this.addToEnemiesHit(node);

                            this.hasReachedGoTo = true;
                            this.directionVec = this.belongsTo.position.clone().sub(this.owner.position).normalize();
                            this.velocity = this.directionVec.scaled(this.speed);
                            console.log("HIT!!");
                        }
                }
            }
        }
    }

    addToEnemiesHit(node : CanvasNode){
        for(let enemy of this.enemiesHit){
            if(enemy.id == node.id){
                return;
            }
        }
        this.enemiesHit.push(node);
    }
    

    createRequiredAssets(scene: GameLevel): [Sprite] {
        if(this.beenInitialisedBefore){
            return [this.owner];
        }
        else{
            this.belongsTo = scene.getPlayer();
            this.owner = scene.add.sprite("yoyo","primary");
            this.owner.visible = true;
            this.owner.addPhysics(new Circle(Vec2.ZERO,3));
            this.owner.setGroup("yoyo");
            this.owner.setTrigger("enemy", Custom_Events.YOYO_HIT_ENEMY, null);
            this.owner.position = this.belongsTo.position.clone();
            this.reciever = new Receiver();
            this.reciever.subscribe(Custom_Events.YOYO_HIT_ENEMY);
            this.collidableMap = <OrthogonalTilemap>scene.getLayer("Bushes").getItems()[0];
            this.sceneGraph = scene.getSceneGraph();
            this.beenInitialisedBefore = true;
            this.emitter = new Emitter();

            return [this.owner];
        }

        
    }

    //acts like handleEvent()
    hits(node: GameNode, ...args: any): boolean {
        //setup a reciever
        //check here if the reciever recieved the Custom_Events.YOYO_HIT_ENEMY
        // if the node in the event, corresponds to the GameNode 
        //that is the passsed parameter then return true, else false
        //check GameNode.id maybe.

        for(let i = 0; i<this.enemiesHit.length; i++){
            if(this.enemiesHit[i].id == node.id){
                //delete that enemy
                this.enemiesHit.splice(i,1);
                return true;
            }
        }
        
        return false;
    }

    clone(): WeaponType {
        let newType = new Yoyo2();
        newType.initialize({damage : this.damage, spriteKey : this.spriteKey, belongsTo : this.belongsTo, speed : this.speed, range : this.range});
        return newType;
        
    }

    update(): void {
        //check for events such as if collided with a player!
        //have enemyAI send out an event (both for yoyo and enemyAI (to reduce raccoon health)
        //) if it collides with yoyo.
    
        

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
    reachedGoToOrMaxLength() : boolean{
        return this.owner.position.distanceTo(this.belongsTo.position) >= this.range  || this.owner.position.distanceTo(this.goTo) < 0.1 || this.owner.position.equals(this.goTo);
    }

    goBack(){
        if(this.owner.position.distanceTo(this.belongsTo.position) < 15){
            this.owner.position = this.belongsTo.position.clone();
            this.hasReachedPlayer = true;
            this.hasReachedGoTo = false;
            this.owner.visible = false;
            this.enemiesHit = [];
            this.emitter.fireEvent(Custom_Events.YOYO_RETURNED);
        }
        else{
            
            this.directionVec = this.belongsTo.position.clone().sub(this.owner.position).normalize();
            this.velocity = this.directionVec.scaled(this.speed);
            this.owner.move(this.velocity);
            //}
        }
    }
}