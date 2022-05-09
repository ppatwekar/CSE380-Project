import PositionGraph from "../../Wolfie2D/DataTypes/Graphs/PositionGraph";
import Map from "../../Wolfie2D/DataTypes/Map";
import AABB from "../../Wolfie2D/DataTypes/Shapes/AABB";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../../Wolfie2D/Events/GameEvent";
import { GameEventType } from "../../Wolfie2D/Events/GameEventType";
import Receiver from "../../Wolfie2D/Events/Receiver";
import { GraphicType } from "../../Wolfie2D/Nodes/Graphics/GraphicTypes";
import Rect from "../../Wolfie2D/Nodes/Graphics/Rect";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Sprite from "../../Wolfie2D/Nodes/Sprites/Sprite";
import OrthogonalTilemap from "../../Wolfie2D/Nodes/Tilemaps/OrthogonalTilemap";
import Scene from "../../Wolfie2D/Scene/Scene";
import Timer from "../../Wolfie2D/Timing/Timer";
import Color from "../../Wolfie2D/Utils/Color";
import BattlerAI from "../AI/BattlerAI";
import EnemyAI from "../AI/EnemyAI";
import PlayerController from "../AI/PlayerController";
import { Custom_Events } from "../GameConstants";
import BattleManager from "../GameSystems/BattleManager";
import HighLight from "../GameSystems/HighLight";
import Item from "../GameSystems/items/Item";
import StoneController from "../GameSystems/Items/WeaponTypes/StoneController";
import GameLevel from "./GameLevel";

export default class Level_Prisoner extends GameLevel{
    private bushes : OrthogonalTilemap;
    private graph : PositionGraph;
    private logo : Sprite;
    // A list of items
    protected h1 : HighLight;
    private levelEndArea : Rect;
    private rec : Receiver;

    

    loadScene(): void {
        super.loadScene(); // Loads audio
        this.load.tilemap("prisonerLevel","project_assets/tilemaps/Level_Prisoner_tilemap/LevelMap.json");
        this.load.object("navmesh","project_assets/data/Level_Prisoner_data/navmesh.json");
        this.load.object("enemyData","project_assets/data/Level_Prisoner_data/enemy.json");
        this.load.object("weaponData","project_assets/data/weaponData.json");
        this.load.image("breakable","project_assets/data/Level_Prisoner_data/breakable.png");
        this.load.object("items","project_assets/data/Level_Prisoner_data/items.json");

    }

    startScene(): void {
        this.playerSpawn = new Vec2(344,264);
        let tilemapLayers = this.add.tilemap("prisonerLevel",new Vec2(0.5,0.5));
        this.bushes = <OrthogonalTilemap>tilemapLayers[1].getItems()[0];

        let tilemapSize : Vec2 = this.bushes.size.scaled(0.5);
        this.viewport.setBounds(0,0,tilemapSize.x,tilemapSize.y);

        this.initializeWeapons();
        super.startScene();
        this.viewport.setZoomLevel(4);
        this.createNavmesh("navmesh");
        this.initializeEnemies(this.load.getObject("enemyData"));

        this.battleManager = new BattleManager();
        this.battleManager.setPlayers([<BattlerAI>this.player._ai]);
        this.battleManager.setEnemies(this.enemies.map(enemy => <BattlerAI>enemy._ai));

        (<PlayerController>this.player._ai).weapon = this.createWeapon("yoyo");

        (<PlayerController>this.player._ai).enemies = this.enemies;

        this.initializeEnemyWeapons(this.enemies);
        this.h1 = new HighLight();

        this.setGoal("Escape The Raccoon Prison!",Color.WHITE, Color.BLACK, new Vec2(60,10));
        // this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: "level1_music", loop: true, holdReference: true});

        let weaponData = this.load.getObject("weaponData");

        this.stoneController = new StoneController(this,weaponData.weapons[2].speed); 

        this.setCustomProperties();

        this.addLevelEnd(new Vec2(608,1808),new Vec2(12,12));
        this.rec = new Receiver();
        this.rec.subscribe(Custom_Events.PLAYER_ENTERED_LEVEL_END);

        this.spawnItems(this.load.getObject("items"));



    }

    

    manageEvents(){
        while(this.rec.hasNextEvent()){
            let event = this.rec.getNextEvent();
            switch(event.type){
                case Custom_Events.PLAYER_ENTERED_LEVEL_END:
                    {
                        this.player.position = new Vec2(344,264);
                        this.setGoal("Oops! You chose the wrong tile and Teleported Back to the Beginning",Color.WHITE, Color.BLACK, new Vec2(115,10));
                    }
            }
        }
    }

    updateScene(deltaT: number): void {
        super.updateScene(deltaT);
        this.h1.checkClosestEnemies(this.enemies, this.player);
        this.stoneController.update();
        BreakableTile.updateFaultyTiles();
        this.manageEvents();
        
    }

    

    setCustomProperties() : void{
        for(let enemy of this.enemies){
            if((<EnemyAI>enemy._ai).custID === "strongEnemy1" || (<EnemyAI>enemy._ai).custID === "strongEnemy2"){
                (<EnemyAI>enemy._ai).inRange = 500;
                (<EnemyAI>enemy._ai).speed = 50;
                (<EnemyAI>enemy._ai).vision = 500;
            }
        }

        BreakableTile.makeTiles(new Vec2(408,920),new Vec2(6,0),this);
        
    }

    addLevelEnd(position : Vec2, size : Vec2){
        this.levelEndArea = <Rect>this.add.graphic(GraphicType.RECT,"primary",{position : position, size : size});
        this.levelEndArea.addPhysics(undefined, undefined, false, true);
        this.levelEndArea.setTrigger("player", Custom_Events.PLAYER_ENTERED_LEVEL_END, null);
        this.levelEndArea.color = new Color(1,0,0,1);

    }

    
    

    
}

class BreakableTile{
    static faultyTiles : Array<BreakableTile> = new Array();
    static removeTiles : Array<BreakableTile> = new Array();
    lives : number;
    owner : Sprite;
    reciever : Receiver;
    scene : Scene;

    constructor(position : Vec2, scene : Scene, lives? : number){
        this.owner = scene.add.sprite("breakable","primary");
        this.owner.position = position;
        this.owner.scale = new Vec2(0.5,0.5);
        this.owner.addPhysics(new AABB(position.clone(),new Vec2(8,8)));
        this.owner.setGroup("faultyTile");
        this.owner.setTrigger("yoyo",Custom_Events.HIT_FAULTY_YOYO,null);
        this.owner.setTrigger("stone",Custom_Events.HIT_FAULTY_STONE,null);
        BreakableTile.faultyTiles.push(this);
        this.reciever = new Receiver();
        this.reciever.subscribe([Custom_Events.HIT_FAULTY_STONE, Custom_Events.HIT_FAULTY_YOYO]);
        this.scene = scene;
        //this.lives = 10;
        lives ? this.lives = lives : this.lives = 10;
    }

    handleEvents(){
        while(this.reciever.hasNextEvent()){
            let hasHit = false;
            let event = this.reciever.getNextEvent();
            switch(event.type){
                case Custom_Events.HIT_FAULTY_STONE:
                    {
                        console.log(event.type);
                        let node = this.scene.getSceneGraph().getNode(event.data.get("node"));
                        let other = this.scene.getSceneGraph().getNode(event.data.get("other"));

                        node.id == this.owner.id || other.id == this.owner.id ? hasHit = true : hasHit = false;
                    }
                case Custom_Events.HIT_FAULTY_YOYO : {
                    console.log(event.type);
                        let node = this.scene.getSceneGraph().getNode(event.data.get("node"));
                        let other = this.scene.getSceneGraph().getNode(event.data.get("other"));

                        node.id == this.owner.id || other.id == this.owner.id ? hasHit = true : hasHit = false;

                }
            }

            if(hasHit){
                --this.lives;
            } 
        }
    }

    update(){
        this.handleEvents();
        if(this.lives <=0){
            BreakableTile.removeTiles.push(this);
        }
    }


    static updateFaultyTiles(){
        BreakableTile.faultyTiles.forEach(tile => tile.update());
        BreakableTile.removeTiles.forEach(tile => {
            let index = BreakableTile.faultyTiles.indexOf(tile);
            BreakableTile.faultyTiles.splice(index,1);
            tile.owner.visible = false;
            tile.owner.destroy();
        });

        BreakableTile.removeTiles = [];

    }

    static makeTiles(start : Vec2, count : Vec2, scene : Scene, lives? : number){
        if(count.x > 0 && count.y > 0){
            for(let i = 0; i<count.x; i++){
                for(let j = 0; j<count.y; j++){
                    let currPos = new Vec2(start.x + i * 16, start.y + i * 16);
                    new BreakableTile(currPos,scene, lives);
                }
            }

        }
        else if(count.x > 0){
            for(let i = 0; i<count.x; i++){
                let currPos = new Vec2(start.x + i * 16, start.y);
                new BreakableTile(currPos,scene, lives);
            }
        }
        else{
            for(let i = 0; i<count.y; i++){
                let currPos = new Vec2(start.x, start.y + i * 16);
                new BreakableTile(currPos,scene, lives);
            }

        }
    }

    
}