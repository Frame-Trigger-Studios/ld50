import {Collider, CollisionSystem, LagomType, Component, MathUtil, Rigidbody, SimplePhysicsBody, System, Vector} from "lagom-engine";
import {EARTH_GRAVITY_MULTIPLIER, EARTH_X, EARTH_Y} from "../LD50";

export class Force extends Component
{
    constructor(readonly velocity: Vector)
    {
        super();
    }
}

export class DiscreteRbodyCollisionSystem extends CollisionSystem
{
    types = (): LagomType<Component>[] => [Rigidbody, Collider];

    update(_: number): void
    {
        // This system operates in the fixed update.
    }

    fixedUpdate(delta: number): void
    {
        super.fixedUpdate(delta);

        this.runOnComponentsWithSystem((system: DiscreteRbodyCollisionSystem, bodies: Rigidbody[], colliders: Collider[]) => {

            // Update actual positions using the rigidbody positions and clear pending movement.
            for (const body of bodies) {
                body.parent.transform.x += body.pendingX;
                body.parent.transform.y += body.pendingY;
                body.parent.transform.rotation += body.pendingRotation;
                body.pendingX = 0;
                body.pendingY = 0;
                body.pendingRotation = 0;
            }

            // Move them all to their new positions. This uses the current transform position.
            for (const collider of colliders)
            {
                collider.updatePosition();
            }

            // Do a detect update.
            system.detectSystem.update();

            // Do collision checks.
            this.doCollisionCheck(colliders);
        });
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
            const speed = 0.05 * EARTH_GRAVITY_MULTIPLIER;

            const movement = pullForce.multiply(delta * speed);
            body.move(movement.x, movement.y);
            // body.move(pullForce.x * delta * speed, pullForce.y * delta * speed);
        });
    }
}
