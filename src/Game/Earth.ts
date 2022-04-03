import {
    BodyType,
    CircleCollider,
    CollisionSystem,
    Entity,
    RenderCircle,
    Rigidbody,
    Sprite
} from "lagom-engine";
import {Silo} from "./SiloAimer";
import {Layers} from "../LD50";

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
                // TODO lose health / lose the game
                other.getEntity().destroy();
            }
        });
    }
}
