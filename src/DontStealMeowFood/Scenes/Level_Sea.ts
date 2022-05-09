import PositionGraph from "../../Wolfie2D/DataTypes/Graphs/PositionGraph";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import { GameEventType } from "../../Wolfie2D/Events/GameEventType";
import Receiver from "../../Wolfie2D/Events/Receiver";
import { GraphicType } from "../../Wolfie2D/Nodes/Graphics/GraphicTypes";
import Rect from "../../Wolfie2D/Nodes/Graphics/Rect";
import Sprite from "../../Wolfie2D/Nodes/Sprites/Sprite";
import OrthogonalTilemap from "../../Wolfie2D/Nodes/Tilemaps/OrthogonalTilemap";
import Color from "../../Wolfie2D/Utils/Color";
import BattlerAI from "../AI/BattlerAI";
import PlayerController from "../AI/PlayerController";
import { Custom_Events } from "../GameConstants";
import BattleManager from "../GameSystems/BattleManager";
import HighLight from "../GameSystems/HighLight";
import Item from "../GameSystems/items/Item";
import StoneController from "../GameSystems/Items/WeaponTypes/StoneController";
import GameLevel from "./GameLevel"
import Level_Boss from "./Level_Boss";

export default class Level_Sea extends GameLevel{
    private bushes : OrthogonalTilemap;
    private graph : PositionGraph;
    private logo : Sprite;
    
    protected h1 : HighLight;
    protected food: number;
    protected totalFood: number;
    private rec : Receiver;

    loadScene(): void {
        super.loadScene(); // Loads audio
        this.load.tilemap("gardenLevel","project_assets/tilemaps/Level_Sea_tilemap/Level_Sea.json");
        this.load.object("navmesh","project_assets/data/Level_Sea_data/navmesh.json");
        this.load.object("enemyData","project_assets/data/Level_Sea_data/enemy.json");
        this.load.object("weaponData","project_assets/data/weaponData.json");
        this.load.object("items","project_assets/data/Level_Sea_data/items.json");
    }

    startScene(): void {
        this.playerSpawn = new Vec2(80,950);
        let tilemapLayers = this.add.tilemap("gardenLevel", new Vec2(0.5,0.5));
        this.bushes = <OrthogonalTilemap>tilemapLayers[1].getItems()[0];

        let tilemapSize : Vec2 = this.bushes.size.scaled(0.5);
        this.viewport.setBounds(0,0,tilemapSize.x,tilemapSize.y);

        this.initializeWeapons();
        super.startScene({zoomLevel: 3});
        this.createNavmesh("navmesh");

        this.initializeEnemies(this.load.getObject("enemyData"));

        this.battleManager = new BattleManager();
        this.battleManager.setPlayers([<BattlerAI>this.player._ai]);
        this.battleManager.setEnemies(this.enemies.map(enemy => <BattlerAI>enemy._ai));

        (<PlayerController>this.player._ai).weapon = this.createWeapon("yoyo");

        (<PlayerController>this.player._ai).enemies = this.enemies;

        this.initializeEnemyWeapons(this.enemies);
        this.h1 = new HighLight();

        let items = this.load.getObject("items");

        this.food = 0;
        this.totalFood = items.numFood;
        this.spawnItems(items);

        this.setGoal("Find All Food:"+this.food+"/"+this.totalFood, Color.WHITE, Color.BLACK, new Vec2(60,10));

        let weaponData = this.load.getObject("weaponData");
        this.stoneController = new StoneController(this,weaponData.weapons[2].speed);

        this.nextLevel = "Level6";
    }

    updateScene(deltaT: number): void {
        super.updateScene(deltaT);
        this.h1.checkClosestEnemies(this.enemies, this.player);

        this.food = (<PlayerController>this.player._ai).numFoodItems;
        this.goalDisplay.text = "Find All Food:"+this.food+"/"+this.totalFood;

        if(this.food<=0){
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
            this.sceneManager.changeToScene(Level_Boss,{},sceneOptions);
        }
    }

}