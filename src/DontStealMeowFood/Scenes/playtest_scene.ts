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
import Color from "../../Wolfie2D/Utils/Color";
import Level_Garden from "./Level_Garden";

export default class playtest_scene extends GameLevel{
    private bushes : OrthogonalTilemap;
    private graph : PositionGraph;
    private logo : Sprite
    // A list of items
    protected h1 : HighLight;
    private totalCatFoods : number;
    
    loadScene(): void {
        super.loadScene();
        this.load.tilemap("playTestLevel","project_assets/tilemaps/Level2/sampleMap.json");
        this.load.object("navmesh","project_assets/data/Level2/navmesh.json");
        this.load.object("enemyData","project_assets/data/Level2/enemy.json");
        this.load.object("weaponData","project_assets/data/weaponData.json");
        this.load.object("items","project_assets/data/Level2/items.json");
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


        let weaponData = this.load.getObject("weaponData");

        this.stoneController = new StoneController(this,weaponData.weapons[2].speed);

        this.spawnItems(this.load.getObject("items"));

        //this.setGoal("Objective: Kill all raccoons!!",Color.WHITE,Color.BLACK,new Vec2(80,10));

        this.nextLevel = "Level3";

        this.setGoal("Objective: Kill all raccoons!! Raccoons Left : "+this.enemies.length,Color.WHITE,Color.BLACK,new Vec2(80,10));


    }


    updateScene(deltaT: number): void {
        this.stoneController.update();

        super.updateScene(deltaT);
        this.goalDisplay.text = "Objective: Kill all raccoons!! Raccoons Left : "+this.enemies.length;

        this.h1.checkClosestEnemies(this.enemies, this.player);
        if(this.enemies.length === 0){
            let sceneOptions = {
                physics : {
                    /**
                     *      pl  ene  yoyo ston
                     * pl   0    1    1    1
                     * ene  1    0    1    1
                     * yoyo 1    1    0    0
                     * ston 1    1    0    0
                     */
                    groupNames : ["player","enemy","yoyo","stone"],
                    collisions : 
                    [
                        [0,1,0,1],
                        [1,1,0,0],
                        [0,0,0,0],
                        [1,0,0,0]
                    ]
                }
            };
            this.emitter.fireEvent(GameEventType.STOP_SOUND, {key: "level1_music"});
            this.sceneManager.changeToScene(Level_Garden,{},sceneOptions);
        }
    }

    


    
    


}