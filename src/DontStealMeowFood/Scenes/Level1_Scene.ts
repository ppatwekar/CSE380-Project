import PositionGraph from "../../Wolfie2D/DataTypes/Graphs/PositionGraph";
import AABB from "../../Wolfie2D/DataTypes/Shapes/AABB";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import { GameEventType } from "../../Wolfie2D/Events/GameEventType";
import { GraphicType } from "../../Wolfie2D/Nodes/Graphics/GraphicTypes";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Sprite from "../../Wolfie2D/Nodes/Sprites/Sprite";
import OrthogonalTilemap from "../../Wolfie2D/Nodes/Tilemaps/OrthogonalTilemap";
import Label from "../../Wolfie2D/Nodes/UIElements/Label";
import { UIElementType } from "../../Wolfie2D/Nodes/UIElements/UIElementTypes";
import Navmesh from "../../Wolfie2D/Pathfinding/Navmesh";
import Color from "../../Wolfie2D/Utils/Color";
import BattlerAI from "../AI/BattlerAI";
import EnemyAI from "../AI/EnemyAI";
import PlayerController from "../AI/PlayerController";
import { Custom_Events, Custom_Names, Custom_Statuses } from "../GameConstants";
import BattleManager from "../GameSystems/BattleManager";
import HighLight from "../GameSystems/HighLight";
import Item from "../GameSystems/items/Item";
import GameLevel from "./GameLevel";
import AttackAction from "../AI/EnemyActions/Attack";
import Move from "../AI/EnemyActions/Move";
import Retreat from "../AI/EnemyActions/Retreat";
import Rect from "../../Wolfie2D/Nodes/Graphics/Rect";
import playtest_scene from "./playtest_scene";
import Receiver from "../../Wolfie2D/Events/Receiver";
import Level_Garden from "./Level_Garden";

export default class Level1_Scene extends GameLevel {
    private bushes : OrthogonalTilemap;
    private graph : PositionGraph;
    private logo : Sprite
    //private enemies : Array<AnimatedSprite>;
    // A list of items
    protected h1 : HighLight;

    private levelEndArea: Rect;
    private r = new Receiver();

    loadScene(): void {
        super.loadScene();
        this.load.tilemap("level1","project_assets/tilemaps/level1_tilemap/TutorialLevel.json");
        this.load.object("navmesh","project_assets/data/level1_data/navmesh.json");
        this.load.object("enemyData","project_assets/data/level1_data/enemy.json");
        this.load.object("items", "project_assets/data/level1_data/items.json");
    }

    startScene(): void {
        // this.playerSpawn = new Vec2(288/2, 1760/2);
        this.playerSpawn = new Vec2(840/2, 888/2);
        let tilemapLayers = this.add.tilemap("level1", new Vec2(0.5,0.5));
        this.bushes = <OrthogonalTilemap>tilemapLayers[1].getItems()[0];
        console.log(this.bushes.size);

        let tilemapSize : Vec2 = this.bushes.size.scaled(0.5);
        this.viewport.setBounds(0,0,tilemapSize.x,tilemapSize.y);
        this.viewport.setFocus(this.viewport.getHalfSize());

        

        // let center = this.viewport.getCenter();

        // let options = {
        //     size : new Vec2(32,32),
        //     position : new Vec2(117,503) //if tiled has location (x,y) then location here is (x/2,y/2)

        // }

        this.initializeWeapons();
        super.startScene({zoomLevel: 3});
        // this.initializePlayer();

        this.createNavmesh("navmesh");

        this.initializeEnemies(this.load.getObject("enemyData"));

        this.battleManager = new BattleManager();
        this.battleManager.setPlayers([<BattlerAI>this.player._ai]);
        this.battleManager.setEnemies(this.enemies.map(enemy => <BattlerAI>enemy._ai));

        (<PlayerController>this.player._ai).weapon = this.createWeapon("yoyo");

        (<PlayerController>this.player._ai).enemies = this.enemies;
        this.h1 = new HighLight();

        this.setGoal("Find the Exit!", Color.BLACK, Color.WHITE, new Vec2(40, 10));
        // this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: "level1_music", loop: true, holdReference: true});

        this.spawnItems(this.load.getObject("items"));

        this.addLevelEnd(new Vec2(704/2, 832/2), new Vec2(32, 32));
        this.r.subscribe("levelEnd");
    }

    updateScene(deltaT: number): void {
        super.updateScene(deltaT);
        this.h1.checkClosestEnemies(this.enemies, this.player);
        while (this.r.hasNextEvent()) {
            let event = this.r.getNextEvent();
            if (event.type === "levelEnd") {
                console.log("WHAT?");
                this.emitter.fireEvent(GameEventType.STOP_SOUND, {key: "level1_music"});
                this.sceneManager.changeToScene(playtest_scene, {}, this.sceneOptions);
            }
        }
        // console.log(this.player.position.x +  ", y: " + this.player.position.y);
    }

    
    addLevelEnd(position: Vec2, size: Vec2) {
        this.levelEndArea = <Rect>this.add.graphic(GraphicType.RECT,"primary",{position : position, size : size});
        this.levelEndArea.addPhysics(undefined, undefined, false, true);
        this.levelEndArea.setTrigger("player", "levelEnd", null);
        this.levelEndArea.color = new Color(1,0,0,1);
    }
    

}