import {
    BodyType,
    CircleCollider,
    CollisionSystem,
    Entity,
    Game,
    MathUtil,
    RenderCircle,
    Rigidbody,
    SimplePhysicsBody,
    Timer
} from "lagom-engine";
import {Force} from "./Physics";
import {EARTH_X, EARTH_Y, Layers} from "./LD50";
import {OffScreenDestroyable} from "./Code/OffScreenDestroyer";

export class Rocket extends Entity {

    constructor(x: number, y: number, readonly speed: number)
    {
        super("rocket", x, y);
    }

    onAdded()
    {
        super.onAdded();

        const mousePos = this.scene.camera.viewToWorld(Game.mouse.getPosX(), Game.mouse.getPosY());
        const direction = MathUtil.pointDirection(EARTH_X, EARTH_Y,
                                                  mousePos.x, mousePos.y);
        const velocity = MathUtil.lengthDirXY(5, -direction);

        this.addComponent(new OffScreenDestroyable());
        this.addComponent(new RenderCircle(0, 0, 5, 0x0000AA, 0xAA00FF));
        this.addComponent(new Rigidbody(BodyType.Discrete));
        this.addComponent(new Force(velocity));
        this.addComponent(new SimplePhysicsBody({angDrag: 0, linDrag: 0}));

        const coll = this.addComponent(new CircleCollider(this.getScene().getGlobalSystem(CollisionSystem) as CollisionSystem, {
            layer: Layers.Rocket,
            radius: 5,
            xOff: 0,
            yOff: 0
        }));

        coll.onTriggerEnter.register((caller, {other, result}) => {
            if (caller.layer == Layers.Asteroid)
            {
                // TODO EXPLODE!
                console.log("EXPLODE!");
            }
        });
    }
}
