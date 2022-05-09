import PositionGraph from "../../Wolfie2D/DataTypes/Graphs/PositionGraph";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import { GameEventType } from "../../Wolfie2D/Events/GameEventType";
import Receiver from "../../Wolfie2D/Events/Receiver";
import Input from "../../Wolfie2D/Input/Input";
import { GraphicType } from "../../Wolfie2D/Nodes/Graphics/GraphicTypes";
import Rect from "../../Wolfie2D/Nodes/Graphics/Rect";
import Sprite from "../../Wolfie2D/Nodes/Sprites/Sprite";
import OrthogonalTilemap from "../../Wolfie2D/Nodes/Tilemaps/OrthogonalTilemap";
import Label from "../../Wolfie2D/Nodes/UIElements/Label";
import { UIElementType } from "../../Wolfie2D/Nodes/UIElements/UIElementTypes";
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
import MainMenu from "./MainMenu";

export default class Level_Boss extends GameLevel{
    private bushes : OrthogonalTilemap;
    private graph : PositionGraph;
    private logo : Sprite;
    
    protected h1 : HighLight;
    private levelEndArea : Rect;
    private rec : Receiver;

    loadScene(): void {
        super.loadScene(); // Loads audio
        this.load.tilemap("bossLevel","project_assets/tilemaps/level_boss_tilemap/level_boss.json");
        this.load.object("navmesh","project_assets/data/level_boss_data/navmesh.json");
        this.load.object("enemyData","project_assets/data/level_boss_data/enemy.json");
    }

    startScene(): void {
        this.playerSpawn = new Vec2(464/2,1744/2); // ACTUAL
        // this.playerSpawn = new Vec2(1904/2,88/2); // DEBUG
        let tilemapLayers = this.add.tilemap("bossLevel", new Vec2(0.5,0.5));
        this.bushes = <OrthogonalTilemap>tilemapLayers[1].getItems()[0];

        let tilemapSize : Vec2 = this.bushes.size.scaled(0.5);
        this.viewport.setBounds(0,0,tilemapSize.x,tilemapSize.y);

        this.initializeWeapons();
        super.startScene({zoomLevel: 4});
        // this.viewport.setZoomLevel(4);
        this.createNavmesh("navmesh");
        this.initializeEnemies(this.load.getObject("enemyData"));

        this.battleManager = new BattleManager();
        this.battleManager.setPlayers([<BattlerAI>this.player._ai]);
        this.battleManager.setEnemies(this.enemies.map(enemy => <BattlerAI>enemy._ai));

        (<PlayerController>this.player._ai).weapon = this.createWeapon("yoyo");

        (<PlayerController>this.player._ai).enemies = this.enemies;

        this.initializeEnemyWeapons(this.enemies);
        this.h1 = new HighLight();

        this.setGoal("Defeat the Raccoon Boss", Color.WHITE, Color.BLACK, new Vec2(50, 10));
        // this.setGoal("Get All of Your Food Back!", Color.WHITE, Color.BLACK, new Vec2(51, 20));

        this.bossHealthDisplay.padding = new Vec2(10, 10);
        this.bossHealthDisplay.textColor = Color.ORANGE;
        this.bossHealthDisplay.backgroundColor = Color.BLACK;

        // this.addLevelEnd(new Vec2(336,411),new Vec2(94,64));

        let weaponData = this.load.getObject("weaponData");

        this.stoneController = new StoneController(this,weaponData.weapons[2].speed);
    }

    updateScene(deltaT: number): void {
        super.updateScene(deltaT);
        this.h1.checkClosestEnemies(this.enemies, this.player);
        this.stoneController.update();
        if (this.boss) {
            let bossHealth = (<EnemyAI>this.boss._ai).currentHealth;
            if (Input.isKeyJustPressed("k")) {
                bossHealth = 0;
            }
            if (bossHealth <= 0) {
                this.emitter.fireEvent(GameEventType.STOP_SOUND, {key: "level1_music"});
                this.sceneManager.changeToScene(MainMenu, {});
            }
            this.bossHealthDisplay.text = "Boss Remaining Health: " + bossHealth;
        }
    }

    addLevelEnd(position: Vec2, size: Vec2){
        this.levelEndArea = <Rect>this.add.graphic(GraphicType.RECT,"primary",{position : position, size : size});
        this.levelEndArea.addPhysics(undefined, undefined, false, true);
        this.levelEndArea.setTrigger("player", Custom_Events.COMPLETE_OBJECTIVE, null);
        this.levelEndArea.color = new Color(1,0,0,1);
    }

    setCustomProperties(): void {
        for (let enemy of this.enemies) {
            let e = (<EnemyAI>enemy._ai);
            if (e.custID === "bossman") {
                e.inRange = 550;
                e.speed = (<PlayerController>this.player._ai).getSpeed() + 5;
                e.vision = 550;
            }
            
        }
    }
}