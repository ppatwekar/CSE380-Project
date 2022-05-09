import GameEvent from "../../../Wolfie2D/Events/GameEvent";
import GameNode from "../../../Wolfie2D/Nodes/GameNode";
import NavigationPath from "../../../Wolfie2D/Pathfinding/NavigationPath";
import Timer from "../../../Wolfie2D/Timing/Timer";
import { Custom_Names, Custom_Statuses } from "../../GameConstants";
import EnemyAI from "../EnemyAI";
import EnemyState from "./EnemyState";
import {EnemyStates} from "../EnemyAI";
import GoapAction from "../../../Wolfie2D/DataTypes/Interfaces/GoapAction";
import AttackAction from "../EnemyActions/Attack";
import RaccoonStoner from "../../GameSystems/Items/WeaponTypes/RaccoonStoner";

export default class Active extends EnemyState{

    pollTimer : Timer;
    exitTimer : Timer;

    constructor(parent : EnemyAI, owner : GameNode){
        super(parent,owner);

        this.pollTimer = new Timer(100);
        this.exitTimer = new Timer(1000);
    }

    retObj : Record<string,any>;

    onEnter(options: Record<string, any>): void {
        this.retObj = {};
        this.retObj = {target : this.parent.lastPlayerPos};
        this.parent.path = this.owner.getScene().getNavigationManager().getPath(Custom_Names.NAVMESH, this.owner.position, this.parent.lastPlayerPos, true);
        this.parent.alert = true;
        
    }

    handleInput(event: GameEvent): void { }

    pickRetreatPath(pathToPlayer: NavigationPath){
        //distance to cover = retreatDistance - distance_enemy_to_ClosestPlayer
       let endpt = pathToPlayer.getMoveDirection(this.owner).scale(-100).add(this.owner.position.clone());

       this.parent.retreatPath = this.owner.getScene().getNavigationManager().getPath(Custom_Names.NAVMESH, this.owner.position,endpt,true);
    }
    update(deltaT: number): void {
        if(this.pollTimer.isStopped()){
            this.pollTimer.start();
            this.parent.playerPos = this.parent.getPlayerPosition();

            if(this.parent.playerPos !== null){
                this.parent.path = this.owner.getScene().getNavigationManager().getPath(Custom_Names.NAVMESH,this.owner.position,this.parent.lastPlayerPos, true);
                this.pickRetreatPath(this.parent.path);
                this.parent.lastPlayerPos = this.parent.playerPos;
                this.exitTimer.start();
            }
        }

        if(this.exitTimer.isStopped()){
            if(this.parent.lastPlayerPos !== null){
                this.retObj = {target : this.parent.lastPlayerPos};
                this.finished(EnemyStates.ALERT);
            }
            else{
                this.finished(EnemyStates.DEFAULT);
            }
            
        }

        if(this.parent.playerPos != null){
            let distance = this.owner.position.distanceTo(this.parent.playerPos);
            if(distance > this.parent.inRange){
                let index = this.parent.currentStatus.indexOf(Custom_Statuses.IN_RANGE);
                if (index != -1) {
                    this.parent.currentStatus.splice(index, 1);
                }
            }
        }

        let nextAction = this.parent.plan.peek();
 
        let result = nextAction.performAction(this.parent.currentStatus,this.parent,deltaT);

        if(result !== null){
            if (nextAction.toString() === "(Retreat)"){ 
                let index = this.parent.currentStatus.indexOf(Custom_Statuses.CAN_RETREAT);
                if (index != -1) {
                    this.parent.currentStatus.splice(index, 1);
                }
            }

            if (nextAction.toString() === "(Berserk)"){
                let index = this.parent.currentStatus.indexOf(Custom_Statuses.CAN_BERSERK);
                if (index != -1) {
                    this.parent.currentStatus.splice(index, 1);
                }
            }

            //if the above does not execute, that means the action has not reached the goal yet
            if (!result.includes(Custom_Statuses.REACHED_GOAL)) {
                this.parent.currentStatus = this.parent.currentStatus.concat(...result);
            }
            this.parent.plan.pop();
        }
        else{
            if(!nextAction.loopAction){
                this.parent.plan.pop();
            }
        }

        


    }
    onExit(): Record<string, any> {
        return this.retObj;
    }
}