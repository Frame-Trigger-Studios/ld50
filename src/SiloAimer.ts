import {

    Component,
    Entity,
    Game,
    MathUtil,
    RenderCircle,
    System,
} from "lagom-engine";

export class SiloThing extends Component{}
export class Silo extends Entity {
    constructor(x: number, y: number)
    {
        super("Silo", x, y);
        this.addComponent(new RenderCircle(0, 0, 5, 0x0000AA, 0x0000FF));
        this.addComponent(new SiloThing());
    }
}

export class SiloAimer extends System<[SiloThing]>
{
    types = () => [SiloThing];

    update(delta: number)
    {
        this.runOnEntities((entity: Entity, silo: SiloThing) => {
            const mousePos = this.scene.camera.viewToWorld(Game.mouse.getPosX(), Game.mouse.getPosY());

            const direction = MathUtil.pointDirection(entity.parent?.transform.x ?? 0,
                                                      entity.parent?.transform.y ?? 0,
                                                      mousePos.x,
                                                      mousePos.y);
            const newPos = MathUtil.lengthDirXY(20, -direction);
            entity.transform.setTransform(newPos.x, newPos.y);
        });
    }
}
