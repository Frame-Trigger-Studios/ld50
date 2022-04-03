import {Component, Entity, System, TextDisp} from "lagom-engine";
import {GAME_HEIGHT, GAME_WIDTH} from "../LD50";
import {OffScreenDestroyable} from "../Systems/OffScreenDestroyer";
import {PassengerShip} from "../Game/Rocket";


class Score extends Component {
    remaining = 7_900_000_000;
    saved = 0;
}

export class ScoreDisplay extends Entity {

    onAdded() {
        super.onAdded();
        const score = this.addComponent(new Score());
        const font1 = this.addComponent(new TextDisp(10, 8, `Remaining:\n${score.remaining.toLocaleString()}`, {
            fontSize: 10,
            fontFamily: "myPixelFont",
            fill: 0xffffff,
        }));
        const font2 = this.addComponent(new TextDisp(10, 38, `Saved:\n${score.saved.toLocaleString()}`, {
            fontSize: 10,
            fontFamily: "myPixelFont",
            fill: 0xffffff
        }));

        font1.pixiObj.resolution = 100;
        font2.pixiObj.resolution = 100;
    }
}

export class OffScreenPassenger extends System<[PassengerShip]> {
    types = () => [PassengerShip];

    update(delta: number): void {
        this.runOnEntities(((entity, ship) => {
            if (entity.transform.x > GAME_WIDTH + 50
                || entity.transform.x < -50
                || entity.transform.y > GAME_HEIGHT + 50
                || entity.transform.y < -50) {
                console.log("a");

                const score = this.getScene().getEntityWithName("Score Display")?.getComponent<Score>(Score);
                if (score) {
                    score.saved += ship.capacity;
                    score.remaining -= ship.capacity;
                    console.log(score.saved);
                }

                entity.destroy();
            }
        }));
    }
}
