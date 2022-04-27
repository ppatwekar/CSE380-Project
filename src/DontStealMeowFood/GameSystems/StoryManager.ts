import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import { GraphicType } from "../../Wolfie2D/Nodes/Graphics/GraphicTypes";
import Label from "../../Wolfie2D/Nodes/UIElements/Label";
import { UIElementType } from "../../Wolfie2D/Nodes/UIElements/UIElementTypes";
import Rect from "../../Wolfie2D/Nodes/Graphics/Rect";
import Scene from "../../Wolfie2D/Scene/Scene";
import Layer from "../../Wolfie2D/Scene/Layer";
import Color from "../../Wolfie2D/Utils/Color";

export default class StoryManager{
    private position: Vec2;
    private layer: string;
    private text: string;
    private story: Layer;
    
    constructor(scene: Scene, height: number, width: number, position: Vec2, layer: string, text: string){
        this.position = position;

        this.layer = layer;
        this.story = scene.addUILayer(this.layer);
        this.story.setDepth(103);

        this.text = text;
        const line = <Label>scene.add.uiElement(UIElementType.LABEL, layer, {position: new Vec2(position.x, position.y - 150), text: text});
        line.textColor = Color.WHITE;
        
        this.story.setHidden(true);
    }

    setHidden(hidden: boolean): void{
        this.story.setHidden(hidden);
    }
}