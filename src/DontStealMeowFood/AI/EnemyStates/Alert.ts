import GameEvent from "../../../Wolfie2D/Events/GameEvent";
import GameNode from "../../../Wolfie2D/Nodes/GameNode";
import NavigationPath from "../../../Wolfie2D/Pathfinding/NavigationPath";
import Timer from "../../../Wolfie2D/Timing/Timer";
import { Custom_Names } from "../../GameConstants";
import EnemyAI, { EnemyStates } from "../EnemyAI";
import EnemyState from "./EnemyState";

export default class Alert extends EnemyState{

    private alertTimer : Timer; //tells how long to be alerted for

    private path : NavigationPath; //The path to move towards the alert position (last seen player)

    constructor(parent : EnemyAI, owner : GameNode){
        super(parent,owner);
        this.alertTimer = new Timer(10000);
    }


    onEnter(options: Record<string, any>): void {
        this.alertTimer.start();
        this.path = this.owner.getScene().getNavigationManager().getPath(Custom_Names.NAVMESH,this.owner.position,options.target,true);
        this.parent.setAnimation(this.path.getMoveDirection(this.parent.owner),null);

    }
    handleInput(event: GameEvent): void {

    }
    update(deltaT: number): void {
        if(this.alertTimer.isStopped()){ 
            //put condition here to check of all the other enemies visible, if anyone is in an active state
            //transition to the 'Following' state i.e follow them. 
            //implement a Follow.ts enemy action
            //in onExit() function, make sure to send in the enemy object that is supposed to be followed.
            this.finished(EnemyStates.DEFAULT);
            return;
        }
        else{
            if(!this.path.isDone()){
                this.owner.moveOnPath(this.parent.speed *deltaT, this.path);
            }
            else{
                this.finished(EnemyStates.DEFAULT);
            }
        }

        this.parent.lastPlayerPos = this.parent.getPlayerPosition();
        if(this.parent.lastPlayerPos !== null){
            this.finished(EnemyStates.TARGETING);
        }

    }
    onExit(): Record<string, any> {
        return {};
    }


}