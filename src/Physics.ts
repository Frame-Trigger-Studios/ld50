import {Component, Entity, RenderCircle, System} from "lagom-engine";

export class PhysicsMe extends Component
{
}

export class PhysicsEngine extends System<[PhysicsMe]>
{
    types = () => [PhysicsMe];

    update(delta: number): void
    {
        this.runOnEntitiesWithSystem((system, entity, physicsProps) => {
            //
        });
    }
}

export class Earth extends Entity
{
    onAdded()
    {
        super.onAdded();

        this.addComponent(new RenderCircle(0, 0, 20, 0x0000AA, 0x0000FF));
    }
}

export class Asteroid extends Entity
{

    constructor(x: number, y: number)
    {
        super("asteroid", x, y);
    }

    onAdded()
    {
        super.onAdded();

        this.addComponent(new RenderCircle(0, 0, 10, 0x140000));
        this.addComponent(new PhysicsMe());
    }
}