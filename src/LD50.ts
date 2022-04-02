import {CollisionMatrix, Game, Log, LogLevel, Scene} from "lagom-engine";
import {TypePane, TypingSystem} from "./typing/Selection";
import {Asteroid, Earth, PhysicsEngine} from "./Physics";

enum Layers
{
    Asteroid,
    Earth,
    Ship,
    GUI
}


const matrix = new CollisionMatrix();
matrix.addCollision(Layers.Asteroid, Layers.Asteroid);
matrix.addCollision(Layers.Asteroid, Layers.Earth);
matrix.addCollision(Layers.Asteroid, Layers.Ship);
matrix.addCollision(Layers.Ship, Layers.Earth);
matrix.addCollision(Layers.Ship, Layers.Ship);


class MainScene extends Scene
{
    onAdded()
    {
        super.onAdded();

        this.addEntity(new Earth("earth", 213, 120));
        this.addEntity(new Asteroid(10, 19));

        this.addSystem(new PhysicsEngine());
    }
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

        this.currentScene.addSystem(new TypingSystem());

        this.currentScene.addEntity(new TypePane(0, this.currentScene.camera.height - 100, Layers.GUI));

    }
}

