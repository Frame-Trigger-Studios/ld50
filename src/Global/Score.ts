import {Component, Entity, MathUtil, System, TextDisp} from "lagom-engine";
import {GAME_HEIGHT, GAME_WIDTH} from "../LD50";
import {PassengerShip} from "../Game/Rocket";
import {EndScreen} from "./SplashScreens";
import {GameData, GameManager} from "./GameManager";
import {SoundManager} from "./SoundManager";


export class Score extends Component {
    remaining = 7_900_000_000;
    remainingToAdd = 0;

    saved = 0;
    savedToAdd = 0;

    public saveHumans(count: number) {
        this.savedToAdd += count;
    }

    public ejectHumans(count: number) {
        this.remainingToAdd += count;
    }

    public getScoreText(): string {
        return `Remaining:\n${this.remaining.toLocaleString()}\n\nSaved:\n${this.saved.toLocaleString()}`;
    }
}

export class ScoreDisplay extends Entity {

    onAdded() {
        super.onAdded();
        const score = this.addComponent(new Score());
        this.addComponent(new TextDisp(10, 8, score.getScoreText(), {
            fontSize: 10,
            fontFamily: "myPixelFont",
            fill: 0x6ceded,
        }));
    }
}

export class ScoreUpdater extends System<[Score, TextDisp]> {
        types = () => [Score, TextDisp];

        update(delta: number) {
            this.runOnEntities((entity, score, text1) => {

                let changed = false;

                // Lerp score so the value ticks up over a second rather than all at once.
                if (score.remainingToAdd != 0) {
                    const factor = score.remainingToAdd > 500 ? 2_384_231 : 1;
                    const amount = Math.min(Math.floor(factor * delta), score.remainingToAdd);
                    score.remainingToAdd -= amount;
                    score.remaining -= amount;
                    changed = true;
                }
                if (score.savedToAdd != 0) {
                    const amount = Math.min(Math.floor(delta), score.savedToAdd);
                    score.saved += amount;
                    score.savedToAdd -= amount;
                    changed = true;
                }

                if (changed) {
                    text1.pixiObj.text = score.getScoreText();
                }

                if (score.remaining <= 0) {
                    const elapsed = this.scene.getEntityWithName<GameManager>("Game Manager")?.getComponent<GameData>(GameData)?.elapsedTime || 0;
                    const game = this.getScene().getGame();
                    this.getScene().entities.forEach(x => x.destroy());
                    this.getScene().systems.forEach(x => x.destroy());
                    this.getScene().globalSystems.forEach(x => x.destroy());
                    game.setScene(new EndScreen(game, score.saved, elapsed));
                }
            });
        }
}

export class OffScreenPassenger extends System<[PassengerShip]> {
    types = () => [PassengerShip];

    update(delta: number): void {
        this.runOnEntities(((entity, ship) => {
            if (entity.transform.x > GAME_WIDTH + 5
                || entity.transform.x < -5
                || entity.transform.y > GAME_HEIGHT + 5
                || entity.transform.y < -5) {

                this.getScene().getEntityWithName("Score")?.getComponent<Score>(Score)?.saveHumans(ship.capacity);
                (this.getScene().getEntityWithName("audio") as SoundManager)
                    .playSound("peopleEscape");

                entity.destroy();
            }
        }));
    }
}
