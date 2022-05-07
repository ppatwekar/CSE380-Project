import Vec2 from "../../../../Wolfie2D/DataTypes/Vec2";
import Receiver from "../../../../Wolfie2D/Events/Receiver";
import CanvasNode from "../../../../Wolfie2D/Nodes/CanvasNode";
import Sprite from "../../../../Wolfie2D/Nodes/Sprites/Sprite";
import Scene from "../../../../Wolfie2D/Scene/Scene";
import { Custom_Events } from "../../../GameConstants";
import Stone from "./Stone";

export default class StoneController{
    private objectPools : Array<Stone>;
    scene : Scene;
    speed : number;
    reciever : Receiver;
    constructor(scene : Scene, speed : number){
        this.objectPools = new Array(20);
        this.scene = scene;
        this.speed = speed;
        this.initializePools();
        this.reciever = new Receiver();
        this.reciever.subscribe([Custom_Events.STONE_HIT_ENEMY,Custom_Events.STONE_HIT_PLAYER, Custom_Events.HIT_FAULTY_STONE]);
    }

    initializePools() : void{
        for(let i = 0; i<this.objectPools.length; i++){
            this.objectPools[i] = new Stone(this.scene,this.speed);
        }
        this.objectPools.sort((a,b) => a.owner.id - b.owner.id);
    }

    update(): void{
        this.handleEvents();

        for(let stone of this.objectPools){
            if(stone.owner.visible){
                if(stone.owner.collidedWithTilemap || stone.outOfBounds()){
                    stone.deactivate();
                }
                else{
                    stone.updatePosition();
                }
            }
            
        }
    }

    launchStone(startLocation : Vec2, directionOfMoveMent : Vec2){
        for(let stone of this.objectPools){
            if(!stone.owner.visible){
                stone.activate(startLocation,directionOfMoveMent);
                break;
            }
        }

    }

    private deactivateStone(index : number){
        this.objectPools[index].deactivate();
    }

    handleEvents(){
        while(this.reciever.hasNextEvent()){
            let event = this.reciever.getNextEvent();
            let node = this.scene.getSceneGraph().getNode(event.data.get("node"));
            let other = this.scene.getSceneGraph().getNode(event.data.get("other"));

            // for(let i = 0; i<this.objectPools.length; i++){
            //     if(this.objectPools[i].owner.id == node.id || this.objectPools[i].owner.id == other.id){
            //         this.deactivateStone(i);
            //     }
            // }

            let nodeIndex = this.isAStone(node);
            let otherIndex = this.isAStone(other);

            let stoneIndex = nodeIndex > -1 ? nodeIndex : otherIndex;
            this.deactivateStone(stoneIndex);

        }
    }

    isAStone(node : CanvasNode) : number{
        return this.binSearch(node.id);
    }

    binSearch(id : number) : number{
        let lo = 0;
        let hi = this.objectPools.length-1;
        while(lo <= hi && lo >=0 && hi <=this.objectPools.length-1){
            let mid = Math.floor((lo+hi)/2);

            if(this.objectPools[mid].owner.id === id){
                return mid;
            }
            else if( id < this.objectPools[mid].owner.id){
                hi = mid -1;
            }
            else{
                lo = mid + 1;
            }
        }
        return -1;
    }   

}