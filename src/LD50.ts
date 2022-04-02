import {Entity, Game, Log, LogLevel, Scene} from "lagom-engine";
import {TypePane} from "./typing/Selection";


class MainScene extends Scene
{

}

export class LD50 extends Game
{
    constructor()
    {
        super({width: 426, height: 240, resolution: 3, backgroundColor: 0x0d2b45});

        // TODO enable this before deploy
        // Log.logLevel = LogLevel.ERROR;
        Log.logLevel = LogLevel.INFO;

        this.setScene(new MainScene(this));
        this.currentScene.addEntity(new TypePane(0, this.currentScene.camera.height - 100, 1));

    }
}

