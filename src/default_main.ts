import Game from "./Wolfie2D/Loop/Game";
import default_scene from "./default_scene";
import WeaponTemplateRegistry from "./DontStealMeowFood/Registry/WeaponRegistry";
import WeaponTypeRegistry from "./DontStealMeowFood/Registry/WeaponTypeRegistry";
import RegistryManager from "./Wolfie2D/Registry/RegistryManager";

// The main function is your entrypoint into Wolfie2D. Specify your first scene and any options here.
(function main(){
    // Run any tests
    runTests();

    // Set up options for our game
    let options = {
        canvasSize: {x: 1200, y: 800},          // The size of the game
        clearColor: {r: 0, g: 0, b: 0},   // The color the game clears to
        useWebGL: true
    }

    // Create a game with the options specified
    const game = new Game(options);

    // Set up custom registries
    let weaponTemplateRegistry = new WeaponTemplateRegistry();
    RegistryManager.addCustomRegistry("weaponTemplates", weaponTemplateRegistry);
    
    let weaponTypeRegistry = new WeaponTypeRegistry();
    RegistryManager.addCustomRegistry("weaponTypes", weaponTypeRegistry);

    // Start our game
    game.start(default_scene, {});
})();

function runTests(){};