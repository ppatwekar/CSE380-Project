import Game from "./Wolfie2D/Loop/Game";
// import MainMenu from "./Homework5/Scenes/MainMenu";
import playtest_scene from "./DontStealMeowFood/Scenes/playtest_scene";
import MainMenu from "./DontStealMeowFood/Scenes/MainMenu";

// The main function is your entrypoint into Wolfie2D. Specify your first scene and any options here.
(function main(){
    // Run any tests
    runTests();

    // Set up options for our game
    let options = {
        canvasSize: {x: 1200, y: 800},          // The size of the game
        clearColor: {r: 34, g: 32, b: 52},   // The color the game clears to
        inputs: [
            {name: "left", keys: ["a"]},
            {name: "right", keys: ["d"]},
            {name: "up", keys: ["w", "space"]},
            {name: "down", keys: ["s"]},
            {name: "pickup", keys: ["e"]},
            {name: "drop", keys: ["q"]},
            {name: "slot1", keys: ["1"]},
            {name: "slot2", keys: ["2"]},
            {name: "slot3", keys: ["3"]},
            {name: "slot4", keys: ["4"]},
            {name: "slot5", keys: ["5"]}
        ],
        useWebGL: false,                        // Tell the game we want to use webgl
        showDebug: false                       // Whether to show debug messages. You can change this to true if you want
    }

    // Create a game with the options specified
    const game = new Game(options);

    // Start our game
    // game.start(playtest_scene, {});
    game.start(MainMenu, {});
})();

function runTests(){};