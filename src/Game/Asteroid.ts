import {
    BodyType,
    CircleCollider, CollisionSystem,
    Entity,
    MathUtil,
    Rigidbody,
    SimplePhysicsBody,
    Sprite,
    Util,
    Vector
} from "lagom-engine";
import {OffScreenDestroyable} from "../Systems/OffScreenDestroyer";
import {Layers} from "../LD50";
import {Force, PhysicsMe} from "../Systems/Physics";

export class Asteroid extends Entity
{
    constructor(x: number, y: number, readonly radius: number, readonly initialMovement: Vector,
                readonly linDrag: number)
    {
        super("asteroid", x, y);
    }

    onAdded()
    {
        super.onAdded();

        this.addComponent(new OffScreenDestroyable());
        // this.addComponent(new RenderCircle(0, 0, this.radius, 0x140000));
        const texture = this.getScene().game.getResource("asteroids").texture(this.radius - 2, Util.choose(0, 1));
        this.addComponent(new Sprite(texture, {xAnchor: 0.5, yAnchor: 0.5, rotation: MathUtil.randomRange(0, 360)}));
        this.addComponent(new PhysicsMe());
        this.addComponent(new Force(this.initialMovement));
        this.addComponent(new SimplePhysicsBody({
            angDrag: 0.0001,
            linDrag: this.linDrag,
            angCap: 0.1
        })).angVel = (Math.random() * 0.04 * Util.choose(1, -1));
        this.addComponent(new Rigidbody(BodyType.Discrete));
        const coll = this.addComponent(
            new CircleCollider(this.getScene().getGlobalSystem(CollisionSystem) as CollisionSystem, {
                layer: Layers.Asteroid,
                radius: this.radius,
                xOff: 0,
                yOff: 0
            }));

        const pushUs = (me: Entity, them: Entity) => {
            const myProps = me.getComponent<SimplePhysicsBody>(SimplePhysicsBody);
            const otherProps = them.getComponent<SimplePhysicsBody>(SimplePhysicsBody);

            if (myProps == null || otherProps == null)
            {
                return;
            }

            // Vector perpendicular to (x, y) is (-y, x)
            const tangentVector = new Vector(them.transform.y - me.transform.y,
                -(them.transform.x - me.transform.x));
            tangentVector.normalize();

            const relativeVelocity = new Vector(otherProps.xVel - myProps.xVel, otherProps.yVel - myProps.yVel);
            const length = dotProduct(relativeVelocity, tangentVector);
            const tangentVelocity = new Vector(tangentVector.x, tangentVector.y).multiply(length);
            const velocityComponentPerpendicularToTangent = relativeVelocity.sub(tangentVelocity);

            // This code makes both circles move.
            myProps.xVel += velocityComponentPerpendicularToTangent.x;
            myProps.yVel += velocityComponentPerpendicularToTangent.y;
            myProps.angVel += Math.random() * 0.2 * Util.choose(1, -1);

            otherProps.xVel -= velocityComponentPerpendicularToTangent.x;
            otherProps.yVel -= velocityComponentPerpendicularToTangent.y;
            otherProps.angVel += Math.random() * 0.2 * Util.choose(1, -1);
        };

        coll.onTriggerEnter.register((caller, {other, result}) => {
            if (other.layer === Layers.Asteroid)
            {
                pushUs(caller.getEntity(), other.getEntity());
            }
            caller.getEntity().transform.x -= result.overlap * result.overlap_x;
            caller.getEntity().transform.y -= result.overlap * result.overlap_y;
        });
    }

    pushFromCenter = (forceSource: Entity) => {
        const myProps = this.getComponent<SimplePhysicsBody>(SimplePhysicsBody);
        if (myProps == null)
        {
            return;
        }

        const direction = MathUtil.pointDirection(-this.transform.getGlobalPosition().x,
            this.transform.getGlobalPosition().y,
            -forceSource.transform.getGlobalPosition().x,
            forceSource.transform.getGlobalPosition().y);
        const velocity = MathUtil.lengthDirXY(0.1, direction);
        this.addComponent(new Force(velocity));
    };
}


// TODO move to core
function dotProduct(vector1: Vector, vector2: Vector): number
{
    return vector1.x * vector2.x + vector1.y * vector2.y;
}
