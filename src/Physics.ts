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
    System, Timer,
    Vector
} from "lagom-engine";
import {Silo} from "./SiloAimer";
import {EARTH_X, EARTH_Y, Layers} from "./LD50";
import {OffScreenDestroyable} from "./Code/OffScreenDestroyer";
import {DestroyMeNextFrame} from "./DestroyMeNextFrame";

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
            const speed = 0.005;

            const movement = pullForce.multiply(delta * speed);
            body.move(movement.x, movement.y);
            // body.move(pullForce.x * delta * speed, pullForce.y * delta * speed);
        });
    }
}

export class Earth extends Entity
{
    private radius = 20;

    onAdded()
    {
        super.onAdded();

        this.addComponent(new RenderCircle(0, 0, this.radius, 0x0000AA, 0x0000FF));
        this.addChild(new Silo(0, 0));

        this.addComponent(new Rigidbody(BodyType.Discrete));

        const coll = this.addComponent(new CircleCollider(this.getScene().getGlobalSystem(CollisionSystem) as CollisionSystem, {
            layer: Layers.Earth,
            radius: this.radius,
            xOff: 0,
            yOff: 0
        }));

        coll.onTriggerEnter.register((caller, {other, result}) => {
            if (other.layer == Layers.Asteroid) {
                // TODO lose health / lose the game
                other.getEntity().destroy();
            }
        });
    }

}

export class Asteroid extends Entity
{
    constructor(x: number, y: number, readonly radius: number, readonly initialMovement: Vector, readonly linDrag: number)
    {
        super("asteroid", x, y);
    }

    onAdded()
    {
        super.onAdded();

        this.addComponent(new OffScreenDestroyable());
        this.addComponent(new RenderCircle(0, 0, this.radius, 0x140000));
        this.addComponent(new PhysicsMe());
        this.addComponent(new Force(this.initialMovement));
        this.addComponent(new SimplePhysicsBody({angDrag: 0, linDrag: this.linDrag}));
        this.addComponent(new Rigidbody(BodyType.Discrete));
        const coll = this.addComponent(new CircleCollider(this.getScene().getGlobalSystem(CollisionSystem) as CollisionSystem, {
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
            otherProps.xVel -= velocityComponentPerpendicularToTangent.x;
            otherProps.yVel -= velocityComponentPerpendicularToTangent.y;
        };

        const pushFromCenter = (asteroid: Entity, forceSource: Entity) => {
            const myProps = asteroid.getComponent<SimplePhysicsBody>(SimplePhysicsBody);

            if (myProps == null) {
                return;
            }

            const direction = MathUtil.pointDirection(-asteroid.transform.getGlobalPosition().x,
                                                      asteroid.transform.getGlobalPosition().y,
                                                      -forceSource.transform.getGlobalPosition().x,
                                                      forceSource.transform.getGlobalPosition().y);
            const velocity = MathUtil.lengthDirXY(0.01, direction);
            asteroid.addComponent(new Force(velocity));
        };

        coll.onTriggerEnter.register((caller, {other, result}) => {
            if (other.layer === Layers.Asteroid)
            {
                pushUs(caller.getEntity(), other.getEntity());
            }

            if (other.layer === Layers.Ship) {
                const explosion = other.getEntity().addComponent(new CircleCollider(this.getScene().getGlobalSystem(CollisionSystem) as CollisionSystem, {
                    layer: Layers.Explosion,
                    radius: 20,
                    xOff: 0,
                    yOff: 0
                }));

                explosion.onTriggerEnter.register((caller, {other, result}) => {
                    if (other.layer === Layers.Asteroid) {
                        pushFromCenter(other.getEntity(), caller.getEntity());
                    }
                });

                other.getEntity().addComponent(new DestroyMeNextFrame());
            }
        });
    }
}

// TODO move to core
function dotProduct(vector1: Vector, vector2: Vector): number
{
    return vector1.x * vector2.x + vector1.y * vector2.y;
}
