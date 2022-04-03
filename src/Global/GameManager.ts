import {Component, Entity, LagomType, Log, MathUtil, Scene, System} from "lagom-engine";
import {
    GAME_HEIGHT,
    GAME_WIDTH,
    EARTH_X,
    EARTH_Y,
    ASTEROID_SPEED_MULTIPLIER,
    SECONDS_TO_MAX_ASTEROID_SPAWN_RATE
} from "../LD50";
import {Asteroid} from "../Game/Asteroid";

export class GameManager extends Entity {
    onAdded() {
        super.onAdded();

        this.addComponent(new GameData());
    }
}

export class GameData extends Component {
    public elapsedTime = 0;
    public msUntilNextAsteroid = 1500;
}

export class GameManagerSystem extends System<[GameData]> {
    types(): LagomType<Component>[] {
        return [GameData];
    }

    onAdded() {
        super.onAdded();
    }

    update(delta: number): void {

        this.runOnEntities((entity, gameData) => {

            gameData.elapsedTime += delta;

            gameData.msUntilNextAsteroid -= delta;
            if (gameData.msUntilNextAsteroid <= 0) {
                this.spawnAsteroid(this.getScene());
                let nextSpawnMs = 200;
                if (gameData.elapsedTime < SECONDS_TO_MAX_ASTEROID_SPAWN_RATE * 1000) {
                    nextSpawnMs = MathUtil.lerp(1500, 200, gameData.elapsedTime / (SECONDS_TO_MAX_ASTEROID_SPAWN_RATE * 1000));
                }
                Log.debug(`Asteroid spawn rate: ${nextSpawnMs}`);
                gameData.msUntilNextAsteroid = nextSpawnMs;
            }
        });
    }

    private buffer = 0;

    private spawnAsteroid(scene: Scene) {
        const side = Math.floor(Math.random() * 4);
        let x: number;
        let y: number;

        if (side == 0) {
            x = Math.floor(Math.random() * GAME_WIDTH);
            y = -this.buffer;
        } else if (side == 1) {
            x = Math.floor(Math.random() * GAME_WIDTH);
            y = GAME_HEIGHT + this.buffer;
        } else if (side == 2) {
            x = -this.buffer;
            y = Math.floor(Math.random() * GAME_HEIGHT);
        } else {
            x = GAME_WIDTH + this.buffer;
            y = Math.floor(Math.random() * GAME_HEIGHT);
        }

        // 1 - 3
        const radius = 2 + Math.floor(Math.random() * 4);
        const linearDrag = Math.random() * 0.00001;
        const speed = randomRange(0.01, 0.05) * ASTEROID_SPEED_MULTIPLIER;
        const variance = randomRange(-Math.PI/4, Math.PI/4);

        const angleToEarth = MathUtil.pointDirection(x, y, EARTH_X, EARTH_Y) + variance;
        const dir = MathUtil.lengthDirXY(speed, -angleToEarth);
        const asteroid = new Asteroid(x, y, radius, dir, linearDrag);

        scene.addEntity(asteroid);
    }
}

const randomRange = (min: number, max: number): number =>
{
    return Math.random() * (max - min) + min;
};
