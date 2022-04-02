import {SiloAmmo, SiloThing} from "./SiloAimer";
import {Button, Entity, Game, System} from "lagom-engine";
import {Missile, Rocket} from "./Rocket";
import {CompletedRocket} from "./typing/Selection";
import {RocketType} from "./LD50";

export class SiloShooter extends System<[SiloThing , SiloAmmo]>
{
    types = () => [SiloThing, SiloAmmo];

    update(delta: number): void
    {
        this.runOnEntities((entity: Entity, silo: SiloThing, ammo: SiloAmmo) => {

            if (Game.mouse.isButtonReleased(Button.LEFT) && ammo.hasRocket) {
                const rocket = this.getScene().addEntity(
                    new Rocket(entity.transform.getGlobalPosition().x, entity.transform.getGlobalPosition().y, 5, ammo.rocket));


                const storedRockets = this.getScene().entities.filter(entity => entity.getComponent(CompletedRocket) != null);
                if (storedRockets.length > 0)
                {
                    const completedRocket = storedRockets[0].getComponent(CompletedRocket);
                    if (completedRocket) {
                        storedRockets[0].removeComponent(completedRocket, true);
                    }
                }
                ammo.removeRocket();
            }
        });
    }
}
