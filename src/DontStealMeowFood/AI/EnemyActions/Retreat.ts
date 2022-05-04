import StateMachineGoapAI from "../../../Wolfie2D/AI/StateMachineGoapAI";
import GoapAction from "../../../Wolfie2D/DataTypes/Interfaces/GoapAction";
import Vec2 from "../../../Wolfie2D/DataTypes/Vec2";
import Emitter from "../../../Wolfie2D/Events/Emitter";
import GameNode from "../../../Wolfie2D/Nodes/GameNode";
import NavigationPath from "../../../Wolfie2D/Pathfinding/NavigationPath";
import EnemyAI from "../EnemyAI";

export default class Retreat extends GoapAction {
    private retreatDistance: number;

    private path: NavigationPath;
    protected emitter: Emitter;

    constructor(cost: number, preconditions: Array<string>, effects: Array<string>, options?: Record<string, any>) {
        super();
        this.cost = cost;
        this.preconditions = preconditions;
        this.loopAction = true;
        this.effects = effects;
        this.retreatDistance = options.retreatDistance;
    }

    
    performAction(statuses: Array<string>, actor: StateMachineGoapAI, deltaT: number, target?: StateMachineGoapAI): Array<string> {
        //console.log("enemy retreat");
        if(this.checkPreconditions(statuses)){
            let enemy = <EnemyAI>actor;
            
            let player_distance : number = enemy.owner.position.distanceTo(enemy.player.position);

            let closest_distance : number = player_distance < player_distance ? player_distance : player_distance;

            if(closest_distance >= this.retreatDistance){
                enemy.currentHealth = enemy.maxHealth;
                return this.effects;
            }
            
            this.path = enemy.retreatPath;
            //enemy.owner.rotation = Vec2.UP.angleToCCW(this.path.getMoveDirection(enemy.owner));
            enemy.setAnimation(this.path.getMoveDirection(enemy.owner));
            enemy.owner.moveOnPath(enemy.speed * deltaT, this.path);
            return null;
            
        }
        return this.effects; 
    
    }

    updateCost(options: Record<string, number>): void {}

    toString(): string {
        return "(Retreat)";
    }

}