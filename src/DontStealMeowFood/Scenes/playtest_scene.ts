import PositionGraph from "../../Wolfie2D/DataTypes/Graphs/PositionGraph";
import AABB from "../../Wolfie2D/DataTypes/Shapes/AABB";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import { GraphicType } from "../../Wolfie2D/Nodes/Graphics/GraphicTypes";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Sprite from "../../Wolfie2D/Nodes/Sprites/Sprite";
import OrthogonalTilemap from "../../Wolfie2D/Nodes/Tilemaps/OrthogonalTilemap";
import Navmesh from "../../Wolfie2D/Pathfinding/Navmesh";
import BattlerAI from "../AI/BattlerAI";
import EnemyAI from "../AI/EnemyAI";
import PlayerController from "../AI/PlayerController";
import { Custom_Names, Custom_Statuses } from "../GameConstants";
import Item from "../GameSystems/items/Item";
import HighLight from "../GameSystems/HighLight";
import GameLevel from "./GameLevel";
import BattleManager from "../GameSystems/BattleManager";
import Label from "../../Wolfie2D/Nodes/UIElements/Label";
import { UIElementType } from "../../Wolfie2D/Nodes/UIElements/UIElementTypes";
import { GameEventType } from "../../Wolfie2D/Events/GameEventType";
import AttackAction from "../AI/EnemyActions/Attack";
import Move from "../AI/EnemyActions/Move";
import Retreat from "../AI/EnemyActions/Retreat";

export default class playtest_scene extends GameLevel{
    private bushes : OrthogonalTilemap;
    private graph : PositionGraph;
    private logo : Sprite
    private navGraph : PositionGraph;
    private enemies : Array<AnimatedSprite>;
    // A list of items
    private items: Array<Item>;
    protected h1 : HighLight;
    
    loadScene(): void {
        this.load.tilemap("playTestLevel","project_assets/tilemaps/sampleMap.json");
        this.load.object("navmesh","project_assets/data/navmesh.json");
        this.load.spritesheet("cat","project_assets/spritesheets/cat.json");
        this.load.spritesheet("raccoon","project_assets/spritesheets/raccoon.json")
        this.load.object("enemyData","project_assets/data/enemy.json");
        this.load.image("inventorySlot", "project_assets/sprites/inventory.png");
        this.load.image("yoyo","project_assets/item/yoyo.png");
        this.load.object("weaponData","project_assets/data/weaponData.json");
        this.load.audio("level1_music", "project_assets/music/theme_music.mp3");
    }


    startScene(): void {
        this.playerSpawn = Vec2.ZERO;
        let tilemapLayers = this.add.tilemap("playTestLevel", new Vec2(0.5,0.5));
        this.bushes = <OrthogonalTilemap>tilemapLayers[1].getItems()[0];

        let tilemapSize : Vec2 = this.bushes.size.scaled(0.5);
        this.viewport.setBounds(0,0,tilemapSize.x,tilemapSize.y);

        

        // let center = this.viewport.getCenter();

        // let options = {
        //     size : new Vec2(32,32),
        //     position : new Vec2(117,503) //if tiled has location (x,y) then location here is (x/2,y/2)

        // }
        this.initializeWeapons();
        super.startScene();
        this.viewport.setZoomLevel(4);
        this.createNavmesh();

        this.initializeEnemies();

        this.battleManager = new BattleManager();
        this.battleManager.setPlayers([<BattlerAI>this.player._ai]);
        this.battleManager.setEnemies(this.enemies.map(enemy => <BattlerAI>enemy._ai));

        (<PlayerController>this.player._ai).weapon = this.createWeapon("yoyo");

        (<PlayerController>this.player._ai).enemies = this.enemies;

        this.initializeEnemyWeapons();
        this.h1 = new HighLight();

        this.setGoal("Objective: Playtest!");
        this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: "level1_music", loop: true, holdReference: true});
    }
    

    updateScene(deltaT: number): void {
        super.updateScene(deltaT);
        this.h1.checkClosestEnemies(this.enemies, this.player);
    }

    createNavmesh() : void {
        let graphLayer = this.addLayer("graph");
        graphLayer.setHidden(true);

        let navmeshData = this.load.getObject("navmesh");

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

    initializeEnemyWeapons() : void{
        const enemyData = this.load.getObject("enemyData");
        for(let i = 0; i<this.enemies.length; i++){
            let data = enemyData.enemies[i];
            let weapon = this.createWeapon(data.weapon);
            weapon.sprite.visible = false;
            (<EnemyAI>this.enemies[i]._ai).weapon = weapon;
        }
    }
    
    

    initializeEnemies() : void {
        const enemyData = this.load.getObject("enemyData");
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
            new Move(4, [], [Custom_Statuses.IN_RANGE], {inRange: 32}),
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
                inRange: 32,
                vision: enemyVision,
                health: 10
            }    
            this.enemies[i].addAI(EnemyAI,enemyOptions);
            this.enemies[i].setGroup("enemy");
        }

        //(<YoyoController>this.yoyo._ai).enemies = this.enemies;

    }

}