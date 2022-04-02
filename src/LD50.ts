import {
    CollisionMatrix,
    ContinuousCollisionSystem,
    Game,
    Log,
    LogLevel,
    Scene,
    SimplePhysics,
    Vector
} from "lagom-engine";
import {ApplyForce, Asteroid, Earth, PhysicsEngine} from "./Physics";
import {TypePane, TypingSystem} from "./typing/Selection";
import {GameManager} from "./Code/GameManager";

export enum Layers
{
    Asteroid,
    Earth,
    Ship,
    Explosion,
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
matrix.addCollision(Layers.Explosion, Layers.Ship);
matrix.addCollision(Layers.Explosion, Layers.Asteroid);


class MainScene extends Scene
{
    onAdded()
    {
        super.onAdded();

        this.addSystem(new PhysicsEngine());
        this.addSystem(new SimplePhysics());
        // this.addSystem(new GameManagerSystem());
        this.addSystem(new ApplyForce());
        this.addGlobalSystem(new ContinuousCollisionSystem(matrix));

        // this.addEntity(new TypePane(0, this.camera.height - 100, 1));
        this.addSystem(new TypingSystem());

        this.addEntity(new Earth("earth", 213, 120));
        this.addEntity(new Asteroid(10, 19, new Vector(0.01, 0)));
        this.addEntity(new GameManager("Game Manager"));

        this.addEntity(new TypePane(0, this.camera.height - 100, Layers.GUI));

    }
}

export class LD50 extends Game
{
    constructor()
    {
        super({width: CANVAS_WIDTH, height: GAME_HEIGHT, resolution: 3, backgroundColor: 0x0d2b45});

        // TODO enable this before deploy
        // Log.logLevel = LogLevel.ERROR;
        Log.logLevel = LogLevel.ALL;

        this.setScene(new MainScene(this));

    }
}

