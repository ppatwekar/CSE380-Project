import Scene from "../../Wolfie2D/Scene/Scene";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import AABB from "../../Wolfie2D/DataTypes/Shapes/AABB";
import Circle from "../../Wolfie2D/DataTypes/Shapes/Circle";
import Color from "../../Wolfie2D/Utils/Color";
import Label from "../../Wolfie2D/Nodes/UIElements/Label";
import { UIElementType } from "../../Wolfie2D/Nodes/UIElements/UIElementTypes";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import BattlerAI from "../AI/BattlerAI";
import EnemyAI from "../AI/EnemyAI";
import PlayerController from "../AI/PlayerController";
import { Custom_Events, Custom_Names, Custom_Statuses } from "../GameConstants";
import InventoryManager from "../GameSystems/InventoryManager";
import Item from "../GameSystems/items/Item";
import Sprite from "../../Wolfie2D/Nodes/Sprites/Sprite";
import { GraphicType } from "../../Wolfie2D/Nodes/Graphics/GraphicTypes";
import Weapon from "../GameSystems/items/Weapon";
import WeaponType from "../GameSystems/items/WeaponTypes/WeaponType";
import RegistryManager from "../../Wolfie2D/Registry/RegistryManager";
import BattleManager from "../GameSystems/BattleManager";
import Input from "../../Wolfie2D/Input/Input";
import PositionGraph from "../../Wolfie2D/DataTypes/Graphs/PositionGraph";
import Navmesh from "../../Wolfie2D/Pathfinding/Navmesh";
import StoneController from "../GameSystems/Items/WeaponTypes/StoneController";
import AttackAction from "../AI/EnemyActions/Attack";
import Move from "../AI/EnemyActions/Move";
import Retreat from "../AI/EnemyActions/Retreat";
import RaccoonStoner from "../GameSystems/Items/WeaponTypes/RaccoonStoner";
import GameEvent from "../../Wolfie2D/Events/GameEvent";
import AudioManager, { AudioChannelType } from "../../Wolfie2D/Sound/AudioManager";
import MainMenu from "./MainMenu";
import GameOver from "./GameOver";
import Rect from "../../Wolfie2D/Nodes/Graphics/Rect";
import Layer from "../../Wolfie2D/Scene/Layer";
import Button from "../../Wolfie2D/Nodes/UIElements/Button";
import PauseManager from "../GameSystems/PauseManager";
import { GameEventType } from "../../Wolfie2D/Events/GameEventType";
import Healthpack from "../GameSystems/items/Healthpack";
import Food from "../GameSystems/Items/Food";

export default class GameLevel extends Scene {
    protected playerSpawn: Vec2; 
    protected player : AnimatedSprite;
    protected items : Array<Item> = new Array();
    protected yoyo : Sprite;
    protected healthDisplay: Label;
    protected goalDisplay: Label;
    protected battleManager : BattleManager;
    protected inCinematic: boolean = false;
    protected navGraph : PositionGraph;
    protected stoneController : StoneController;
    protected enemies : Array<AnimatedSprite>;
    protected audioManagerCtx: AudioManager;
    
    /* Pause Layer */
    protected isPaused: boolean;

    /* Pause Manager */
    protected pauseManager: PauseManager;
    protected menuState: string;

    protected mainLayer: Layer;

    protected nextLevel: new (...args: any) => GameLevel;
    
    loadScene(): void {
        this.load.audio("level1_music", "project_assets/music/theme_music.mp3");
        this.load.spritesheet("cat","project_assets/spritesheets/cat.json");
        this.load.spritesheet("raccoon","project_assets/spritesheets/raccoon.json")
        this.load.image("inventorySlot", "project_assets/sprites/inventory.png");
        this.load.image("yoyo","project_assets/item/yoyo.png");
        this.load.image("stone","project_assets/item/Stone.png");
        this.load.image("healthpack","project_assets/item/Healthpack.png");
        this.load.image("catFood","project_assets/item/CatFood.png");

    }

    startScene(): void{
        this.mainLayer = this.addLayer("primary",10);

        this.viewport.setZoomLevel(4);

        this.initializePlayer();
        this.subscribeToEvents();
        this.addUI();
        this.audioManagerCtx = AudioManager.getInstance();
        AudioManager.setVolume(AudioChannelType.MUSIC, 0.1);

        /* Pause layer */
        // this.initPause();
        this.pauseManager = new PauseManager(this);
        this.isPaused = false;

        this.emitter.fireEvent(GameEventType.PLAY_MUSIC, {key: "level1_music", loop: true, holdReference: true});
    }

    updateScene(deltaT: number): void{
        this.handleAllEvents();
        let currHealth = (<BattlerAI>this.player._ai).health;
        this.healthDisplay.text = "Health: " + currHealth;
        if (Input.isKeyJustPressed("escape")) {
            this.emitter.fireEvent(Custom_Events.PAUSE_EVENT, {ignoreClick: this.isPaused});
        }
        if (Input.isMouseJustPressed(0) && !Input.isMouseJustPressed(2)) {
            if (this.menuState !== null) {
                this.emitter.fireEvent(this.menuState);
            }
        }
    }

    handleAllEvents(){

        while(this.receiver.hasNextEvent()){
            let event = this.receiver.getNextEvent();
            this.handleEvent(event);
            
        }

        this.pauseManager.update();
        let response = this.pauseManager.handleAllEvents();
        if (response !== null && this.isPaused) {
            if (response === "mainMenuPause") {
                this.emitter.fireEvent(GameEventType.STOP_SOUND, {key: "level1_music"});
                this.sceneManager.changeToScene(MainMenu, {});
            } else if (response === "resume") {
                this.emitter.fireEvent(Custom_Events.PAUSE_EVENT);
            }
        }

    }

    handleEvent(event : GameEvent){
        switch(event.type){
            case Custom_Events.HIT_ENEMY:
                {
                    console.log("Hit!");
                }
                break;
            case Custom_Events.ENEMY_DEATH:
                {
                    
                    let asset = this.sceneGraph.getNode(event.data.get("enemy")._id);
                    let index = this.enemies.indexOf(event.data.get("enemy"));
                    this.enemies.splice(index,1);
                    //asset.destroy();
                    console.log("Enemy Died!");
                }
                break;
            case Custom_Events.HEAL:
                {
                    console.log("Healing!");
                }
                break;
            case Custom_Events.PLAYER_DAMAGED:
                {
                    console.log("Player damaged!");
                }
                break;
            case Custom_Events.PLAYER_DEATH:
                {
                    console.log("Player died!");
                    this.gameover();
                }
                break;
            case Custom_Events.COMPLETE_OBJECTIVE:
                {
                    if(this.nextLevel){
                        let sceneOptions = {
                            // TODO
                        }
                        this.sceneManager.changeToScene(this.nextLevel, {}, sceneOptions);
                    }
                }
                break;
            case Custom_Events.IN_CINEMATIC:
                {
                    this.inCinematic = event.data.get("inCinematic");
                    if (this.inCinematic) {
                        this.goalDisplay.visible = false;
                        this.healthDisplay.visible = false;
                    } else {
                        this.goalDisplay.visible = true;
                        this.healthDisplay.visible = true;
                    }
                }
                break;
            case Custom_Events.PAUSE_EVENT:
                {
                    this.isPaused = !this.isPaused;
                    if (this.isPaused) {
                        this.mainLayer.disable();
                        this.pauseManager.showPause();
                    } else {
                        this.mainLayer.enable();
                        this.pauseManager.unshowPause();
                    }
                }
                break;
        }
    }

    protected gameover(): void{
        console.log("change scene to gameover");
        this.receiver.destroy();
        this.sceneManager.changeToScene(GameOver);
    }

    protected setGoal(text: string, textColor = Color.WHITE, backgroundColor = Color.BLACK) : void {
        this.goalDisplay = <Label>this.add.uiElement(UIElementType.LABEL, "objectives", {position: this.viewport.getCenter().clone().scale(1/this.viewport.getZoomLevel()).sub(this.viewport.getCenter().clone().scale(0.19, 0.21) ), text: text});
        this.goalDisplay.textColor = textColor;
        this.goalDisplay.backgroundColor = backgroundColor;
    }

    protected addUI(){
        this.addUILayer("health");
        this.healthDisplay = <Label>this.add.uiElement(UIElementType.LABEL, "health", {position: new Vec2(this.viewport.getCenter().x * 0.05, this.viewport.getCenter().y * 0.485), text: "Health: " + (<BattlerAI>this.player._ai).health});
        this.healthDisplay.textColor = Color.BLACK;
        this.healthDisplay.backgroundColor = Color.WHITE;

        this.addUILayer("objectives");
        
    }

    initializePlayer() : void{

        let inventory = new InventoryManager(this, 5, "inventorySlot", new Vec2(16, this.viewport.getCenter().y * 0.45), 2, "slots1", "items1");
        let weapon = this.createWeapon("yoyo");
        this.player = this.add.animatedSprite("cat","primary");
        if(!this.playerSpawn){
            console.warn("Player spawn was never set - setting spawn to (0, 0)");
            this.playerSpawn = Vec2.ZERO;
        }
        this.player.position.copy(this.playerSpawn);
        console.log("player",this.player);
        this.player.addPhysics(new AABB(Vec2.ZERO, new Vec2(8,8))); // Regular Player AABB
        this.player.addAI(PlayerController,
            {
                speed : 100,
                health : 100,
                inventory : inventory,
                items : this.items,
                inputEnabled : true,
                range : 30,
                weapon : weapon
            });

        this.player.animation.play("IdleR");
        (<PlayerController>this.player._ai).inventory.setActive(true);
        this.player.setGroup("player");

        this.viewport.follow(this.player);

        
    }

    createWeapon(type: string): Weapon {
        let weaponType = <WeaponType>RegistryManager.getRegistry("weaponTypes").get(type);

        let sprite = this.add.sprite(weaponType.spriteKey, "primary");

        return new Weapon(sprite, weaponType, this.battleManager);
    }

    createHealthpack(position: Vec2): void {
        let sprite = this.add.sprite("healthpack", "primary");
        let healthpack = new Healthpack(sprite)
        healthpack.moveSprite(position);
        this.items.push(healthpack);
    }

    createFood(position : Vec2): void{
        let sprite = this.add.sprite("catFood","primary");
        let food = new Food(sprite);
        food.moveSprite(position);
        this.items.push(food);
        
    }

    spawnItems(data : Record<string,any>, layer? : string){
        for(let item of data.items){
            if(item.type === "healthpack"){
                // Create a healthpack
                this.createHealthpack(new Vec2(item.position[0]/2, item.position[1]/2));
            }
            else{
                this.createFood(new Vec2(item.position[0]/2, item.position[1]/2));
            }
        }
        

    }


    protected subscribeToEvents(){
        this.receiver.subscribe([
            Custom_Events.HIT_ENEMY,
            Custom_Events.ENEMY_DEATH,
            Custom_Events.HEAL,
            Custom_Events.PLAYER_DAMAGED,
            Custom_Events.PLAYER_DEATH,
            Custom_Events.PAUSE_EVENT,
            Custom_Events.COMPLETE_OBJECTIVE,
            Custom_Events.IN_CINEMATIC  
        ]);
    }

    getPlayer(){
        return this.player;
    }

    initializeWeapons() : void{
        let weaponData = this.load.getObject("weaponData");

        for(let i = 0; i < weaponData.numWeapons; i++){
            let weapon = weaponData.weapons[i];

            // Get the constructor of the prototype
            let constr = RegistryManager.getRegistry("weaponTemplates").get(weapon.weaponType);

            // Create a weapon type
            let weaponType = new constr();

            // Initialize the weapon type
            weaponType.initialize(weapon);

            // Register the weapon type
            RegistryManager.getRegistry("weaponTypes").registerItem(weapon.name, weaponType)

    }

    

    
    }


    createNavmesh(key : string) : void {
        let graphLayer = this.addLayer("graph");
        graphLayer.setHidden(true);

        let navmeshData = this.load.getObject(key);

        this.navGraph = new PositionGraph();

        for(let node of navmeshData["nodes"]){
            let position : Vec2 = new Vec2(node[0]/2,node[1]/2);

            this.navGraph.addPositionedNode(position);

            this.add.graphic(GraphicType.POINT, "graph", {position: position});
        }

        for(let edge of navmeshData["edges"]){
            this.navGraph.addEdge(edge[0],edge[1]);

            this.add.graphic(GraphicType.LINE,"graph",{start : this.navGraph.getNodePosition(edge[0]), end : this.navGraph.getNodePosition(edge[1])});
        }

        let navmesh = new Navmesh(this.navGraph);
        this.navManager.addNavigableEntity(Custom_Names.NAVMESH,navmesh);

    }


    initializeEnemyWeapons(enemies :AnimatedSprite[]) : void{
        const enemyData = this.load.getObject("enemyData");
        for(let i = 0; i<enemies.length; i++){
            let data = enemyData.enemies[i];
            let weapon = this.createWeapon(data.weapon);
            weapon.sprite.visible = false;
            (<EnemyAI>enemies[i]._ai).weapon = weapon;
            (<EnemyAI>enemies[i]._ai).inRange = weapon.type instanceof RaccoonStoner ? 128 : 32;
        }
    }

    getStonePool() : StoneController{
        return this.stoneController;
    }

    initializeEnemies(data : Record<string,any>) : void {
        const enemyData = data;
        //console.log(enemyData);

        this.enemies = new Array(enemyData.numEnemies);

        for(let i = 0; i<enemyData.numEnemies; i++){
            let data = enemyData.enemies[i];
            //console.log(data);

            this.enemies[i] = this.add.animatedSprite(data.type,"primary");
            this.enemies[i].position.set(data.position[0]/2, data.position[1]/2);
            this.enemies[i].animation.play("IdleR");

            this.enemies[i].addPhysics(new AABB(Vec2.ZERO, new Vec2(8,8)));
            if(data.route){
                data.route = data.route.map((index : number) => this.navGraph.getNodePosition(index));
            }
            else{
                data.guardPosition = new Vec2(data.guardPosition[0]/2, data.guardPosition[1]/2);
            }

            
            let enemyVision = 96;
            

            let statusArray: Array<string> = [];            
            let actionsDef = [new AttackAction(3, [Custom_Statuses.IN_RANGE], [Custom_Statuses.REACHED_GOAL], {inRange: 16}),
            new Move(4, [], [Custom_Statuses.IN_RANGE], {inRange: 100}), //100
            new Retreat(1, [Custom_Statuses.LOW_HEALTH, Custom_Statuses.CAN_RETREAT], [Custom_Statuses.REACHED_GOAL], {retreatDistance: 200})
            ];

            let enemyOptions = {
                defaultMode: data.mode,
                patrolRoute: data.route, // This only matters if they're a patroller
                guardPosition: data.guardPosition,  // This only matters if the're a guard
                player : this.player,
                goal: Custom_Statuses.REACHED_GOAL,
                status: statusArray,
                actions: actionsDef,
                inRange: 32, //128
                vision: enemyVision,
                health: 10,
                custID : data.custID
            }    
            this.enemies[i].addAI(EnemyAI,enemyOptions);
            this.enemies[i].setGroup("enemy");
            this.enemies[i].setTrigger("yoyo",Custom_Events.YOYO_HIT_ENEMY,null);
        }


    } 
}