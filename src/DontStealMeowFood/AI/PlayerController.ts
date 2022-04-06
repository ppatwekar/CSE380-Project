import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../../Wolfie2D/Events/GameEvent";
import Receiver from "../../Wolfie2D/Events/Receiver";
import Input from "../../Wolfie2D/Input/Input";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import NavigationPath from "../../Wolfie2D/Pathfinding/NavigationPath";
import Timer from "../../Wolfie2D/Timing/Timer";
import InventoryManager from "../GameSystems/InventoryManager";
import Healthpack from "../GameSystems/items/Healthpack";
import Item from "../GameSystems/items/Item";
import Weapon from "../GameSystems/items/Weapon";
import { Custom_Events, Custom_Names } from "../GameConstants";
import BattlerAI from "./BattlerAI";
import { PlayerAnimationManager } from "./PlayerAnimationManager";


export default class PlayerController implements BattlerAI {
    // Fields from BattlerAI
    health: number;

    // The actual player sprite
    owner: AnimatedSprite;

    // Attack range
    range: number;

    // Current targeted enemy
    target: Vec2;

    // Used for swapping control between both players
    inputEnabled: boolean;

    // The inventory of the player
    inventory: InventoryManager;

    /** A list of items in the game world */
    private items: Array<Item>;

    // Movement
    private speed: number;

    private lookDirection: Vec2;
    private path: NavigationPath;

    private receiver: Receiver;

    private playerAnimationManager : PlayerAnimationManager;
    private directionVector : Vec2;


    initializeAI(owner: AnimatedSprite, options: Record<string, any>): void {
        this.owner = owner;
        this.lookDirection = Vec2.ZERO;
        this.speed = options.speed;
        this.health = options.health;
        this.inputEnabled = options.inputEnabled;
        this.range = options.range;

        this.items = options.items;
        this.inventory = options.inventory;

        this.receiver = new Receiver();
        this.playerAnimationManager = new PlayerAnimationManager(this.owner);
        this.directionVector = Vec2.ZERO;
    }

    activate(options: Record<string, any>): void { }

    handleEvent(event: GameEvent): void { }

    // TODO
    update(deltaT: number): void {
        while(this.receiver.hasNextEvent()){
            this.handleEvent(this.receiver.getNextEvent());
        }
        if (this.inputEnabled && this.health > 0) {
            
            const distance = Vec2.ZERO;

            this.directionVector.y = distance.y = (Input.isPressed("up") ? -1 : 0) + (Input.isPressed("down") ? 1 : 0);
            this.directionVector.x = distance.x = (Input.isPressed("left") ? -1 : 0) + (Input.isPressed("right") ? 1 : 0);

            distance.normalize();
            distance.scale(this.speed * deltaT);

            this.owner.move(distance);
            this.playerAnimationManager.handleInput(this.directionVector);


            // Check for slot change
            if (Input.isJustPressed("slot1")) {
                this.inventory.changeSlot(0);
            } else if (Input.isJustPressed("slot2")) {
                this.inventory.changeSlot(1);
            }

            if (Input.isJustPressed("pickup")) {
                // Check if there is an item to pick up
                for (let item of this.items) {
                    if (this.owner.collisionShape.overlaps(item.sprite.boundary)) {
                        // We overlap it, try to pick it up
                        this.inventory.addItem(item);
                        break;
                    }
                }
            }

            if (Input.isJustPressed("drop")) {
                // Check if we can drop our current item
                let item = this.inventory.removeItem();

                if (item) {
                    // Move the item from the ui to the gameworld
                    item.moveSprite(this.owner.position, "primary");

                    // Add the item to the list of items
                    this.items.push(item);
                }
            }
        }
        
        //Target an enemy and attack
        if (this.target != null) {
            let item = this.inventory.getItem();
            this.lookDirection = this.owner.position.dirTo(this.target);

            // If there is an item in the current slot, use it
            if (item) {
                item.use(this.owner, "player", this.lookDirection);
                this.owner.rotation = Vec2.UP.angleToCCW(this.lookDirection);

                if (item instanceof Healthpack) {
                    // Destroy the used healthpack
                    this.inventory.removeItem();
                    item.sprite.visible = false;
                }
            }
        }
    }

    damage(damage: number): void {
        this.health -= damage;
    }

    destroy() {

    }
}