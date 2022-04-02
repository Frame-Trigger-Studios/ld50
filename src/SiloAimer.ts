import {

    Component,
    Entity,
    Game,
    MathUtil,
    RenderCircle,
    System,
} from "lagom-engine";
import {EARTH_X, EARTH_Y} from "./LD50";

export class SiloThing extends Component{}
export class Silo extends Entity {
    constructor(x: number, y: number)
    {
        super("Silo", x, y);
    }

    onAdded()
    {
        super.onAdded();
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

            const direction = MathUtil.pointDirection(EARTH_X,
                                                      EARTH_Y,
                                                      mousePos.x,
                                                      mousePos.y);
            const newPos = MathUtil.lengthDirXY(20, -direction);
            entity.transform.setTransform(newPos.x, newPos.y);
        });
    }
}
