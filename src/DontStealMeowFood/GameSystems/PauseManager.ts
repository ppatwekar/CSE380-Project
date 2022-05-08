import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import Emitter from "../../Wolfie2D/Events/Emitter";
import GameEvent from "../../Wolfie2D/Events/GameEvent";
import Receiver from "../../Wolfie2D/Events/Receiver";
import Input from "../../Wolfie2D/Input/Input";
import { GraphicType } from "../../Wolfie2D/Nodes/Graphics/GraphicTypes";
import Rect from "../../Wolfie2D/Nodes/Graphics/Rect";
import Button from "../../Wolfie2D/Nodes/UIElements/Button";
import Label from "../../Wolfie2D/Nodes/UIElements/Label";
import { UIElementType } from "../../Wolfie2D/Nodes/UIElements/UIElementTypes";
import UILayer from "../../Wolfie2D/Scene/Layers/UILayer";
import Scene from "../../Wolfie2D/Scene/Scene";
import Viewport from "../../Wolfie2D/SceneGraph/Viewport";
import Color from "../../Wolfie2D/Utils/Color";
import { Custom_Events } from "../GameConstants";
import MainMenu from "../Scenes/MainMenu";

export default class PauseManager {
    private pauseLayer: UILayer;
    private viewport: Viewport;
    private menuState: string;
    private control: UILayer;
    private help: UILayer;
    private scene: Scene;
    
    private emitter: Emitter;
    private receiver: Receiver;

    constructor(scene: Scene) {
        this.viewport = scene.getViewport();
        this.scene = scene;
        this.initPause(scene);

        this.emitter = new Emitter();
        this.receiver = new Receiver();
        this.receiver.subscribe([
            "pauseMenu",
            "controlsPause",
            "helpPause",
            "mainMenuPause",
            "resume"
        ])
    }

    initPause(scene: Scene) {
        /* Add a pauseMenu Layer */
        const layerName = "pauseMenu";
        this.pauseLayer = scene.addUILayer(layerName);
        this.pauseLayer.setDepth(105);
        
        let l = <Rect>scene.add.graphic(GraphicType.RECT, layerName, {position: new Vec2(this.viewport.getCenter().x / this.viewport.getZoomLevel(), this.viewport.getCenter().y / this.viewport.getZoomLevel()), size: this.viewport.getHalfSize().clone().scale(1.85)});
        l.setColor(Color.BLACK);
        l.alpha = 0.75;

        let resume = <Button>scene.add.uiElement(UIElementType.BUTTON, layerName, {position: this.viewport.getCenter().clone().scale(1/this.viewport.getZoomLevel()).sub(new Vec2(0, 50)), text: "Resume"});
        resume.onClickEventId = "resume";

        let control = <Label>scene.add.uiElement(UIElementType.LABEL, layerName, {position: this.viewport.getCenter().clone().scale(1/this.viewport.getZoomLevel()).sub(new Vec2(0, 15)), text: "Controls"});
        control.onClickEventId = "controlsPause";

        let helpButton = <Label>scene.add.uiElement(UIElementType.LABEL, layerName, {position: this.viewport.getCenter().clone().scale(1/this.viewport.getZoomLevel()).sub(new Vec2(0, -20)), text: "Help"});
        helpButton.onClickEventId = "helpPause";

        let menu = <Label>scene.add.uiElement(UIElementType.LABEL, layerName, {position: this.viewport.getCenter().clone().scale(1/this.viewport.getZoomLevel()).sub(new Vec2(0, -55)), text: "Main Menu"});
        menu.onClickEventId = "mainMenuPause";

        resume.backgroundColor = control.backgroundColor = helpButton.backgroundColor = menu.backgroundColor = Color.BLACK;
        resume.textColor = control.textColor = helpButton.textColor = menu.textColor = Color.WHITE;

        resume.onClick = () => {
            console.log("CLICKED RESUME!");
        }
        resume.onEnter = () => {
            console.log("ENTERED RESUME");
            resume.backgroundColor = Color.WHITE;
            resume.textColor = Color.BLACK;
            if (this.menuState !== "resume")
                {this.menuState = "resume";}
        };
        resume.onLeave = () => {
            resume.backgroundColor = Color.BLACK;
            resume.textColor = Color.WHITE;
            this.menuState = null;
        };

        control.onEnter = () => {
            control.backgroundColor = Color.WHITE;
            control.textColor = Color.BLACK;
            if (this.menuState !== "controlsPause")
                {this.menuState = "controlsPause";}
        };
        control.onLeave = () => {
            control.backgroundColor = Color.BLACK;
            control.textColor = Color.WHITE;
            this.menuState = null;
        };

        helpButton.onEnter = () => {
            helpButton.backgroundColor = Color.WHITE;
            helpButton.textColor = Color.BLACK;
            if (this.menuState !== "helpPause")
                {this.menuState = "helpPause";}
        };
        helpButton.onLeave = () => {
            helpButton.backgroundColor = Color.BLACK;
            helpButton.textColor = Color.WHITE;
            this.menuState = null;
        };

        menu.onEnter = () => {
            menu.backgroundColor = Color.WHITE;
            menu.textColor = Color.BLACK;
            if (this.menuState !== "mainMenuPause")
                {this.menuState = "mainMenuPause";}
        };
        menu.onLeave = () => {
            menu.backgroundColor = Color.BLACK;
            menu.textColor = Color.WHITE;
            this.menuState = null;
        };

        this.controlsScreen(scene);
        this.helpScreen(scene);

        this.unshowPause();
    }

    controlsScreen(scene: Scene) {
        this.control = scene.addUILayer("control");
        this.control.setHidden(true);
        
        const controlHeader = <Label>scene.add.uiElement(UIElementType.LABEL, "control", {position: this.viewport.getCenter().clone().scale(1/this.viewport.getZoomLevel()).sub(new Vec2(0, 300)), text: "Controls"});
        controlHeader.textColor = Color.WHITE;

        const controls1 = "WASD | Move";
        const controls2 = "E | Item Pick Up";
        const controls3 = "Q | Drop Current Item";
        const controls4 = "1/2/3/4/5 or Mouse Wheel Up/Down | Equip Inventory Item";

        const cline1 = <Label>scene.add.uiElement(UIElementType.LABEL, "control", {position: this.viewport.getCenter().clone().scale(1/this.viewport.getZoomLevel()).sub(new Vec2(0, 100)), text: controls1});
        const cline2 = <Label>scene.add.uiElement(UIElementType.LABEL, "control", {position: this.viewport.getCenter().clone().scale(1/this.viewport.getZoomLevel()).sub(new Vec2(0, 50)), text: controls2});
        const cline3 = <Label>scene.add.uiElement(UIElementType.LABEL, "control", {position: this.viewport.getCenter().clone().scale(1/this.viewport.getZoomLevel()), text: controls3});
        const cline4 = <Label>scene.add.uiElement(UIElementType.LABEL, "control", {position: this.viewport.getCenter().clone().scale(1/this.viewport.getZoomLevel()).sub(new Vec2(0, -50)), text: controls4});

        cline1.textColor = cline2.textColor = cline3.textColor = cline4.textColor = Color.WHITE;

        // Back Button
        const controlBack = scene.add.uiElement(UIElementType.BUTTON, "control", {position: this.viewport.getCenter().clone().scale(1/this.viewport.getZoomLevel()).sub(new Vec2(-150, 0)), text: "Back"});
        controlBack.size.set(200, 50);
        controlBack.borderWidth = 2;
        controlBack.borderColor = Color.WHITE;
        controlBack.backgroundColor = Color.TRANSPARENT;
        controlBack.onClickEventId = "pauseMenu";
    }
    
    helpScreen(scene: Scene) {
        this.help = scene.addUILayer("helpPause");
        this.help.setHidden(true);

        const aboutHeader = <Label>scene.add.uiElement(UIElementType.LABEL, "helpPause", {position: this.viewport.getCenter().clone().scale(1/this.viewport.getZoomLevel()).sub(new Vec2(0, 250)), text: "Help"});
        aboutHeader.textColor = Color.WHITE;

        // Resolved: Give yourself credit and add your name to the about page!
        const text1 = "Story:";
        const text2 = "Vanilla the cat had been living peacefully her entire life," ;
        const text2s = "but recently a gang of raccoons invaded her living space and stole all her cat food.";
        const text2t = "Vanilla decides to take revenge on the raccoons and get her food back";
        const text3 = "Created by Jun Yi Lin, Tahmidul Alam, and Prathamesh Patwekar";

        const line1 = <Label>scene.add.uiElement(UIElementType.LABEL, "helpPause", {position: this.viewport.getCenter().clone().scale(1/this.viewport.getZoomLevel()).sub(new Vec2(0, 150)), text: text1});
        const line2 = <Label>scene.add.uiElement(UIElementType.LABEL, "helpPause", {position: this.viewport.getCenter().clone().scale(1/this.viewport.getZoomLevel()).sub(new Vec2(0, 100)), text: text2});
        const line2s = <Label>scene.add.uiElement(UIElementType.LABEL, "helpPause", {position: this.viewport.getCenter().clone().scale(1/this.viewport.getZoomLevel()).sub(new Vec2(0, 50)), text: text2s});
        const line2t = <Label>scene.add.uiElement(UIElementType.LABEL, "helpPause", {position: this.viewport.getCenter().clone().scale(1/this.viewport.getZoomLevel()), text: text2t});
        const line3 = <Label>scene.add.uiElement(UIElementType.LABEL, "helpPause", {position: this.viewport.getCenter().clone().scale(1/this.viewport.getZoomLevel()).sub(new Vec2(0, -50)), text: text3});

        line1.textColor = Color.WHITE;
        line2.textColor = Color.WHITE;
        line2s.textColor = Color.WHITE;
        line2t.textColor = Color.WHITE;
        line3.textColor = Color.YELLOW;

        const aboutBack = scene.add.uiElement(UIElementType.BUTTON, "helpPause", {position: this.viewport.getCenter().clone().scale(1/this.viewport.getZoomLevel()).sub(new Vec2(-25, 0)), text: "Back"});
        aboutBack.size.set(200, 50);
        aboutBack.borderWidth = 2;
        aboutBack.borderColor = Color.WHITE;
        aboutBack.backgroundColor = Color.TRANSPARENT;
        aboutBack.onClickEventId = "pauseMenu";
    }

    showPause() {
        // this.pauseLayer.setHidden(false);
        // this.control.setHidden(true);
        // this.help.setHidden(true);
        this.pauseLayer.enable();
        this.control.disable();
        this.help.disable();
    }

    unshowPause() {
        // console.log("UNSHOW!");
        // this.control.setHidden(true);
        // this.help.setHidden(true);
        // this.pauseLayer.setHidden(true);
        this.pauseLayer.disable();
        this.control.disable();
        this.help.disable();
    }

    showControls() {
        // this.pauseLayer.setHidden(true);
        // this.control.setHidden(false);
        // this.help.setHidden(true);
        this.pauseLayer.disable();
        this.control.enable();
        this.help.disable();
    }

    showHelp() {
        // this.pauseLayer.setHidden(true);
        // this.control.setHidden(true);
        // this.help.setHidden(false);
        this.pauseLayer.disable();
        this.control.disable();
        this.help.enable();
    }

    update() {
        if (Input.isMouseJustPressed(0) && !Input.isMouseJustPressed(2)) {
            switch (this.menuState) {
                case "pauseMenu":
                    {
                        this.emitter.fireEvent("pauseMenu");
                        break;
                    }
                case "controlsPause":
                    {
                        this.emitter.fireEvent("controlsPause");
                    }
                    break;
                case "helpPause":
                    {
                        this.emitter.fireEvent("helpPause");
                    }
                    break;
                case "mainMenuPause":
                    {
                        this.emitter.fireEvent("mainMenuPause");
                        break;
                    }
                case "resume":
                    this.emitter.fireEvent("resume");
                    break;
            }
            // this.handleAllEvents();
            // this.menuState = null;
        }
    }

    handleAllEvents(): any {
        while (this.receiver.hasNextEvent()) {
            let response = this.handleEvent(this.receiver.getNextEvent());
            if (response !== null)
                return response;
        }
        return null;
    }

    handleEvent(event: GameEvent): any {
        switch (event.type) {
            case "pauseMenu":
                {
                    this.showPause();
                    this.menuState = null;
                    break;
                }
            case "controlsPause":
                {
                    this.showControls();
                    this.menuState = null;
                }
                break;
            case "helpPause":
                {
                    this.showHelp();
                    this.menuState = null;
                }
                break;
            case "mainMenuPause":
                {
                    this.menuState = null;
                    return "mainMenuPause";
                }
            case "resume":
                // console.log("SEEING RESUME!");
                // this.emitter.fireEvent(Custom_Events.PAUSE_EVENT);
                this.menuState = null;
                return "resume";
        }
        return null;
    }
}