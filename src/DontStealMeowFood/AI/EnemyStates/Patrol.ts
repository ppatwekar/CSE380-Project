import Vec2 from "../../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../../../Wolfie2D/Events/GameEvent";
import GameNode from "../../../Wolfie2D/Nodes/GameNode";
import NavigationPath from "../../../Wolfie2D/Pathfinding/NavigationPath";
import { Custom_Names } from "../../GameConstants";
import EnemyAI, { EnemyStates } from "../EnemyAI";
import EnemyState from "./EnemyState";

export default class Patrol extends EnemyState{
    protected patrolRoute : Array<Vec2>;

    protected routeIndex : number;

    protected currentPath : NavigationPath;

    protected retObj : Record<string,any>;


    constructor(parent : EnemyAI, owner : GameNode, patrolRoot : Array<Vec2>){
        super(parent,owner);
        this.patrolRoute = patrolRoot;
        this.routeIndex = 0;
    }

    onEnter(options: Record<string, any>): void {
        this.currentPath = this.getNextPath();
    }
    handleInput(event: GameEvent): void {

    }
    update(deltaT: number): void {
        
        this.parent.lastPlayerPos = this.parent.getPlayerPosition();
        //console.log("pos", this.parent.lastPlayerPos);
        if(this.parent.lastPlayerPos !== null){
            this.finished(EnemyStates.TARGETING);
        }
        else{
            // if(this.currentPath.isDone()){
            //     this.currentPath = this.getNextPath();
            //     this.owner.moveOnPath(this.parent.speed * deltaT, this.currentPath);
            //     //this.owner.rotation = Vec2.UP.angleToCCW(this.currentPath.getMoveDirection(this.owner));
            // }
            if(this.currentPath.isDone()){
                this.currentPath = this.getNextPath();
            } else {
                this.owner.moveOnPath(this.parent.speed * deltaT, this.currentPath);
                this.parent.setAnimation(this.currentPath.getMoveDirection(this.owner));
                //this.owner.rotation = Vec2.UP.angleToCCW(this.currentPath.getMoveDirection(this.owner));
            }
        }
        

        /* ONLY PATROLS!
        if(this.currentPath.isDone()){
            this.currentPath = this.getNextPath();
        } else {
            this.owner.moveOnPath(this.parent.speed * deltaT, this.currentPath);
            this.parent.anime.update(this.currentPath.getMoveDirection(this.owner));
            //this.owner.rotation = Vec2.UP.angleToCCW(this.currentPath.getMoveDirection(this.owner));
        }
        */
    }
    onExit(): Record<string, any> {
        return this.retObj;
    }

    getNextPath() : NavigationPath{
        let path = this.owner.getScene().getNavigationManager().getPath(Custom_Names.NAVMESH, this.owner.position, this.patrolRoute[this.routeIndex]);
        this.routeIndex = (this.routeIndex + 1)%this.patrolRoute.length;
        return path;
    }
}