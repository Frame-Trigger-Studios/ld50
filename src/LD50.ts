import {Game, Log, LogLevel, Scene} from "lagom-engine";


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
    }
}
