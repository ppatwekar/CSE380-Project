import Circle from "../../../../Wolfie2D/DataTypes/Shapes/Circle";
import Vec2 from "../../../../Wolfie2D/DataTypes/Vec2";
import Emitter from "../../../../Wolfie2D/Events/Emitter";
import Receiver from "../../../../Wolfie2D/Events/Receiver";
import CanvasNode from "../../../../Wolfie2D/Nodes/CanvasNode";
import GameNode from "../../../../Wolfie2D/Nodes/GameNode";
import Sprite from "../../../../Wolfie2D/Nodes/Sprites/Sprite";
import Scene from "../../../../Wolfie2D/Scene/Scene";
import SceneGraph from "../../../../Wolfie2D/SceneGraph/SceneGraph";
import Timer from "../../../../Wolfie2D/Timing/Timer";
import { Custom_Events } from "../../../GameConstants";
import GameLevel from "../../../Scenes/GameLevel";
import playtest_scene from "../../../Scenes/playtest_scene";
import Stone from "./Stone";
import StoneController from "./StoneController";
import WeaponType from "./WeaponType";

export default class RaccoonStoner extends WeaponType{
    private hasBeenInitialisedBefore : boolean = false;
    private sceneGraph : SceneGraph;
    private reciever : Receiver;
    playerWasHit = false;
    private speed : number;
    emitter : Emitter;
    stonePool : StoneController;
    

    initialize(options: Record<string, any>): void {
        this.damage = options.damage;
        this.spriteKey = options.spriteKey;
        this.displayName = options.displayName;
        this.cooldown = options.cooldown; //will be set to zero as we want doAnimation be called every frame 
                                          //so we can update the positions of all other 'visible' rocks 
                                          //and we maintain an internal cooldown timer for shooting rocks.
        this.speed = options.speed;

    }
    doAnimation(attacker : GameNode, direction : Vec2): void {
        this.stonePool.launchStone(attacker.position.clone(),direction.clone());
    }


    createRequiredAssets(scene: playtest_scene): [StoneController] {
        if(this.hasBeenInitialisedBefore){
            return [this.stonePool];
        }
        else{
            this.sceneGraph = scene.getSceneGraph();
            this.hasBeenInitialisedBefore = true;
            this.reciever = new Receiver();
            this.reciever.subscribe([Custom_Events.STONE_HIT_PLAYER]);
            this.emitter = new Emitter();
            this.stonePool = scene.getStonePool();


            this.hasBeenInitialisedBefore = true;
            return [this.stonePool];
        }
    }

    handleEvents() : void{
        while(this.reciever.hasNextEvent()){
            let event = this.reciever.getNextEvent();
            
            if(event.type === Custom_Events.STONE_HIT_PLAYER){
                console.log("stone hit player!");
                this.playerWasHit = true; 
            } 
        }

    }

    

    hits(node: GameNode, ...args: any): boolean {
        //set in sceneoptions to only collide with player and enemy. 
        //if collide with enemy, just return back to object pool. Do not damage

        this.handleEvents();
        
        let copy = this.playerWasHit;
        this.playerWasHit = false;


        return copy;
        
    }
    clone(): WeaponType {
        let newType = new RaccoonStoner();
        newType.initialize({damage : this.damage, spriteKey : this.spriteKey, displayName : this.displayName, cooldown : this.cooldown, speed : this.speed});
        return newType;
    }
    
}

