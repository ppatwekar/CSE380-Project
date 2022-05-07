import PositionGraph from "../../Wolfie2D/DataTypes/Graphs/PositionGraph";
import AABB from "../../Wolfie2D/DataTypes/Shapes/AABB";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import { GraphicType } from "../../Wolfie2D/Nodes/Graphics/GraphicTypes";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Sprite from "../../Wolfie2D/Nodes/Sprites/Sprite";
import OrthogonalTilemap from "../../Wolfie2D/Nodes/Tilemaps/OrthogonalTilemap";
import Navmesh from "../../Wolfie2D/Pathfinding/Navmesh";
import BattlerAI from "../AI/BattlerAI";
import EnemyAI from "../AI/EnemyAI";
import PlayerController from "../AI/PlayerController";
import { Custom_Events, Custom_Names, Custom_Statuses } from "../GameConstants";
import Item from "../GameSystems/items/Item";
import HighLight from "../GameSystems/HighLight";
import GameLevel from "./GameLevel";
import BattleManager from "../GameSystems/BattleManager";
import Label from "../../Wolfie2D/Nodes/UIElements/Label";
import { UIElementType } from "../../Wolfie2D/Nodes/UIElements/UIElementTypes";
import { GameEventType } from "../../Wolfie2D/Events/GameEventType";
import AttackAction from "../AI/EnemyActions/Attack";
import Move from "../AI/EnemyActions/Move";
import Retreat from "../AI/EnemyActions/Retreat";
import StoneController from "../GameSystems/Items/WeaponTypes/StoneController";
import AudioManager, { AudioChannelType } from "../../Wolfie2D/Sound/AudioManager";

export default class playtest_scene extends GameLevel{
    private bushes : OrthogonalTilemap;
    private graph : PositionGraph;
    private logo : Sprite
    // A list of items
    private items: Array<Item>;
    protected h1 : HighLight;
    
    loadScene(): void {
        this.load.tilemap("playTestLevel","project_assets/tilemaps/sampleMap.json");
        this.load.object("navmesh","project_assets/data/navmesh.json");
        this.load.spritesheet("cat","project_assets/spritesheets/cat.json");
        this.load.spritesheet("raccoon","project_assets/spritesheets/raccoon.json")
        this.load.object("enemyData","project_assets/data/enemy.json");
        this.load.image("inventorySlot", "project_assets/sprites/inventory.png");
        this.load.image("yoyo","project_assets/item/yoyo.png");
        this.load.object("weaponData","project_assets/data/weaponData.json");
        this.load.audio("level1_music", "project_assets/music/theme_music.mp3");
        this.load.image("stone","project_assets/item/Stone.png");
    }


    startScene(): void {
        this.playerSpawn = Vec2.ZERO;
        let tilemapLayers = this.add.tilemap("playTestLevel", new Vec2(0.5,0.5));
        this.bushes = <OrthogonalTilemap>tilemapLayers[1].getItems()[0];

        let tilemapSize : Vec2 = this.bushes.size.scaled(0.5);
        this.viewport.setBounds(0,0,tilemapSize.x,tilemapSize.y);

        

        // let center = this.viewport.getCenter();

        // let options = {
        //     size : new Vec2(32,32),
        //     position : new Vec2(117,503) //if tiled has location (x,y) then location here is (x/2,y/2)

        // }
        this.initializeWeapons();
        super.startScene();
        this.viewport.setZoomLevel(4);
        this.createNavmesh("navmesh");

        this.initializeEnemies(this.load.getObject("enemyData"));

        this.battleManager = new BattleManager();
        this.battleManager.setPlayers([<BattlerAI>this.player._ai]);
        this.battleManager.setEnemies(this.enemies.map(enemy => <BattlerAI>enemy._ai));

        (<PlayerController>this.player._ai).weapon = this.createWeapon("yoyo");

        (<PlayerController>this.player._ai).enemies = this.enemies;

        this.initializeEnemyWeapons(this.enemies);
        this.h1 = new HighLight();

        this.setGoal("Objective: Playtest!");
        this.emitter.fireEvent(GameEventType.PLAY_MUSIC, {key: "level1_music", loop: true, holdReference: true});

        let weaponData = this.load.getObject("weaponData");

        this.stoneController = new StoneController(this,weaponData.weapons[2].speed);
    }


    updateScene(deltaT: number): void {
        this.stoneController.update();
        super.updateScene(deltaT);
        this.h1.checkClosestEnemies(this.enemies, this.player);
    }

    


    
    


}