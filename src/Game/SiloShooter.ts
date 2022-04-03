import {SiloAmmo, SiloThing} from "./SiloAimer";
import {Button, Entity, Game, Mouse, System, Timer} from "lagom-engine";
import {Rocket} from "./Rocket";
import {CompletedRocket} from "./RocketLoader";
import {TypedLetters, TypingSystem} from "./RocketSelection";
import {RocketType} from "../LD50";

export class SiloShooter extends System<[SiloThing, SiloAmmo]>
{
    types = () => [SiloThing, SiloAmmo];

    update(delta: number): void
    {
        this.runOnEntities((entity: Entity, silo: SiloThing, ammo: SiloAmmo) => {

            if (this.scene.game.mouse.isButtonReleased(Button.LEFT) && ammo.hasRocket) {
                this.getScene().addEntity(
                    new Rocket(entity.transform.getGlobalPosition().x, entity.transform.getGlobalPosition().y, ammo.rocket));


                const storedRockets = this.getScene().entities
                                          .filter(entity => entity.getComponent(CompletedRocket) != null);
                if (storedRockets.length > 0)
                {
                    const rocketBuilder = storedRockets[0];
                    const completedRocket = rocketBuilder.getComponent<CompletedRocket>(CompletedRocket);
                    if (completedRocket)
                    {
                        rocketBuilder.removeComponent(completedRocket, true);

                        let builders = this.getScene().entities.filter(entity => entity.getComponent(TypedLetters))
                                           .filter(entity => !entity.getComponent(Timer));

                        let cooldown = 0;
                        switch (completedRocket.rocketType) {
                            case RocketType.ICBM:
                                cooldown = 10;
                                break;
                            case RocketType.PASSENGER:
                                cooldown = 5;
                                break;
                            case RocketType.STARSHIP:
                                cooldown = 15;
                                break;
                        }


                        if (cooldown > 0) {
                            builders = builders.filter(entity => entity != rocketBuilder);

                            rocketBuilder.addComponent(new Timer(cooldown * 1000, rocketBuilder, false))
                                .onTrigger.register(((caller, data) => {

                                const buidlingInProgress =
                                    this.getScene().entities.map(entity => entity.getComponent<TypedLetters>(TypedLetters))
                                    .filter(component => component != null)
                                    .some(typedLetters => typedLetters && typedLetters.typed.length > 0);
                                if (!buidlingInProgress) {
                                    TypingSystem.changeTypingPaneAlpha([rocketBuilder], 1);
                                }
                                caller.destroy();
                            }));
                        }

                        TypingSystem.changeTypingPaneAlpha(builders, 1);
                    }
                }
                ammo.removeRocket();
            }
        });
    }
}
