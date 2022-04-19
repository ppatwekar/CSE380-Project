import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import Scene from "../../Wolfie2D/Scene/Scene";

export default class GoalDisplayManager {
    private position: Vec2;
    constructor(scene: Scene) {
        scene.addUILayer("GoalDisplay").setDepth(100);
        scene.add.sprite("GoalDisplay", "Goal");
        
    }
}