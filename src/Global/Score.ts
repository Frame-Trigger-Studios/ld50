import {Component, Entity, System, TextDisp} from "lagom-engine";
import {GAME_HEIGHT, GAME_WIDTH} from "../LD50";
import {PassengerShip} from "../Game/Rocket";


class Score extends Component {
    remaining = 7_900_000_000;
    saved = 0;
}

export class ScoreDisplay extends Entity {

    onAdded() {
        super.onAdded();
        this.addComponent(new Score());
        const font = this.addComponent(new TextDisp(10, 8, "", {
            fontSize: 10,
            fontFamily: "myPixelFont",
            fill: 0xffffff,
        }));
        font.pixiObj.resolution = 100;
    }
}

export class ScoreUpdater extends System<[Score, TextDisp, TextDisp]> {
    types = () => [Score, TextDisp];

    update(delta: number) {
        this.runOnEntities((entity, score, text1, text2) => {
            text1.pixiObj.text = `Remaining:\n${score.remaining.toLocaleString()}\n\nJettisoned:\n${score.saved.toLocaleString()}`;
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

                const score = this.getScene().getEntityWithName("Score Display")?.getComponent<Score>(Score);
                if (score) {
                    score.saved += ship.capacity;
                    score.remaining -= ship.capacity;
                }

                entity.destroy();
            }
        }));
    }
}
