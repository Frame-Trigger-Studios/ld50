import {Component, Entity, TextDisp} from "lagom-engine";

class Score extends Component {
    remaining = 7_900_000_000;
    saved = 0;
}

export class ScoreDisplay extends Entity {
    onAdded() {
        super.onAdded();
        const score = this.addComponent(new Score());
        this.addComponent(new TextDisp(0, 0, `Remaining: ${score.remaining.toLocaleString()}`, {
            fontSize: 12, fill: "white"
        }));
        this.addComponent(new TextDisp(0, 15, `Saved: ${score.saved.toLocaleString()}`, {
            fontSize: 12, fill: "white"
        }));
    }
}