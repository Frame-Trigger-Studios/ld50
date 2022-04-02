import {CollisionMatrix, ContinuousCollisionSystem, Game, Log, LogLevel, Scene, SimplePhysics} from "lagom-engine";
import {ApplyForce, Asteroid, Earth, PhysicsEngine} from "./Physics";

enum Layers
{
    Asteroid,
    Earth,
    Ship
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

        this.addSystem(new PhysicsEngine());
        this.addSystem(new SimplePhysics());

        this.addEntity(new Earth("earth", 213, 120));
        this.addEntity(new Asteroid(10, 19));

        this.addSystem(new SimplePhysics());
        this.addSystem(new ApplyForce());
        this.addGlobalSystem(new ContinuousCollisionSystem(matrix));
    }
}

export class LD50 extends Game
{
    constructor()
    {
        super({width: 426, height: 240, resolution: 3, backgroundColor: 0x0d2b45});

        // TODO enable this before deploy
        // Log.logLevel = LogLevel.ERROR;
        Log.logLevel = LogLevel.ALL;

        this.setScene(new MainScene(this));
    }
}
