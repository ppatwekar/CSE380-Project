import Circle from "../../../../Wolfie2D/DataTypes/Shapes/Circle";
import Vec2 from "../../../../Wolfie2D/DataTypes/Vec2";
import Sprite from "../../../../Wolfie2D/Nodes/Sprites/Sprite";
import Scene from "../../../../Wolfie2D/Scene/Scene";
import { Custom_Events } from "../../../GameConstants";

export default class Stone{
    owner : Sprite;
    directionOfMoveMent : Vec2 = Vec2.ZERO;
    speed : number = 0;
    scene : Scene;
    velocity : Vec2 = Vec2.ZERO;
    constructor(scene : Scene, speed : number){
        this.scene = scene;
        this.owner = scene.add.sprite("stone","primary");
        this.owner.visible = false;
        this.owner.addPhysics(new Circle(Vec2.ZERO,3));
        this.owner.setGroup("stone");
        // this.owner.setTrigger("player",Custom_Events.STONE_HIT_PLAYER,null);
        this.owner.setTrigger("enemy",Custom_Events.STONE_HIT_ENEMY,null);
        this.speed = speed;
    }

    activate(startLocation : Vec2, directionOfMoveMent : Vec2){
        this.directionOfMoveMent = directionOfMoveMent.clone();
        this.owner.position = startLocation;
        this.owner.visible = true;
        this.velocity = this.directionOfMoveMent.scale(this.speed);
    }

    updatePosition(){
        this.owner.move(this.velocity);
    }

    deactivate(){
        this.owner.visible = false;
        this.directionOfMoveMent = Vec2.ZERO;
        this.owner.position = Vec2.ZERO;
        this.velocity = Vec2.ZERO;

    }

    outOfBounds() : boolean{
        let topEdge = 0;
        let leftEdge = 0;

        let rightEdge = this.scene.getViewport().getView().center.x + this.scene.getViewport().getView().getHalfSize().x;
        let bottomEdge = this.scene.getViewport().getView().center.y + this.scene.getViewport().getView().getHalfSize().y;

        let position = this.owner.position;

        return position.x < leftEdge || position.x > rightEdge || position.y < topEdge || position.y > bottomEdge;
    }


}