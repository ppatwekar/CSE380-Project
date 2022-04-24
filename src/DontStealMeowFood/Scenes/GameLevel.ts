import Scene from "../../Wolfie2D/Scene/Scene";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import AABB from "../../Wolfie2D/DataTypes/Shapes/AABB";
import Circle from "../../Wolfie2D/DataTypes/Shapes/Circle";
import Color from "../../Wolfie2D/Utils/Color";
import Label from "../../Wolfie2D/Nodes/UIElements/Label";
import { UIElementType } from "../../Wolfie2D/Nodes/UIElements/UIElementTypes";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import BattlerAI from "../AI/BattlerAI";
import EnemyAI from "../AI/EnemyAI";
import PlayerController from "../AI/PlayerController";
import { Custom_Events, Custom_Names, Custom_Statuses } from "../GameConstants";
import InventoryManager from "../GameSystems/InventoryManager";
import Item from "../GameSystems/items/Item";
import Sprite from "../../Wolfie2D/Nodes/Sprites/Sprite";
import { GraphicType } from "../../Wolfie2D/Nodes/Graphics/GraphicTypes";
import Weapon from "../GameSystems/items/Weapon";
import WeaponType from "../GameSystems/items/WeaponTypes/WeaponType";
import RegistryManager from "../../Wolfie2D/Registry/RegistryManager";
import BattleManager from "../GameSystems/BattleManager";

export default class GameLevel extends Scene {
    protected playerSpawn: Vec2; 
    protected player : AnimatedSprite;

    protected yoyo : Sprite;
    protected healthDisplay: Label;
    protected goalDisplay: Label;
    protected battleManager : BattleManager;

    protected nextLevel: new (...args: any) => GameLevel;
    
    startScene(): void{
        this.addLayer("primary",10);

        this.viewport.setZoomLevel(4);

        this.initializePlayer();
        this.subscribeToEvents();
        this.addUI();

    }

    updateScene(deltaT: number): void{
        while(this.receiver.hasNextEvent()){
            let event = this.receiver.getNextEvent();
            
            switch(event.type){
                case Custom_Events.HIT_ENEMY:
                    {
                        console.log("Hit!");
                    }
                    break;
                case Custom_Events.ENEMY_DEATH:
                    {
                        console.log("Enemy died!");
                    }
                    break;
                case Custom_Events.HEAL:
                    {
                        console.log("Healing!");
                    }
                    break;
                case Custom_Events.PLAYER_DAMAGED:
                    {
                        console.log("Player damaged!");
                    }
                    break;
                case Custom_Events.PLAYER_DEATH:
                    {
                        console.log("Player died!");
                    }
                    break;
                case Custom_Events.COMPLETE_OBJECTIVE:
                    {
                        if(this.nextLevel){
                            let sceneOptions = {
                                // TODO
                            }
                            this.sceneManager.changeToScene(this.nextLevel, {}, sceneOptions);
                        }
                    }
                    break;
            }
        }
        let currHealth = (<BattlerAI>this.player._ai).health;
        this.healthDisplay.text = "Health: " + currHealth;
    }

    protected addUI(){
        this.addUILayer("health");
        this.healthDisplay = <Label>this.add.uiElement(UIElementType.LABEL, "health", {position: new Vec2(this.viewport.getCenter().x * 0.05, this.viewport.getCenter().y * 0.485), text: "Health: " + (<BattlerAI>this.player._ai).health});
        this.healthDisplay.textColor = Color.BLACK;
        this.healthDisplay.backgroundColor = Color.WHITE;

        // Add a UI for Goals
        this.addUILayer("objectives");
        this.goalDisplay = <Label>this.add.uiElement(UIElementType.LABEL, "objectives", {position: new Vec2(40, 10), text: "Objective: Playtest!"});
        this.goalDisplay.textColor = Color.WHITE;
        this.goalDisplay.backgroundColor = Color.BLACK;
    }

    initializePlayer() : void{

        let inventory = new InventoryManager(this, 5, "inventorySlot", new Vec2(16, this.viewport.getCenter().y * 0.45), 2, "slots1", "items1");
        let weapon = this.createWeapon("yoyo");
        this.player = this.add.animatedSprite("cat","primary");
        if(!this.playerSpawn){
            console.warn("Player spawn was never set - setting spawn to (0, 0)");
            this.playerSpawn = Vec2.ZERO;
        }
        this.player.position.copy(this.playerSpawn);
        this.player.addPhysics(new AABB(Vec2.ZERO, new Vec2(8,8))); // Regular Player AABB
        this.player.addAI(PlayerController,
            {
                speed : 100,
                health : 100,
                inventory : inventory,
                items : null,
                inputEnabled : true,
                range : 30,
                weapon : weapon
            });

        this.player.animation.play("IdleR");
        (<PlayerController>this.player._ai).inventory.setActive(true);
        this.player.setGroup("player");

        this.viewport.follow(this.player);

        


        // this.yoyo = this.add.sprite("yoyo","primary");
        // this.yoyo.visible = true;
        // this.yoyo.addPhysics(new Circle(Vec2.ZERO,3));
        // this.yoyo.addAI(YoyoController,
        //     {
        //         speed : 3,
        //         range : 80,
        //         belongsTo : this.player,
                
        //     });

        // (<PlayerController>this.player._ai).yoyo = this.yoyo;
        // (<PlayerController>this.player._ai).yoyo.visible = false;
        // this.yoyo.setGroup("yoyo");
        // this.yoyo.setTrigger("enemy",Custom_Events.YOYO_HIT_ENEMY,null);
        // this.yoyo.setTrigger("player",Custom_Events.YOYO_HIT_PLAYER,null);
        
    }

    createWeapon(type: string): Weapon {
        let weaponType = <WeaponType>RegistryManager.getRegistry("weaponTypes").get(type);

        let sprite = this.add.sprite(weaponType.spriteKey, "primary");

        return new Weapon(sprite, weaponType, this.battleManager);
    }


    protected subscribeToEvents(){
        this.receiver.subscribe([
            Custom_Events.HIT_ENEMY,
            Custom_Events.ENEMY_DEATH,
            Custom_Events.HEAL,
            Custom_Events.PLAYER_DAMAGED,
            Custom_Events.PLAYER_DEATH,
            Custom_Events.PAUSE_EVENT,
            Custom_Events.COMPLETE_OBJECTIVE
        ]);
    }

    getPlayer(){
        return this.player;
    }

    initializeWeapons() : void{
        let weaponData = this.load.getObject("weaponData");

        for(let i = 0; i < weaponData.numWeapons; i++){
            let weapon = weaponData.weapons[i];

            // Get the constructor of the prototype
            let constr = RegistryManager.getRegistry("weaponTemplates").get(weapon.weaponType);

            // Create a weapon type
            let weaponType = new constr();

            // Initialize the weapon type
            weaponType.initialize(weapon);

            // Register the weapon type
            RegistryManager.getRegistry("weaponTypes").registerItem(weapon.name, weaponType)

    }
}

    
}