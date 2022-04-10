import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import UIElement from "../../Wolfie2D/Nodes/UIElement";
import Label from "../../Wolfie2D/Nodes/UIElements/Label";
import { UIElementType } from "../../Wolfie2D/Nodes/UIElements/UIElementTypes";
import Layer from "../../Wolfie2D/Scene/Layer";
import Scene from "../../Wolfie2D/Scene/Scene";
import Color from "../../Wolfie2D/Utils/Color";
import playtest_scene from "./playtest_scene";

export default class MainMenu extends Scene {
    // Layers for multiple main menu screens
    private mainMenu: Layer;
    private control: Layer;
    private levels: Layer;
    private help: Layer;

    loadScene(): void {}

    startScene(): void {
        const center = this.viewport.getCenter();

        // Main Menu
        this.mainMenu = this.addUILayer("mainMenu");

        let createButton = (p: Vec2, t: string) => {
            const play = this.add.uiElement(UIElementType.BUTTON, "mainMenu", {position: p, text: (t[0].toUpperCase() + t.substring(1))});
            play.size.set(200, 50);
            play.borderWidth = 2;
            play.borderColor = Color.WHITE;
            play.backgroundColor = Color.TRANSPARENT;
            play.onClickEventId = t;
        }
       
        // Add Start Button and give it an event to emit on press
        createButton(new Vec2(center.x, center.y - 100), "start");
        
        // Add Controls button
        // const control = this.add.uiElement(UIElementType.BUTTON, "mainMenu", {position: new Vec2(center.x, center.y - 300), text: "Controls"});
        // control.size.set(200, 50);
        // control.borderColor = Color.WHITE;
        // control.backgroundColor = Color.TRANSPARENT;
        // control.onClickEventId = "control";
        createButton(new Vec2(center.x, center.y), "control");

        // Add Levels button
        createButton(new Vec2(center.x, center.y + 100), "levels");

        // Add Help Button
        createButton(new Vec2(center.x, center.y + 200), "help");

        /* Control Screen */
        let controlScreen = () => {
            this.control = this.addUILayer("control");
            this.control.setHidden(true);
            
            const controlHeader = <Label>this.add.uiElement(UIElementType.LABEL, "control", {position: new Vec2(center.x, center.y - 300), text: "Controls"});
            controlHeader.textColor = Color.WHITE;

            const controls1 = "WASD | Move";
            const controls2 = "E | Item Pick Up";
            const controls3 = "Q | Drop Current Item";
            const controls4 = "1/2/3/4/5 | Equip Inventory Item";

            const cline1 = <Label>this.add.uiElement(UIElementType.LABEL, "control", {position: new Vec2(center.x, center.y - 100), text: controls1});
            const cline2 = <Label>this.add.uiElement(UIElementType.LABEL, "control", {position: new Vec2(center.x, center.y - 50), text: controls2});
            const cline3 = <Label>this.add.uiElement(UIElementType.LABEL, "control", {position: new Vec2(center.x, center.y), text: controls3});
            const cline4 = <Label>this.add.uiElement(UIElementType.LABEL, "control", {position: new Vec2(center.x, center.y + 50), text: controls4});

            cline1.textColor = cline2.textColor = cline3.textColor = cline4.textColor = Color.WHITE;

            // Back Button
            const controlBack = this.add.uiElement(UIElementType.BUTTON, "control", {position: new Vec2(center.x, center.y + 250), text: "Back"});
            controlBack.size.set(200, 50);
            controlBack.borderWidth = 2;
            controlBack.borderColor = Color.WHITE;
            controlBack.backgroundColor = Color.TRANSPARENT;
            controlBack.onClickEventId = "menu";
        }

        /* TODO: Levels Screen */
        let levelsScreen = () => {
            // TODO
        }

        /* Help Screen */
        let helpScreen = () => {
            this.help = this.addUILayer("help");
            this.help.setHidden(true);
    
            const aboutHeader = <Label>this.add.uiElement(UIElementType.LABEL, "help", {position: new Vec2(center.x, center.y - 250), text: "Help"});
            aboutHeader.textColor = Color.WHITE;
    
            // Resolved: Give yourself credit and add your name to the about page!
            const text1 = "Story:";
            const text2 = "Sample Story";
            const text3 = "Created by Jun Yi Lin, Tahmidul Alam, and Prathamesh Patwekar";
    
            const line1 = <Label>this.add.uiElement(UIElementType.LABEL, "help", {position: new Vec2(center.x, center.y - 50), text: text1});
            const line2 = <Label>this.add.uiElement(UIElementType.LABEL, "help", {position: new Vec2(center.x, center.y), text: text2});
            const line3 = <Label>this.add.uiElement(UIElementType.LABEL, "help", {position: new Vec2(center.x, center.y + 50), text: text3});
    
            line1.textColor = Color.WHITE;
            line2.textColor = Color.WHITE;
            line3.textColor = Color.WHITE;
    
            const aboutBack = this.add.uiElement(UIElementType.BUTTON, "help", {position: new Vec2(center.x, center.y + 250), text: "Back"});
            aboutBack.size.set(200, 50);
            aboutBack.borderWidth = 2;
            aboutBack.borderColor = Color.WHITE;
            aboutBack.backgroundColor = Color.TRANSPARENT;
            aboutBack.onClickEventId = "menu";
        }


        // Call the Screen Functions
        controlScreen();
        levelsScreen();
        helpScreen();

        /* Receivers */
        this.receiver.subscribe("menu");
        this.receiver.subscribe("start");
        this.receiver.subscribe("control");
        this.receiver.subscribe("levels");
        this.receiver.subscribe("help");
    }

    // TODO: ADD LEVELS
    updateScene(): void {
        while(this.receiver.hasNextEvent()){
            let event = this.receiver.getNextEvent();

            console.log(event);

            if(event.type === "start"){
                this.sceneManager.changeToScene(playtest_scene, {});
            }

            if(event.type === "help"){
                this.help.setHidden(false);
                this.mainMenu.setHidden(true);
            }

            if(event.type === "menu"){
                this.mainMenu.setHidden(false);
                this.help.setHidden(true);
                this.control.setHidden(true);
            }
            if(event.type === "control"){
                this.mainMenu.setHidden(true);
                this.control.setHidden(false);
            }

        }
    }
}