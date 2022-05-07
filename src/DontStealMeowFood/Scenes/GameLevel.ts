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

export default class GameLevel extends Scene {
    protected playerSpawn: Vec2; 
    protected player : AnimatedSprite;

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
    private pauseLayer: Layer;
    private control: Layer;
    private help: Layer;

    protected mainLayer: Layer;

    protected nextLevel: new (...args: any) => GameLevel;
    
    startScene(): void{
        this.mainLayer = this.addLayer("primary",10);

        this.viewport.setZoomLevel(4);

        this.initializePlayer();
        this.subscribeToEvents();
        this.addUI();
        this.audioManagerCtx = AudioManager.getInstance();
        AudioManager.setVolume(AudioChannelType.MUSIC, 0.1);

        /* Pause layer */
        this.initPause();
        this.isPaused = false;
    }

    updateScene(deltaT: number): void{
        this.handleAllEvents();
        let currHealth = (<BattlerAI>this.player._ai).health;
        this.healthDisplay.text = "Health: " + currHealth;
        if (Input.isKeyJustPressed("escape")) {
            this.emitter.fireEvent(Custom_Events.IN_CINEMATIC, {inCinematic: !this.inCinematic});
            this.emitter.fireEvent(Custom_Events.PAUSE_EVENT);
        }
    }

    handleAllEvents(){

        while(this.receiver.hasNextEvent()){
            let event = this.receiver.getNextEvent();
            this.handleEvent(event);
            
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
                    // asset.destroy();
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
                        this.showPause();
                    } else {
                        console.log("Ushow!");
                        this.unshowPause();
                    }
                }
                break;
            case "pauseMenu":
                {
                    this.showPause();
                    break;
                }
            case "controls":
                {
                    this.showControls();
                }
                break;
            case "help":
                {
                    this.showHelp();
                }
                break;
            case "mainMenu":
                {
                    this.sceneManager.changeToScene(MainMenu);
                }
                break;
            case "resume":
                console.log("SEEING RESUME!");
                this.emitter.fireEvent(Custom_Events.PAUSE_EVENT);
                break;
        }

        if (event.type === "resume") {
            console.log("SEEING RESUME WITH IF...");
        }
    }

    protected gameover(): void{
        console.log("change scene to gameover");
        this.sceneManager.changeToScene(GameOver);
    }

    protected setGoal(text: string, textColor = Color.WHITE, backgroundColor = Color.BLACK) : void {
        this.goalDisplay = <Label>this.add.uiElement(UIElementType.LABEL, "objectives", {position: new Vec2(40, 10), text: text});
        this.goalDisplay.textColor = textColor;
        this.goalDisplay.backgroundColor = backgroundColor;
    }

    protected addUI(){
        this.addUILayer("health");
        this.healthDisplay = <Label>this.add.uiElement(UIElementType.LABEL, "health", {position: new Vec2(this.viewport.getCenter().x * 0.05, this.viewport.getCenter().y * 0.485), text: "Health: " + (<BattlerAI>this.player._ai).health});
        this.healthDisplay.textColor = Color.BLACK;
        this.healthDisplay.backgroundColor = Color.WHITE;

        // Add a UI for Goals
        this.addUILayer("objectives");
        // this.goalDisplay = <Label>this.add.uiElement(UIElementType.LABEL, "objectives", {position: new Vec2(40, 10), text: "Objective: Playtest!"});
        // this.goalDisplay.textColor = Color.WHITE;
        // this.goalDisplay.backgroundColor = Color.BLACK;
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
        this.player.addPhysics(new AABB(Vec2.ZERO, new Vec2(8,8))); // Regular Player AABB
        this.player.addAI(PlayerController,
            {
                speed : 100,
                health : 100,
                inventory : inventory,
                items : null,
                inputEnabled : true,
                range : 30,
                weapon : weapon
            });

        this.player.animation.play("IdleR");
        (<PlayerController>this.player._ai).inventory.setActive(true);
        this.player.setGroup("player");

        this.viewport.follow(this.player);

        // this.yoyo = this.add.sprite("yoyo","primary");
        // this.yoyo.visible = true;
        // this.yoyo.addPhysics(new Circle(Vec2.ZERO,3));
        // this.yoyo.addAI(YoyoController,
        //     {
        //         speed : 3,
        //         range : 80,
        //         belongsTo : this.player,
                
        //     });

        // (<PlayerController>this.player._ai).yoyo = this.yoyo;
        // (<PlayerController>this.player._ai).yoyo.visible = false;
        // this.yoyo.setGroup("yoyo");
        // this.yoyo.setTrigger("enemy",Custom_Events.YOYO_HIT_ENEMY,null);
        // this.yoyo.setTrigger("player",Custom_Events.YOYO_HIT_PLAYER,null);
        
    }

    createWeapon(type: string): Weapon {
        let weaponType = <WeaponType>RegistryManager.getRegistry("weaponTypes").get(type);

        let sprite = this.add.sprite(weaponType.spriteKey, "primary");

        return new Weapon(sprite, weaponType, this.battleManager);
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
            Custom_Events.IN_CINEMATIC,
            "pauseMenu",
            "controls",
            "help",
            "mainMenu",
            "resume"
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

    //(<YoyoController>this.yoyo._ai).enemies = this.enemies;

}

initPause() {
        /* Add a pauseMenu Layer */
        const layerName = "pauseMenu";
        this.pauseLayer = this.addUILayer(layerName);
        this.pauseLayer.setDepth(105);
        // let l = <Rect>this.add.graphic(GraphicType.RECT, layerName, {position: new Vec2(this.viewport.getCenter().x / this.viewport.getZoomLevel(), this.viewport.getCenter().y / this.viewport.getZoomLevel()), size: this.viewport.getHalfSize().clone().scale(1.85)});
        // l.setColor(Color.BLACK);
        // l.alpha = 1;
    
        let resume = <Button>this.add.uiElement(UIElementType.BUTTON, layerName, {position: this.viewport.getCenter().clone().scale(1/this.viewport.getZoomLevel()).sub(new Vec2(0, 50)), text: "Resume"});
        resume.onClickEventId = "resume";

        let control = <Label>this.add.uiElement(UIElementType.LABEL, layerName, {position: this.viewport.getCenter().clone().scale(1/this.viewport.getZoomLevel()).sub(new Vec2(0, 0)), text: "Controls"});
        control.onClickEventId = "controls";

        let helpButton = <Label>this.add.uiElement(UIElementType.LABEL, layerName, {position: this.viewport.getCenter().clone().scale(1/this.viewport.getZoomLevel()).sub(new Vec2(0, -25)), text: "Help"});
        helpButton.onClickEventId = "help";

        let menu = <Label>this.add.uiElement(UIElementType.LABEL, layerName, {position: this.viewport.getCenter().clone().scale(1/this.viewport.getZoomLevel()).sub(new Vec2(0, -50)), text: "Main Menu"});
        menu.onClickEventId = "mainMenu";

        resume.backgroundColor = control.backgroundColor = helpButton.backgroundColor = menu.backgroundColor = Color.BLACK;
        resume.textColor = control.textColor = helpButton.textColor = menu.textColor = Color.WHITE;

        resume.onClick = () => {
            console.log("CLICKED RESUME!");
        }
        resume.onEnter = () => {
            console.log("ENTERED RESUME");
            resume.backgroundColor = Color.WHITE;
            resume.textColor = Color.BLACK;
        };
        resume.onLeave = () => {
            resume.backgroundColor = Color.BLACK;
            resume.textColor = Color.WHITE;
        };

        control.onEnter = () => {
            control.backgroundColor = Color.WHITE;
            control.textColor = Color.BLACK;
        };
        control.onLeave = () => {
            control.backgroundColor = Color.BLACK;
            control.textColor = Color.WHITE;
        };

        helpButton.onEnter = () => {
            helpButton.backgroundColor = Color.WHITE;
            helpButton.textColor = Color.BLACK;
        };
        helpButton.onLeave = () => {
            helpButton.backgroundColor = Color.BLACK;
            helpButton.textColor = Color.WHITE;
        };

        menu.onEnter = () => {
            menu.backgroundColor = Color.WHITE;
            menu.textColor = Color.BLACK;
        };
        menu.onLeave = () => {
            menu.backgroundColor = Color.BLACK;
            menu.textColor = Color.WHITE;
        };

        this.controlsScreen();
        this.helpScreen();

        this.unshowPause();
}

controlsScreen() {
    this.control = this.addUILayer("control");
    this.control.setHidden(true);
    
    const controlHeader = <Label>this.add.uiElement(UIElementType.LABEL, "control", {position: this.viewport.getCenter().clone().scale(1/this.viewport.getZoomLevel()).sub(new Vec2(0, 300)), text: "Controls"});
    controlHeader.textColor = Color.WHITE;

    const controls1 = "WASD | Move";
    const controls2 = "E | Item Pick Up";
    const controls3 = "Q | Drop Current Item";
    const controls4 = "1/2/3/4/5 or Mouse Wheel Up/Down | Equip Inventory Item";

    const cline1 = <Label>this.add.uiElement(UIElementType.LABEL, "control", {position: this.viewport.getCenter().clone().scale(1/this.viewport.getZoomLevel()).sub(new Vec2(0, 100)), text: controls1});
    const cline2 = <Label>this.add.uiElement(UIElementType.LABEL, "control", {position: this.viewport.getCenter().clone().scale(1/this.viewport.getZoomLevel()).sub(new Vec2(0, 50)), text: controls2});
    const cline3 = <Label>this.add.uiElement(UIElementType.LABEL, "control", {position: this.viewport.getCenter().clone().scale(1/this.viewport.getZoomLevel()), text: controls3});
    const cline4 = <Label>this.add.uiElement(UIElementType.LABEL, "control", {position: this.viewport.getCenter().clone().scale(1/this.viewport.getZoomLevel()).sub(new Vec2(0, -50)), text: controls4});

    cline1.textColor = cline2.textColor = cline3.textColor = cline4.textColor = Color.WHITE;

    // Back Button
    const controlBack = this.add.uiElement(UIElementType.BUTTON, "control", {position: this.viewport.getCenter().clone().scale(1/this.viewport.getZoomLevel()).sub(new Vec2(-25, 0)), text: "Back"});
    controlBack.size.set(200, 50);
    controlBack.borderWidth = 2;
    controlBack.borderColor = Color.WHITE;
    controlBack.backgroundColor = Color.TRANSPARENT;
    controlBack.onClickEventId = "pauseMenu";
}

helpScreen() {
    this.help = this.addUILayer("help");
    this.help.setHidden(true);

    const aboutHeader = <Label>this.add.uiElement(UIElementType.LABEL, "help", {position: this.viewport.getCenter().clone().scale(1/this.viewport.getZoomLevel()).sub(new Vec2(0, 250)), text: "Help"});
    aboutHeader.textColor = Color.WHITE;

    // Resolved: Give yourself credit and add your name to the about page!
    const text1 = "Story:";
    const text2 = "Vanilla the cat had been living peacefully her entire life," ;
    const text2s = "but recently a gang of raccoons invaded her living space and stole all her cat food.";
    const text2t = "Vanilla decides to take revenge on the raccoons and get her food back";
    const text3 = "Created by Jun Yi Lin, Tahmidul Alam, and Prathamesh Patwekar";

    const line1 = <Label>this.add.uiElement(UIElementType.LABEL, "help", {position: this.viewport.getCenter().clone().scale(1/this.viewport.getZoomLevel()).sub(new Vec2(0, 150)), text: text1});
    const line2 = <Label>this.add.uiElement(UIElementType.LABEL, "help", {position: this.viewport.getCenter().clone().scale(1/this.viewport.getZoomLevel()).sub(new Vec2(0, 100)), text: text2});
    const line2s = <Label>this.add.uiElement(UIElementType.LABEL, "help", {position: this.viewport.getCenter().clone().scale(1/this.viewport.getZoomLevel()).sub(new Vec2(0, 50)), text: text2s});
    const line2t = <Label>this.add.uiElement(UIElementType.LABEL, "help", {position: this.viewport.getCenter().clone().scale(1/this.viewport.getZoomLevel()), text: text2t});
    const line3 = <Label>this.add.uiElement(UIElementType.LABEL, "help", {position: this.viewport.getCenter().clone().scale(1/this.viewport.getZoomLevel()).sub(new Vec2(0, -50)), text: text3});

    line1.textColor = Color.WHITE;
    line2.textColor = Color.WHITE;
    line2s.textColor = Color.WHITE;
    line2t.textColor = Color.WHITE;
    line3.textColor = Color.YELLOW;

    const aboutBack = this.add.uiElement(UIElementType.BUTTON, "help", {position: this.viewport.getCenter().clone().scale(1/this.viewport.getZoomLevel()).sub(new Vec2(-25, 0)), text: "Back"});
    aboutBack.size.set(200, 50);
    aboutBack.borderWidth = 2;
    aboutBack.borderColor = Color.WHITE;
    aboutBack.backgroundColor = Color.TRANSPARENT;
    aboutBack.onClickEventId = "pauseMenu";
}

showPause() {
    this.mainLayer.setHidden(true);
    this.pauseLayer.enable();
    this.pauseLayer.setHidden(false);
    this.control.setHidden(true);
    this.help.setHidden(true);
}
unshowPause() {
    // console.log("UNSHOW!");
    this.control.setHidden(true);
    this.help.setHidden(true);
    this.pauseLayer.setHidden(true);
    this.pauseLayer.disable();
    this.mainLayer.setHidden(false);
}
showControls() {
    this.pauseLayer.setHidden(true);
    this.control.setHidden(false);
    this.help.setHidden(true);
}
showHelp() {
    this.pauseLayer.setHidden(true);
    this.control.setHidden(true);
    this.help.setHidden(false);
}
    
}