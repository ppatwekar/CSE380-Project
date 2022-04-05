import PositionGraph from "../../Wolfie2D/DataTypes/Graphs/PositionGraph";
import AABB from "../../Wolfie2D/DataTypes/Shapes/AABB";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import Input from "../../Wolfie2D/Input/Input";
import Graphic from "../../Wolfie2D/Nodes/Graphic";
import { GraphicType } from "../../Wolfie2D/Nodes/Graphics/GraphicTypes";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Sprite from "../../Wolfie2D/Nodes/Sprites/Sprite";
import OrthogonalTilemap from "../../Wolfie2D/Nodes/Tilemaps/OrthogonalTilemap";
import Navmesh from "../../Wolfie2D/Pathfinding/Navmesh";
import Scene from "../../Wolfie2D/Scene/Scene";
import Color from "../../Wolfie2D/Utils/Color";
import PlayerController from "../AI/PlayerController";
import { Custom_Names } from "../GameConstants";

export default class playtest_scene extends Scene{
    private bushes : OrthogonalTilemap;
    private graph : PositionGraph;
    private player : AnimatedSprite;
    private logo : Sprite
    private navGraph : PositionGraph;

    loadScene(): void {
        this.load.tilemap("playTestLevel","project_assets/tilemaps/sampleMap.json");
        this.load.object("navmesh","project_assets/data/navmesh.json");
        this.load.spritesheet("cat","project_assets/spritesheets/cat.json");
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


    }

    updateScene(deltaT: number): void {
        //this.viewport.follow(this.player);

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
        this.player = this.add.animatedSprite("cat","primary");
        this.player.position.set(105,488);
        this.player.addPhysics(new AABB(Vec2.ZERO, new Vec2(8,8)));
        this.player.addAI(PlayerController,
            {
                speed : 100,
                health : 25,
                inventory : null,
                items : null,
                inputEnabled : true,
                range : 30
            });

        this.player.animation.play("IdleR");

    }

}