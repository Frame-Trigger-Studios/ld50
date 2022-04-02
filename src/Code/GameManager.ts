import {Component, Entity, LagomType, Scene, System} from "lagom-engine";
import {GAME_HEIGHT, GAME_WIDTH} from "../LD50";
import {Asteroid} from "../Physics";

export class GameManager extends Entity {
    onAdded() {
        super.onAdded();

        this.addComponent(new GameData());
    }
}

export class GameData extends Component {
    public elapsedTime = 0;
    public msUntilNextAsteroid = 5000;
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
                gameData.msUntilNextAsteroid = 5000;
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
            x = GAME_WIDTH + 50;
            y = Math.floor(Math.random() * GAME_HEIGHT);
        }

        scene.addEntity(new Asteroid(x, y));
    }
}