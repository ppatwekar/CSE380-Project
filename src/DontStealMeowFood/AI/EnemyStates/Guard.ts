import Vec2 from "../../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../../../Wolfie2D/Events/GameEvent";
import GameNode from "../../../Wolfie2D/Nodes/GameNode";
import NavigationPath from "../../../Wolfie2D/Pathfinding/NavigationPath";
import { Custom_Events, Custom_Names } from "../../GameConstants";
import EnemyAI, { EnemyStates } from "../EnemyAI";
import EnemyState from "./EnemyState";

export default class Guard extends EnemyState{
    private guardPosition : Vec2;

    private route : NavigationPath;

    private retObj : Record<string,any>;

    private awayFromGuardPosition: boolean;


    constructor(parent : EnemyAI, owner : GameNode, guardPosition : Vec2){
        super(parent,owner);
        this.guardPosition = guardPosition;
    }


    onEnter(options: Record<string, any>): void {
        if(!(this.owner.position.distanceSqTo(this.guardPosition)< 8*8)){
            this.awayFromGuardPosition = true;
            this.owner.pathfinding = true;
            this.route = this.owner.getScene().getNavigationManager().getPath(Custom_Names.NAVMESH, this.owner.position, this.guardPosition);
        }
        else{
            this.awayFromGuardPosition = false;
            this.owner.pathfinding = false;
        }
        this.parent.alert = false;
    }
    handleInput(event: GameEvent): void {

    }
    update(deltaT: number): void {
        if(this.awayFromGuardPosition){
            if(this.route.isDone()){
                this.awayFromGuardPosition = false;
                this.owner.pathfinding = false;
            }
            else{
                this.owner.moveOnPath(this.parent.speed,this.route);
                //this.owner.rotation = Vec2.UP.angleToCCW(this.route.getMoveDirection(this.owner));
                //Only needed to rotate sprite. Not needed for us.
                
            }
        }

        this.parent.lastPlayerPos = this.parent.getPlayerPosition();
        if(this.parent.lastPlayerPos !== null){
            this.finished(EnemyStates.TARGETING);
        }

    }
    onExit(): Record<string, any> {
        return this.retObj;
    }
}