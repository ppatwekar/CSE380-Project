import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import UIElement from "../../Wolfie2D/Nodes/UIElement";
import Button from "../../Wolfie2D/Nodes/UIElements/Button";
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
            const play = this.add.uiElement(UIElementType.BUTTON, "mainMenu", {position: p, text: t === "level1" ? "Start" : (t[0].toUpperCase() + t.substring(1))});
            play.size.set(200, 50);
            play.borderWidth = 2;
            play.borderColor = Color.WHITE;
            play.backgroundColor = Color.TRANSPARENT;
            play.onClickEventId = t;
        }
       
        // Add Start Button and give it an event to emit on press
        createButton(new Vec2(center.x, center.y - 100), "level1");
        
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
        let levelsScreen = (xMar: number, yMar: number) => {
            // TODO
            this.levels = this.addUILayer("levels");
            this.levels.setHidden(true);

            const l = (2 * this.viewport.getHalfSize().x - 6 * xMar)/3;
            const w = (2 * this.viewport.getHalfSize().y - 8*yMar)/2;

            const l1 = <Button>this.add.uiElement(UIElementType.BUTTON, "levels",{position : new Vec2(2*xMar + l/2, 2*yMar + w/2), text : "Level 1"});
            l1.size.set(l,w);
            l1.borderColor = Color.WHITE;
            l1.backgroundColor = Color.GREEN;
            l1.onClickEventId = "level1";

            const l2 = <Button>this.add.uiElement(UIElementType.BUTTON,"levels",{position : new Vec2(l1.position.x + xMar + l, l1.position.y), text : "LOCKED"});
            l2.size.set(l,w);
            l2.borderColor = Color.WHITE;
            l2.backgroundColor = Color.TRANSPARENT;
            l2.onClickEventId = ""; // TODO

            const l3 = <Button>this.add.uiElement(UIElementType.BUTTON,"levels",{position : new Vec2(l2.position.x + xMar + l, l2.position.y), text : "LOCKED"});
            l3.size.set(l,w);
            l3.borderColor = Color.WHITE;
            l3.backgroundColor = Color.TRANSPARENT;
            l3.onClickEventId = "";

            const l4 = <Button>this.add.uiElement(UIElementType.BUTTON,"levels",{position : new Vec2(l1.position.x , l1.position.y + w + 4 * yMar), text : "LOCKED"});
            l4.size.set(l,w);
            l4.borderColor = Color.WHITE;
            l4.backgroundColor = Color.TRANSPARENT;
            l4.onClickEventId = "";

            const l5 = <Button>this.add.uiElement(UIElementType.BUTTON,"levels",{position : new Vec2(l4.position.x + xMar + l , l4.position.y), text : "LOCKED"});
            l5.size.set(l,w);
            l5.borderColor = Color.WHITE;
            l5.backgroundColor = Color.TRANSPARENT;
            l5.onClickEventId = "";

            const l6 = <Button>this.add.uiElement(UIElementType.BUTTON,"levels",{position : new Vec2(l5.position.x + xMar + l , l5.position.y), text : "LOCKED"});
            l6.size.set(l,w);
            l6.borderColor = Color.WHITE;
            l6.backgroundColor = Color.TRANSPARENT;
            l6.onClickEventId = "";

            const back = <Button>this.add.uiElement(UIElementType.BUTTON,"levels",{position : new Vec2(this.viewport.getHalfSize().x, 2 * this.viewport.getHalfSize().y - yMar/2), text: "Back"});
            back.size.set(l,2*this.viewport.getHalfSize().y - 7 *yMar - 2 * w);
            back.borderColor = Color.WHITE;
            back.backgroundColor = Color.TRANSPARENT;
            back.onClickEventId = "menu";

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
        levelsScreen(40,40);
        helpScreen();

        /* Receivers */
        this.receiver.subscribe("menu");
        this.receiver.subscribe("level1");
        this.receiver.subscribe("control");
        this.receiver.subscribe("levels");
        this.receiver.subscribe("help");
    }

    // TODO: ADD LEVELS
    updateScene(): void {
        while(this.receiver.hasNextEvent()){
            let event = this.receiver.getNextEvent();

            console.log(event);

            if(event.type === "level1"){
                this.sceneManager.changeToScene(playtest_scene, {});
            }

            if(event.type === "help"){
                this.help.setHidden(false);
                this.mainMenu.setHidden(true);
            }

            if(event.type === "menu"){
                this.mainMenu.setHidden(false);
                this.help.setHidden(true);
                this.levels.setHidden(true);
                this.control.setHidden(true);
            }
            if(event.type === "control"){
                this.mainMenu.setHidden(true);
                this.control.setHidden(false);
            }

            if(event.type === "levels"){
                this.mainMenu.setHidden(true);
                this.levels.setHidden(false);
            }

        }
    }
}