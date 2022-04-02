import {
    BodyType,
    CircleCollider,
    CollisionSystem,
    Component,
    Entity,
    MathUtil,
    RenderCircle,
    Rigidbody,
    SimplePhysicsBody,
    System,
    Vector
} from "lagom-engine";
import {EARTH_X, EARTH_Y, Layers} from "./LD50";

export class Force extends Component
{
    constructor(readonly velocity: Vector)
    {
        super();
    }
}

export class PhysicsMe extends Component
{
}

export class ApplyForce extends System<[Force, SimplePhysicsBody]>
{
    types = () => [Force, SimplePhysicsBody];

    update(delta: number): void
    {
        this.runOnEntities((entity, force, body) => {
            body.move(force.velocity.x, force.velocity.y);
            force.destroy();
        });
    }
}

export class PhysicsEngine extends System<[PhysicsMe, SimplePhysicsBody]>
{
    types = () => [PhysicsMe, SimplePhysicsBody];

    update(delta: number): void
    {
        this.runOnEntities((entity, physicsProps, body) => {
            // ph.move(100, 0);

            // Apply earth pull
            const dist = MathUtil.pointDistance(entity.transform.x, entity.transform.y, EARTH_X, EARTH_Y);
            const dir = MathUtil.pointDirection(entity.transform.x, entity.transform.y, EARTH_X, EARTH_Y);


            const pullForce = MathUtil.lengthDirXY(1 / dist / 300, -dir);
            const speed = 0.1;

            const movement = pullForce.multiply(delta * speed);
            body.move(movement.x, movement.y);
            // body.move(pullForce.x * delta * speed, pullForce.y * delta * speed);
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
    constructor(x: number, y: number, readonly initialMovement: Vector)
    {
        super("asteroid", x, y);
    }

    onAdded()
    {
        super.onAdded();

        this.addComponent(new RenderCircle(0, 0, 10, 0x140000));
        this.addComponent(new PhysicsMe());
        this.addComponent(new Force(this.initialMovement));
        this.addComponent(new SimplePhysicsBody({angDrag: 0, linDrag: 0}));
        this.addComponent(new Rigidbody(BodyType.Discrete));
        const coll = this.addComponent(new CircleCollider(this.getScene().getGlobalSystem(CollisionSystem) as CollisionSystem, {
            layer: Layers.Asteroid,
            radius: 10,
            xOff: 0,
            yOff: 0
        }));

        coll.onTriggerEnter.register((caller, {other, result}) => {
            if (caller.layer == Layers.Asteroid)
            {
                const myProps = caller.getEntity().getComponent<SimplePhysicsBody>(SimplePhysicsBody);
                const otherProps = other.getEntity().getComponent<SimplePhysicsBody>(SimplePhysicsBody);

                if (myProps == null || otherProps == null) {
                    return;
                }

                myProps.getEntity().addComponent(new Force(new Vector(otherProps.xVel, otherProps.yVel)));
                otherProps.getEntity().addComponent(new Force(new Vector(myProps.xVel, myProps.yVel)));
            }
        });
    }
}