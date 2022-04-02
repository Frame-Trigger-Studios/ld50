import {CollisionMatrix, Game, Log, LogLevel, Scene} from "lagom-engine";
import {TypePane, TypingSystem} from "./typing/Selection";
import {Asteroid, Earth, PhysicsEngine} from "./Physics";
import {GameManager, GameManagerSystem} from "./Code/GameManager";

export enum Layers
{
    Asteroid,
    Earth,
    Ship,
    GUI
}

export const CANVAS_WIDTH = 426;
export const GAME_WIDTH = 426;
export const GAME_HEIGHT = 240;
export const EARTH_X = GAME_WIDTH / 2;
export const EARTH_Y = GAME_HEIGHT / 2;


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
        this.addEntity(new GameManager("Game Manager"));

        this.addSystem(new PhysicsEngine());
        this.addSystem(new GameManagerSystem());
    }
}

export class LD50 extends Game
{
    constructor()
    {
        super({width: CANVAS_WIDTH, height: GAME_HEIGHT, resolution: 3, backgroundColor: 0x0d2b45});

        // TODO enable this before deploy
        // Log.logLevel = LogLevel.ERROR;
        Log.logLevel = LogLevel.INFO;

        this.setScene(new MainScene(this));

        this.currentScene.addSystem(new TypingSystem());

        this.currentScene.addEntity(new TypePane(0, this.currentScene.camera.height - 100, Layers.GUI));

    }
}

