import Vec2 from "../../../../Wolfie2D/DataTypes/Vec2";
import GameNode from "../../../../Wolfie2D/Nodes/GameNode";
import Scene from "../../../../Wolfie2D/Scene/Scene";
import EnemyAI from "../../../AI/EnemyAI";
import { AState } from "../../../AI/ProjectAnimations/DirectionStates/DirectionEnums";
import WeaponType from "./WeaponType";

export default class RaccoonClaw extends WeaponType{
    initialize(options: Record<string, any>): void {
        this.spriteKey = options.spriteKey;
        this.damage = options.damage;
        this.displayName = options.displayName,
        this.cooldown = options.cooldown;
        this.useVolume = options.useVolume;

    }
    
    doAnimation(attacker : GameNode, direction : Vec2): void {
        let enemy = <EnemyAI>attacker._ai;
        enemy.setAnimation(direction,AState.Attack);
    }
    
    createRequiredAssets(scene: Scene): any[] {
        return [];
    }
    hits(node: GameNode, ...args: any): boolean {
        return false;
    }
    clone(): WeaponType {
        let newType = new RaccoonClaw();
        newType.initialize({spriteKey : this.spriteKey, damage : this.damage, displayName : this.displayName, cooldown : this.cooldown, useVolume : this.useVolume});
        return newType;
    }
    
}