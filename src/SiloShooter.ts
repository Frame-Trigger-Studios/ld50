import {SiloThing} from "./SiloAimer";
import {Button, Entity, Game, System} from "lagom-engine";
import {Rocket} from "./Rocket";

export class SiloShooter extends System<[SiloThing]>
{
    types = () => [SiloThing];

    update(delta: number): void
    {
        this.runOnEntities((entity: Entity, silo: SiloThing) => {

            if (Game.mouse.isButtonReleased(Button.LEFT)) {
                this.getScene().addEntity(new Rocket(entity.transform.getGlobalPosition().x,
                                                     entity.transform.getGlobalPosition().y,
                                                     5));
            }
        });
    }
}
