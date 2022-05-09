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
import EnemyAI from "../AI/EnemyAI";
import PlayerController from "../AI/PlayerController";
import { Custom_Events } from "../GameConstants";
import BattleManager from "../GameSystems/BattleManager";
import HighLight from "../GameSystems/HighLight";
import Item from "../GameSystems/items/Item";
import StoneController from "../GameSystems/Items/WeaponTypes/StoneController";
import GameLevel from "./GameLevel"
import Level_Prisoner from "./Level_Prisoner";
import MainMenu from "./MainMenu";

export default class Level_Garden extends GameLevel{
    private bushes : OrthogonalTilemap;
    private graph : PositionGraph;
    private logo : Sprite;
    
    protected h1 : HighLight;
    private levelEndArea : Rect;
    private rec : Receiver;

    loadScene(): void {
        super.loadScene(); // Loads audio
        this.load.tilemap("gardenLevel","project_assets/tilemaps/Level_garden_tilemap/Level_garden.json");
        this.load.object("navmesh","project_assets/data/Level_garden_data/navmesh.json");
        this.load.object("enemyData","project_assets/data/Level_garden_data/enemy.json");
        this.load.object("items","project_assets/data/Level_garden_data/items.json");
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

        this.spawnItems(this.load.getObject("items"));
        this.setGoal("Find Exit", Color.WHITE, Color.BLACK, new Vec2(32,10));

        this.addLevelEnd(new Vec2(336,411),new Vec2(94,64));

        let weaponData = this.load.getObject("weaponData");

        this.stoneController = new StoneController(this,weaponData.weapons[2].speed);

        this.nextLevel = "Level4";

        this.rec = new Receiver();
        this.rec.subscribe('Custom_Events.COMPLETE_OBJECTIVE');
    }


    events(): void {
        while(this.rec.hasNextEvent()){
            let event = this.rec.getNextEvent();
            if(event.type === Custom_Events.COMPLETE_OBJECTIVE){
                let sceneOptions = {
                    physics : {
                        /**
                         *      pl  ene  yoyo
                         * pl   0    1    1
                         * ene  1    0    1
                         * yoyo 1    1    0
                         */
                        groupNames : ["player","enemy","yoyo","stone","faultyTile"],
                        collisions : 
                        [
                            [0,1,0,1,1],
                            [1,1,0,0,1],
                            [0,0,0,0,0],
                            [1,0,0,0,0],
                            [1,1,0,0,0]
                        ]
                    }
                };
                this.emitter.fireEvent(GameEventType.STOP_SOUND, {key: "level1_music"});
                // this.sceneManager.changeToScene(Level_Prisoner,{},sceneOptions);
                this.sceneManager.changeToScene(MainMenu,{},sceneOptions);

            }
        }
    }

    updateScene(deltaT: number): void {
        this.events();
        super.updateScene(deltaT);
        this.h1.checkClosestEnemies(this.enemies, this.player);

    }
    
    addLevelEnd(position: Vec2, size: Vec2){
        this.levelEndArea = <Rect>this.add.graphic(GraphicType.RECT,"primary",{position : position, size : size});
        this.levelEndArea.addPhysics(undefined, undefined, false, true);
        this.levelEndArea.setTrigger("player", Custom_Events.COMPLETE_OBJECTIVE, null);
        this.levelEndArea.color = new Color(1,0,0,1);
        
    }
}