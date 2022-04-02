import {Component, Entity, TextDisp} from "lagom-engine";


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
