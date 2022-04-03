import {Component, Entity, System} from "lagom-engine";

export class DestroyMeNextFrame extends Component {
    private aFrameHasPassed = false;

    public attemptDestroy = () => {
        if (this.aFrameHasPassed)
        {
            this.getEntity().destroy();
        }
        else {
            this.aFrameHasPassed = true;
        }
    };
}

export class DestroySystem extends System<[DestroyMeNextFrame]>
{
    types = () => [DestroyMeNextFrame];
    update(delta: number): void
    {
        this.runOnEntities((entity: Entity, destroyMe: DestroyMeNextFrame) => {
            destroyMe.attemptDestroy();
        });
    }
}
