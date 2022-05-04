import StateMachineGoapAI from "../../../Wolfie2D/AI/StateMachineGoapAI";
import GoapAction from "../../../Wolfie2D/DataTypes/Interfaces/GoapAction";
import Vec2 from "../../../Wolfie2D/DataTypes/Vec2";
import Emitter from "../../../Wolfie2D/Events/Emitter";
import NavigationPath from "../../../Wolfie2D/Pathfinding/NavigationPath";
import RaccoonStoner from "../../GameSystems/Items/WeaponTypes/RaccoonStoner";
import EnemyAI from "../EnemyAI";

export default class Move extends GoapAction {
    private inRange: number;

    private path: NavigationPath;
    protected emitter: Emitter;
    
    constructor(cost: number, preconditions: Array<string>, effects: Array<string>, options?: Record<string, any>) {
        super();
        this.cost = cost;
        this.preconditions = preconditions;
        this.effects = effects;
        this.loopAction = true;
        this.inRange = options.inRange;
    }

    performAction(statuses: Array<string>, actor: StateMachineGoapAI, deltaT: number, target?: StateMachineGoapAI): Array<string> {
        //console.log("enemy moving");
        if (this.checkPreconditions(statuses)){
            //Check distance from player
            let enemy = <EnemyAI>actor;
            this.inRange = enemy.weapon.type instanceof RaccoonStoner ? 100 : 32; //best way I found to assign range to different weapons without changing too much code
            let playerPos = enemy.lastPlayerPos;
            let distance = enemy.owner.position.distanceTo(playerPos);

            //If close enough, we've moved far enough and this loop action is done
            if (distance <= this.inRange){
                return this.effects;
            }

            //Otherwise move on path
            this.path = enemy.path;
            //enemy.owner.rotation = Vec2.UP.angleToCCW(this.path.getMoveDirection(enemy.owner));
            enemy.setAnimation(this.path.getMoveDirection(enemy.owner),null);
            enemy.owner.moveOnPath(enemy.speed * deltaT, this.path);
            return null;
        }
        return this.effects;
    }

    updateCost(options: Record<string, number>): void {}

    toString(): string {
        return "(Move)";
    }
    
}