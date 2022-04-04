import {Component, Entity, System} from "lagom-engine";
import {SiloAmmo} from "./SiloAimer";
import {LD50, RocketType} from "../LD50";
import {SoundManager} from "../Global/SoundManager";


export class CompletedRocket extends Component
{
    constructor(public rocketType: RocketType) {
        super();
    }
}

export class RocketLoaderSystem extends System<[CompletedRocket]>
{
    types = () => [CompletedRocket];

    update(delta: number): void
    {
        this.runOnEntities((entity: Entity, completedRocket: CompletedRocket) => {
            const silo = this.getScene().getEntityWithName("Silo");
            const siloAmmo = silo?.getComponent<SiloAmmo>(SiloAmmo);
            if (siloAmmo && !siloAmmo.hasRocket)
            {
                siloAmmo.setRocket(completedRocket.rocketType);
                (this.getScene().getEntityWithName("audio") as SoundManager)
                    .playSound("rocketBuilt");
            }
        });
    }
}

