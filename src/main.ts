import Phaser from "phaser";

import MainGame from "./Game";

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: "phaser-example",
    backgroundColor: "#ffffff",
    scene: [MainGame],
    roundPixels: true,
    width: 1920,
    height: 1920,
    scale: {
        mode: Phaser.Scale.SHOW_ALL,
        //autoCenter: Phaser.Scale.CENTER_BOTH,
	},
};

export default new Phaser.Game(config);

