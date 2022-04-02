import {

    Component,
    Entity,
    Game,
    MathUtil,
    RenderCircle, Sprite,
    System,
} from "lagom-engine";
import {EARTH_X, EARTH_Y} from "./LD50";

export class SiloThing extends Component{}

export class SiloAmmo extends Component {

    constructor(public hasRocket: boolean) {
        super();
    }
}

export class Silo extends Entity {
    constructor(x: number, y: number)
    {
        super("Silo", x, y);
    }

    onAdded()
    {
        super.onAdded();
        // this.addComponent(new RenderCircle(0, 0, 5, 0x0000AA, 0x0000FF));
        this.addComponent(new Sprite(this.getScene().game.getResource("launchpad").texture(0, 0), {yAnchor:0, xAnchor:0.5}));
        this.addComponent(new SiloThing());
        this.addComponent(new SiloAmmo(false));
    }
}

export class SiloAimer extends System<[SiloThing, Sprite]>
{
    types = () => [SiloThing, Sprite];

    update(delta: number)
    {
        this.runOnEntities((entity: Entity, silo: SiloThing, sprite: Sprite) => {
            const mousePos = this.scene.camera.viewToWorld(Game.mouse.getPosX(), Game.mouse.getPosY());

            const direction = MathUtil.pointDirection(EARTH_X,
                                                      EARTH_Y,
                                                      mousePos.x,
                                                      mousePos.y);
            const newPos = MathUtil.lengthDirXY(20, -direction);
            sprite.applyConfig({rotation: -direction + MathUtil.degToRad(90)});
            entity.transform.setTransform(newPos.x, newPos.y);
        });
    }
}
