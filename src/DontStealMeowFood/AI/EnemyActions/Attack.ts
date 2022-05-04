import StateMachineGoapAI from "../../../Wolfie2D/AI/StateMachineGoapAI";
import GoapAction from "../../../Wolfie2D/DataTypes/Interfaces/GoapAction";
import Vec2 from "../../../Wolfie2D/DataTypes/Vec2";
import Emitter from "../../../Wolfie2D/Events/Emitter";
import GameNode from "../../../Wolfie2D/Nodes/GameNode";
import EnemyAI from "../EnemyAI";
import { AState } from "../ProjectAnimations/DirectionStates/DirectionEnums";

export default class AttackAction extends GoapAction {
    protected emitter: Emitter;
    
    constructor(cost: number, preconditions: Array<string>, effects: Array<string>, options?: Record<string, any>) {
        super();
        this.cost = cost;
        this.preconditions = preconditions;
        this.effects = effects;
    }

    /**
     * Once the enemy goes out of Attacking, if the weapon is a stone, send out an event saying enemy out of attacking and in handle events, disable all active stones.
     */

    performAction(statuses: Array<string>, actor: StateMachineGoapAI, deltaT: number, target?: StateMachineGoapAI): Array<string> {
        //Check if preconditions are met for this action to be performed
        //console.log("perform attack")
        if (this.checkPreconditions(statuses)){
            //console.log("precondition", this.preconditions);
            let enemy = <EnemyAI>actor;

            //If the player is out of sight, don't bother attacking
            if (enemy.getPlayerPosition() == null){
                return null;
            }

            //enemy.setAnimation(enemy.currentAnimatiionMoveDirection,AState.Attack);

            //Randomize attack direction, gives the enemy gun users stormtrooper aim
            let dir = enemy.getPlayerPosition().clone().sub(enemy.owner.position).normalize();
            dir.rotateCCW(Math.PI / 4 * Math.random() - Math.PI/8);
            if(enemy.weapon){
                // If we fired, face that direction
                //enemy.owner.rotation = Vec2.UP.angleToCCW(dir);
                enemy.weapon.use(enemy.owner, "enemy", dir);            }
            
            return this.effects;
        }
        return null;
    }

    updateCost(options: Record<string, number>): void {}
    
    toString(): string {
        return "(AttackAction)";
    }
    
}