import {Component, Entity, MathUtil, System, TextDisp} from "lagom-engine";
import {GAME_HEIGHT, GAME_WIDTH} from "../LD50";
import {PassengerShip} from "../Game/Rocket";
import {EndScreen} from "./SplashScreens";
import {GameData, GameManager} from "./GameManager";


export class Score extends Component {
    remaining = 7_900_000_000;
    remainingToAdd = 0;

    saved = 0;
    savedToAdd = 0;

    public saveHumans(count: number) {
        this.savedToAdd += count;
    }

    public ejectHumans(count: number) {
        this.remainingToAdd -= count;
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
            fill: 0xffffff,
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
                    const newRemaining = Math.floor(MathUtil.lerp(score.remaining, score.remaining + score.remainingToAdd, 0.5/delta));
                    score.remainingToAdd += score.remaining - newRemaining;
                    score.remaining = newRemaining;
                    changed = true;
                }
                if (score.savedToAdd != 0) {
                    const newSaved = Math.ceil(MathUtil.lerp(score.saved, score.saved + score.savedToAdd, 0.5/delta));
                    score.savedToAdd += score.saved - newSaved;
                    score.saved = newSaved;
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

                entity.destroy();
            }
        }));
    }
}
