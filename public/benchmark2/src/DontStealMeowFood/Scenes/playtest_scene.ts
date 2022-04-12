import PositionGraph from "../../Wolfie2D/DataTypes/Graphs/PositionGraph";
import AABB from "../../Wolfie2D/DataTypes/Shapes/AABB";
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
import PlayerController from "../AI/PlayerController";
import { Custom_Names } from "../GameConstants";
import InventoryManager from "../GameSystems/InventoryManager";
import Item from "../GameSystems/items/Item";

export default class playtest_scene extends Scene{
    private bushes : OrthogonalTilemap;
    private graph : PositionGraph;
    private player : AnimatedSprite;
    private logo : Sprite
    private navGraph : PositionGraph;

    private healthDisplay: Label;
    private goalDisplay: Label;

    // A list of items
    private items: Array<Item>;

    loadScene(): void {
        this.load.tilemap("playTestLevel","project_assets/tilemaps/sampleMap.json");
        this.load.object("navmesh","project_assets/data/navmesh.json");
        this.load.spritesheet("cat","project_assets/spritesheets/cat.json");
        this.load.image("inventorySlot", "project_assets/sprites/inventory.png");
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
        // Create Inventory
        let inventory = new InventoryManager(this, 5, "inventorySlot", new Vec2(16, this.viewport.getCenter().y * 0.45), 2, "slots1", "items1");

        this.player = this.add.animatedSprite("cat","primary");
        this.player.position.set(105,488);
        this.player.addPhysics(new AABB(Vec2.ZERO, new Vec2(10,10)));
        this.player.addAI(PlayerController,
            {
                speed : 100,
                health : 100,
                inventory : inventory,
                items : null,
                inputEnabled : true,
                range : 30
            });

        this.player.animation.play("IdleR");
        (<PlayerController>this.player._ai).inventory.setActive(true);
    }

}