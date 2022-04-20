import PositionGraph from "../../Wolfie2D/DataTypes/Graphs/PositionGraph";
import AABB from "../../Wolfie2D/DataTypes/Shapes/AABB";
import Circle from "../../Wolfie2D/DataTypes/Shapes/Circle";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import Input from "../../Wolfie2D/Input/Input";
import Graphic from "../../Wolfie2D/Nodes/Graphic";
import { GraphicType } from "../../Wolfie2D/Nodes/Graphics/GraphicTypes";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Sprite from "../../Wolfie2D/Nodes/Sprites/Sprite";
import OrthogonalTilemap from "../../Wolfie2D/Nodes/Tilemaps/OrthogonalTilemap";
import Label from "../../Wolfie2D/Nodes/UIElements/Label";
import { UIElementType } from "../../Wolfie2D/Nodes/UIElements/UIElementTypes";
import Navmesh from "../../Wolfie2D/Pathfinding/Navmesh";
import Scene from "../../Wolfie2D/Scene/Scene";
import Color from "../../Wolfie2D/Utils/Color";
import BattlerAI from "../AI/BattlerAI";
import EnemyAI from "../AI/EnemyAI";
import PlayerController from "../AI/PlayerController";
import YoyoController from "../AI/YoyoController";
import { Custom_Events, Custom_Names, Custom_Statuses } from "../GameConstants";
import InventoryManager from "../GameSystems/InventoryManager";
import Item from "../GameSystems/items/Item";

export default class playtest_scene extends Scene{
    private bushes : OrthogonalTilemap;
    private graph : PositionGraph;
    private player : AnimatedSprite
    private logo : Sprite
    private navGraph : PositionGraph;
    private enemies : Array<AnimatedSprite>;

    private healthDisplay: Label;
    private goalDisplay: Label;
    private yoyo : Sprite;

    // A list of items
    private items: Array<Item>;
    loadScene(): void {
        this.load.tilemap("playTestLevel","project_assets/tilemaps/sampleMap.json");
        this.load.object("navmesh","project_assets/data/navmesh.json");
        this.load.spritesheet("cat","project_assets/spritesheets/cat.json");
        this.load.spritesheet("raccoon","project_assets/spritesheets/raccoon.json")
        this.load.object("enemyData","project_assets/data/enemy.json");
        this.load.image("inventorySlot", "project_assets/sprites/inventory.png");
        this.load.image("yoyo","project_assets/item/yoyo.png");
    }


    startScene(): void {
        let tilemapLayers = this.add.tilemap("playTestLevel", new Vec2(0.5,0.5));
        this.bushes = <OrthogonalTilemap>tilemapLayers[1].getItems()[0];

        let tilemapSize : Vec2 = this.bushes.size.scaled(0.5);
        this.viewport.setBounds(0,0,tilemapSize.x,tilemapSize.y);

        this.addLayer("primary",10);

        this.viewport.setZoomLevel(4);

        let center = this.viewport.getCenter();

        let options = {
            size : new Vec2(32,32),
            position : new Vec2(117,503) //if tiled has location (x,y) then location here is (x/2,y/2)
        }

        this.initializePlayer();

        this.createNavmesh();

        this.initializeEnemies();

        (<PlayerController>this.player._ai).enemies = this.enemies;


        

        this.viewport.follow(this.player);

        // Add a UI for health
        this.addUILayer("health");
        this.healthDisplay = <Label>this.add.uiElement(UIElementType.LABEL, "health", {position: new Vec2(25, 195), text: "Health: " + (<BattlerAI>this.player._ai).health});
        this.healthDisplay.textColor = Color.BLACK;
        this.healthDisplay.backgroundColor = Color.WHITE;

        // Add a UI for Goals
        this.addUILayer("objectives");
        this.goalDisplay = <Label>this.add.uiElement(UIElementType.LABEL, "objectives", {position: new Vec2(40, 10), text: "Objective: Playtest!"});
        this.goalDisplay.textColor = Color.WHITE;
        this.goalDisplay.backgroundColor = Color.BLACK;
    }

    updateScene(deltaT: number): void {
        /*
        const direction = Vec2.ZERO;

        direction.x = (Input.isKeyPressed("a") ? -1 : 0) + (Input.isKeyPressed("d") ? 1 : 0);
        direction.y = (Input.isKeyPressed("w") ? -1 : 0) + (Input.isKeyPressed("s") ? 1 : 0);
        
        direction.normalize();

        const speed = 100 * deltaT;

        const velocity = direction.scale(speed);

        this.player.position.add(velocity);
        */

        //this.viewport.follow(this.player);

        
        let currHealth = (<BattlerAI>this.player._ai).health;
        this.healthDisplay.text = "Health: " + currHealth;
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
    initializePlayer() : void {
        let inventory = new InventoryManager(this, 5, "inventorySlot", new Vec2(16, this.viewport.getCenter().y * 0.45), 2, "slots1", "items1");



        this.player = this.add.animatedSprite("cat","primary");
        this.player.position.set(105,488);
        this.player.addPhysics(new AABB(Vec2.ZERO, new Vec2(8,8))); // Regular Player AABB
        this.player.addAI(PlayerController,
            {
                speed : 100,
                health : 100,
                inventory : inventory,
                items : null,
                inputEnabled : true,
                range : 30,
                enemies : this.enemies,
            });

        this.player.animation.play("IdleR");
        (<PlayerController>this.player._ai).inventory.setActive(true);
        this.player.setGroup("player");


        this.yoyo = this.add.sprite("yoyo","primary");
        this.yoyo.visible = true;
        //this.yoyo.addPhysics(new AABB(Vec2.ZERO, new Vec2(2,2)));
        this.yoyo.addPhysics(new Circle(Vec2.ZERO,3));
        this.yoyo.addAI(YoyoController,
            {
                speed : 3,
                range : 80,
                belongsTo : this.player,
                
            });

        (<PlayerController>this.player._ai).yoyo = this.yoyo;
        (<PlayerController>this.player._ai).yoyo.visible = false;
        this.yoyo.setGroup("yoyo");
        this.yoyo.setTrigger("player",Custom_Events.YOYO_HIT_PLAYER,null);
        this.yoyo.setTrigger("enemy",Custom_Events.YOYO_HIT_ENEMY,null);

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

            let enemyOptions = {
                defaultMode: data.mode,
                patrolRoute: data.route,            // This only matters if they're a patroller
                guardPosition: data.guardPosition,  // This only matters if the're a guard
                player : this.player,
                goal: Custom_Statuses.REACHED_GOAL,
            }

            this.enemies[i].addAI(EnemyAI,enemyOptions);
            this.enemies[i].setGroup("enemy");
        }

        (<YoyoController>this.yoyo._ai).enemies = this.enemies;

    }

}