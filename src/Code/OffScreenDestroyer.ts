import {Component, System} from "lagom-engine";
import {GAME_HEIGHT, GAME_WIDTH} from "../LD50";

export class OffScreenDestroyable extends Component {
}

export class OffScreenDestroyer extends System<[OffScreenDestroyable]> {
    types = () => [OffScreenDestroyable]

    update(delta: number): void {
        this.runOnEntities(((entity) => {
            if (entity.transform.x > GAME_WIDTH + 100
                || entity.transform.x < -100
                || entity.transform.y > GAME_HEIGHT + 100
                || entity.transform.y < -100) {

                entity.destroy()
            }
        }))
    }
}