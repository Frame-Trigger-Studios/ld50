import {
    BodyType,
    CircleCollider,
    CollisionSystem,
    Entity, MathUtil,
    RenderCircle,
    Rigidbody,
    Sprite
} from "lagom-engine";
import {Silo} from "./SiloAimer";
import {Layers} from "../LD50";
import {Score} from "../Global/Score";
import {Asteroid} from "./Asteroid";

export class Earth extends Entity
{
    private radius = 20;

    onAdded()
    {
        super.onAdded();

        this.addComponent(new RenderCircle(0, 0, this.radius, 0x0000AA, 0x0000FF));
        this.addComponent(new Sprite(this.getScene().game.getResource("earth").texture(0, 0), {
            xAnchor: 0.5,
            yAnchor: 0.5
        }));
        this.addChild(new Silo(0, 0));

        this.addComponent(new Rigidbody(BodyType.Discrete));

        const coll = this.addComponent(
            new CircleCollider(this.getScene().getGlobalSystem(CollisionSystem) as CollisionSystem, {
                layer: Layers.Earth,
                radius: this.radius,
                xOff: 0,
                yOff: 0
            }));

        coll.onTriggerEnter.register((caller, {other, result}) => {
            if (other.layer == Layers.Asteroid)
            {
                // TODO variable based on size or speed??
                let amountToLose = 500_000_000 * (other.getEntity() as Asteroid).radius;
                amountToLose += MathUtil.randomRange(-50_000_000, 50_000_000);
                amountToLose -= 500_000_000;
                this.getScene().getEntityWithName("Score")?.getComponent<Score>(Score)?.ejectHumans(amountToLose);
                other.getEntity().destroy();
            }
        });
    }
}
