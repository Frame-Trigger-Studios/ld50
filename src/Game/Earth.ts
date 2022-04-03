import {
    BodyType,
    CircleCollider,
    CollisionSystem,
    Entity,
    MathUtil,
    RenderCircle,
    Rigidbody,
    Sprite
} from "lagom-engine";
import {Silo} from "./SiloAimer";
import {Layers} from "../LD50";
import {Score} from "../Global/Score";
import {Asteroid} from "./Asteroid";
import {Explosion} from "./Rocket";

export class Earth extends Entity
{
    private radius = 20;

    onAdded()
    {
        super.onAdded();

        this.addComponent(new RenderCircle(0, 0, this.radius, 0x0000AA, 0x0000FF));
        this.addComponent(new Sprite(this.getScene().game.getResource("background").texture(0, 0),
            {xOffset: -this.transform.x, yOffset: -this.transform.y}));
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
                // Add an explosion
                this.getScene().addEntity(new Explosion(other.getEntity(), "smallexplosion"));

                let amountToLose = 500_000_000 * ((other.getEntity() as Asteroid).radius - 1);
                amountToLose += MathUtil.randomRange(-250_000_000, 250_000_000);
                this.getScene().getEntityWithName("Score")?.getComponent<Score>(Score)?.ejectHumans(amountToLose);
                other.getEntity().destroy();
            }
        });
    }
}
