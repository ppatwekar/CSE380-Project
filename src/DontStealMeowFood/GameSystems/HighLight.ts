import Rect from "../../Wolfie2D/Nodes/Graphics/Rect";
import Color from "../../Wolfie2D/Utils/Color";
import Input from "../../Wolfie2D/Input/Input";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import { GraphicType } from "../../Wolfie2D/Nodes/Graphics/GraphicTypes";

export default class HighLight {
    private enemyRangeForBox : number = 100; //was 50 before.
    protected targetEnemyAndBox : {enemy : AnimatedSprite, rect : Rect};

    checkClosestEnemies(enemies: Array<AnimatedSprite>, player: AnimatedSprite){
        if(this.targetEnemyAndBox && this.targetEnemyAndBox.rect){
            this.targetEnemyAndBox.rect.destroy();
            this.targetEnemyAndBox.rect = null;
        }

        let tempArr : AnimatedSprite[] = [];
        for(let enemy of enemies){
            if(player.position.distanceTo(enemy.position) <= this.enemyRangeForBox){
                tempArr.push(enemy);
            }
        }

        let mouseLocation = Input.getGlobalMousePosition();

        if(tempArr.length >= 1){
            let chosenEnemy = tempArr.reduce((prev,curr) => prev.position.distanceTo(mouseLocation) < curr.position.distanceTo(mouseLocation)? prev : curr);
            let color = Color.MAGENTA;
            color.a = 0.5;
            
            
            if(this.targetEnemyAndBox && this.targetEnemyAndBox.rect){
                this.targetEnemyAndBox.rect.destroy();
            }

            this.targetEnemyAndBox = {enemy : chosenEnemy, rect : <Rect>player.getScene().add.graphic(GraphicType.RECT,"primary",{position : chosenEnemy.position.clone(), size : new Vec2(20,20)}) }
            
            this.targetEnemyAndBox.rect.isCollidable = false;
            this.targetEnemyAndBox.rect.color = Color.WHITE;
            this.targetEnemyAndBox.rect.color.a = 0.5;
            this.targetEnemyAndBox.rect.borderWidth = 5;
            this.targetEnemyAndBox.rect.borderColor = Color.BLACK;
        }
        
    }
}