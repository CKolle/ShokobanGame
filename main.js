import { GameScene } from './scenes/GameScene.js';

const config = {
    title: 'Blocs',
    type: Phaser.AUTO,
    backgroundColor: "#192a56",
    width: 800,
    height: 600,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    autoRound: false,
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 0 },
            debug: false,
        },
    },
    plugins: {},
    scene: [GameScene]
};

new Phaser.Game(config);
 