import PositionGraph from "../../Wolfie2D/DataTypes/Graphs/PositionGraph";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import Input from "../../Wolfie2D/Input/Input";
import Graphic from "../../Wolfie2D/Nodes/Graphic";
import { GraphicType } from "../../Wolfie2D/Nodes/Graphics/GraphicTypes";
import Sprite from "../../Wolfie2D/Nodes/Sprites/Sprite";
import OrthogonalTilemap from "../../Wolfie2D/Nodes/Tilemaps/OrthogonalTilemap";
import Scene from "../../Wolfie2D/Scene/Scene";
import Color from "../../Wolfie2D/Utils/Color";

export default class playtest_scene extends Scene{
    private bushes : OrthogonalTilemap;
    private graph : PositionGraph;
    private player : Graphic
    private logo : Sprite

    loadScene(): void {
        this.load.tilemap("playTestLevel","hw4_assets/tilemaps/sampleMap.json");
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

        this.player = this.add.graphic(GraphicType.RECT,"primary",options);
        this.player.color = Color.BLACK;

        this.viewport.follow(this.player);
    }

    updateScene(deltaT: number): void {
        const direction = Vec2.ZERO;

        direction.x = (Input.isKeyPressed("a") ? -1 : 0) + (Input.isKeyPressed("d") ? 1 : 0);
        direction.y = (Input.isKeyPressed("w") ? -1 : 0) + (Input.isKeyPressed("s") ? 1 : 0);
        
        direction.normalize();

        const speed = 100 * deltaT;

        const velocity = direction.scale(speed);

        this.player.position.add(velocity);

        this.viewport.follow(this.player);


        
    }

}