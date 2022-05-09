import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import UIElement from "../../Wolfie2D/Nodes/UIElement";
import Button from "../../Wolfie2D/Nodes/UIElements/Button";
import Label from "../../Wolfie2D/Nodes/UIElements/Label";
import { UIElementType } from "../../Wolfie2D/Nodes/UIElements/UIElementTypes";
import Layer from "../../Wolfie2D/Scene/Layer";
import Scene from "../../Wolfie2D/Scene/Scene";
import Color from "../../Wolfie2D/Utils/Color";
import GameOver from "./GameOver";
import Level1_Scene from "./level1_scene";
import Level_Prisoner from "./Level_Prisoner";
import playtest_scene from "./playtest_scene";
import Level_Garden from "./Level_Garden";

export default class MainMenu extends Scene {
    // Layers for multiple main menu screens
    private mainMenu: Layer;
    private control: Layer;
    private levels: Layer;
    private help: Layer;

    loadScene(): void {}

    startScene(): void {
        // Main Menu
        this.mainMenu = this.addUILayer("mainMenu");

        // Center the viewport
        let size = this.viewport.getHalfSize();
        this.viewport.setFocus(size);
 
        this.viewport.setZoomLevel(1);

        // const center = this.viewport.getCenter();


        let createButton = (p: Vec2, t: string) => {
            const play = this.add.uiElement(UIElementType.BUTTON, "mainMenu", {position: p, text: t === "level1" ? "Start" : (t[0].toUpperCase() + t.substring(1))});
            play.size.set(200, 50);
            play.borderWidth = 2;
            play.borderColor = Color.WHITE;
            play.backgroundColor = Color.TRANSPARENT;
            play.onClickEventId = t;
        }
       
        // Add Start Button and give it an event to emit on press
        createButton(new Vec2(size.x, size.y - 150), "level1");
        
        // Add Controls button
        // const control = this.add.uiElement(UIElementType.BUTTON, "mainMenu", {position: new Vec2(size.x, size.y - 300), text: "Controls"});
        // control.size.set(200, 50);
        // control.borderColor = Color.WHITE;
        // control.backgroundColor = Color.TRANSPARENT;
        // control.onClickEventId = "control";
        createButton(new Vec2(size.x, size.y-50), "control");

        // Add Levels button
        createButton(new Vec2(size.x, size.y + 50), "levels");

        // Add Help Button
        createButton(new Vec2(size.x, size.y + 150), "help");

        createButton(new Vec2(size.x, size.y + 250), "end");

        /* Control Screen */
        let controlScreen = () => {
            this.control = this.addUILayer("control");
            this.control.setHidden(true);
            
            const controlHeader = <Label>this.add.uiElement(UIElementType.LABEL, "control", {position: new Vec2(size.x, size.y - 300), text: "Controls"});
            controlHeader.textColor = Color.WHITE;

            const controls1 = "WASD | Move";
            const controls2 = "E | Item Pick Up";
            const controls3 = "Q | Drop Current Item";
            const controls4 = "1/2/3/4/5 or Mouse Wheel Up/Down | Equip Inventory Item";

            const cline1 = <Label>this.add.uiElement(UIElementType.LABEL, "control", {position: new Vec2(size.x, size.y - 100), text: controls1});
            const cline2 = <Label>this.add.uiElement(UIElementType.LABEL, "control", {position: new Vec2(size.x, size.y - 50), text: controls2});
            const cline3 = <Label>this.add.uiElement(UIElementType.LABEL, "control", {position: new Vec2(size.x, size.y), text: controls3});
            const cline4 = <Label>this.add.uiElement(UIElementType.LABEL, "control", {position: new Vec2(size.x, size.y + 50), text: controls4});

            cline1.textColor = cline2.textColor = cline3.textColor = cline4.textColor = Color.WHITE;

            // Back Button
            const controlBack = this.add.uiElement(UIElementType.BUTTON, "control", {position: new Vec2(size.x, size.y + 250), text: "Back"});
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

            const l2 = <Button>this.add.uiElement(UIElementType.BUTTON,"levels",{position : new Vec2(l1.position.x + xMar + l, l1.position.y), text : "Level 2"});
            l2.size.set(l,w);
            l2.borderColor = Color.WHITE;
            l2.backgroundColor = Color.GREEN;
            l2.onClickEventId = "level2"; // TODO

            const l3 = <Button>this.add.uiElement(UIElementType.BUTTON,"levels",{position : new Vec2(l2.position.x + xMar + l, l2.position.y), text : "Level 3"});
            l3.size.set(l,w);
            l3.borderColor = Color.WHITE;
            l3.backgroundColor = Color.GREEN;
            l3.onClickEventId = "level3";

            const l4 = <Button>this.add.uiElement(UIElementType.BUTTON,"levels",{position : new Vec2(l1.position.x , l1.position.y + w + 4 * yMar), text : "Level 4"});
            l4.size.set(l,w);
            l4.borderColor = Color.WHITE;
            l4.backgroundColor = Color.GREEN;
            l4.onClickEventId = "level4";

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
    
            const aboutHeader = <Label>this.add.uiElement(UIElementType.LABEL, "help", {position: new Vec2(size.x, size.y - 250), text: "Help"});
            aboutHeader.textColor = Color.WHITE;
    
            // Resolved: Give yourself credit and add your name to the about page!
            const text1 = "Story:";
            const text2 = "Vanilla the cat had been living peacefully her entire life," ;
            const text2s = "but recently a gang of raccoons invaded her living space and stole all her cat food.";
            const text2t = "Vanilla decides to take revenge on the raccoons and get her food back";
            const text3 = "Created by Jun Yi Lin, Tahmidul Alam, and Prathamesh Patwekar";
    
            const line1 = <Label>this.add.uiElement(UIElementType.LABEL, "help", {position: new Vec2(size.x, size.y - 150), text: text1});
            const line2 = <Label>this.add.uiElement(UIElementType.LABEL, "help", {position: new Vec2(size.x, size.y - 100), text: text2});
            const line2s = <Label>this.add.uiElement(UIElementType.LABEL, "help", {position: new Vec2(size.x, size.y - 50), text: text2s});
            const line2t = <Label>this.add.uiElement(UIElementType.LABEL, "help", {position: new Vec2(size.x, size.y), text: text2t});
            const line3 = <Label>this.add.uiElement(UIElementType.LABEL, "help", {position: new Vec2(size.x, size.y + 50), text: text3});
    
            line1.textColor = Color.WHITE;
            line2.textColor = Color.WHITE;
            line2s.textColor = Color.WHITE;
            line2t.textColor = Color.WHITE;
            line3.textColor = Color.YELLOW;
    
            const aboutBack = this.add.uiElement(UIElementType.BUTTON, "help", {position: new Vec2(size.x, size.y + 250), text: "Back"});
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
        this.receiver.subscribe(["menu","level1","level2","level3","level4","control","levels","help", "end"]);

        
    }

    // TODO: ADD LEVELS
    updateScene(): void {
        while(this.receiver.hasNextEvent()){
            let event = this.receiver.getNextEvent();

            console.log(event);

            if(event.type === "level1"){
                let sceneOptions = {
                    physics : {
                        /**
                         *        pl  ene  yoyo  stone
                         * pl     0    1    0     1
                         * ene    1    0    0     1
                         * yoyo   0    0    0     0
                         * stone  1    1    0     0
                         */
                        groupNames : ["player","enemy","yoyo","stone"],
                        collisions : 
                        [
                            [0,1,0,1],
                            [1,1,0,1],
                            [0,0,0,0],
                            [1,1,0,0]
                        ]
                    }
                };
                this.sceneManager.changeToScene(playtest_scene, {}, sceneOptions);
            } else if(event.type === "level2"){
                let sceneOptions = {
                    physics : {
                        /**
                         *      pl  ene  yoyo
                         * pl   0    1    1
                         * ene  1    0    1
                         * yoyo 1    1    0
                         */
                        groupNames : ["player","enemy","yoyo","stone"],
                        collisions : 
                        [
                            [0,1,0,1],
                            [1,1,0,1],
                            [0,0,0,0],
                            [1,1,0,0]
                        ]
                    }
                };
                this.sceneManager.changeToScene(Level1_Scene, {}, sceneOptions);
            }
            else if(event.type === "level3"){
                let sceneOptions = {
                    physics : {
                        /**
                         *      pl  ene  yoyo ston
                         * pl   0    1    1    1
                         * ene  1    0    1    1
                         * yoyo 1    1    0    0
                         * ston 1    1    0    0
                         */
                        groupNames : ["player","enemy","yoyo","stone"],
                        collisions : 
                        [
                            [0,1,0,1],
                            [1,1,0,1],
                            [0,0,0,0],
                            [1,1,0,0]
                        ]
                    }
                };
                this.sceneManager.changeToScene(Level_Garden, {}, sceneOptions);
            }else if(event.type === "level4"){
                let sceneOptions = {
                    physics : {
                        /**
                         *      pl  ene  yoyo
                         * pl   0    1    1
                         * ene  1    0    1
                         * yoyo 1    1    0
                         */
                        groupNames : ["player","enemy","yoyo","stone","faultyTile"],
                        collisions : 
                        [
                            [0,1,0,1,1],
                            [1,1,0,1,1],
                            [0,0,0,0,0],
                            [1,1,0,0,0],
                            [1,1,0,0,0]
                        ]
                    }
                };
                this.sceneManager.changeToScene(Level_Prisoner, {}, sceneOptions);
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

            if(event.type === "end"){
                this.sceneManager.changeToScene(GameOver);
            }

        }
    }
}