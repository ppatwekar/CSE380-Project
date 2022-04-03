import GoapActionPlanner from "../../Wolfie2D/AI/GoapActionPlanner"
import StateMachineGoapAI from "../../Wolfie2D/AI/StateMachineGoapAI";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import GameNode from "../../Wolfie2D/Nodes/GameNode";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import NavigationPath from "../../Wolfie2D/Pathfinding/NavigationPath";
import BattlerAI from "./BattlerAI"

export default class EnemyAI extends StateMachineGoapAI implements BattlerAI {
    /* The owner of this AI */
    owner: AnimatedSprite;

    /* Max Health that this entity has */
    maxHealth: number;

    /* Current Health of the entity */
    health: number;

    /* Default Movement Speed */
    speed: number = 20;

    /* The weapon that the AI has */
    // weapon: Weapon;

    /* Reference to player object */
    player1: GameNode;

    /* Current Position for Player */
    playerPos: Vec2;

    /* Gets the last known player position */
    lastPlayerPos: Vec2;

    /* Attack range */
    inRange: number;

    /* Path to player */
    path: NavigationPath;

    /* Path away from player */
    retreatPath: NavigationPath;

    initializeAI(owner: GameNode, config: Record<string, any>): void {
        this.owner = owner;
        
    }

    damage(damage: number): void {
        this.health -= damage;

        // TODO: Do other stuff
    }

}