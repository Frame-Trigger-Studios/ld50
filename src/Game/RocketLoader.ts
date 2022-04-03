import {Component, Entity, System} from "lagom-engine";
import {SiloAmmo} from "./SiloAimer";
import {RocketType} from "../LD50";


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
            }
        });
    }
}

