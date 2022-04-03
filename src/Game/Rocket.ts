import {
    AnimatedSpriteController,
    BodyType,
    CircleCollider,
    CollisionSystem,
    Component,
    Entity,
    Game,
    MathUtil,
    Rigidbody,
    SimplePhysicsBody,
    Sprite,
    Util
} from "lagom-engine";
import {Force} from "../Systems/Physics";
import {EARTH_X, EARTH_Y, Layers, RocketType} from "../LD50";
import {OffScreenDestroyable} from "../Systems/OffScreenDestroyer";
import {DestroyMeNextFrame} from "../Systems/DestroyMeNextFrame";
import {Asteroid} from "./Asteroid";
import {Score} from "../Global/Score";

const SMALL_MISSILE_RADIUS = 20;
const BIG_MISSILE_RADIUS = 50;
const SMALL_PASSENGER_COUNT = 100;
const BIG_PASSENGER_COUNT = 400;

export class PassengerShip extends Component
{

    constructor(public capacity: number)
    {
        super();
    }
}

export class Missile extends Component
{

    constructor(public explosionRadius: number)
    {
        super();
    }
}

export class Rocket extends Entity
{

    constructor(x: number, y: number, readonly rocketType: RocketType)
    {
        super("rocket", x, y);
    }

    onAdded()
    {
        super.onAdded();

        let speedMulti = 0.1;
        let colliderSize = 5;

        if (this.rocketType == RocketType.MISSILE)
        {
            this.addComponent(new Missile(SMALL_MISSILE_RADIUS));
            this.addComponent(new OffScreenDestroyable());
        }
        else if (this.rocketType == RocketType.ICBM)
        {
            speedMulti = 0.06;
            colliderSize = 8;
            this.addComponent(new Missile(BIG_MISSILE_RADIUS));
            this.addComponent(new OffScreenDestroyable());
        }
        else if (this.rocketType == RocketType.PASSENGER)
        {
            speedMulti = 0.04;
            this.addComponent(new Missile(SMALL_MISSILE_RADIUS));
            this.addComponent(new PassengerShip(SMALL_PASSENGER_COUNT));
            this.getScene().getEntityWithName("Score")?.getComponent<Score>(Score)?.ejectHumans(SMALL_PASSENGER_COUNT);
        }
        else if (this.rocketType == RocketType.STARSHIP)
        {
            speedMulti = 0.02;
            colliderSize = 8;
            this.addComponent(new Missile(BIG_MISSILE_RADIUS));
            this.addComponent(new PassengerShip(BIG_PASSENGER_COUNT));
            this.getScene().getEntityWithName("Score")?.getComponent<Score>(Score)?.ejectHumans(BIG_PASSENGER_COUNT);
        }

        const mousePos = this.scene.camera.viewToWorld(Game.mouse.getPosX(), Game.mouse.getPosY());
        const direction = MathUtil.pointDirection(EARTH_X, EARTH_Y,
            mousePos.x, mousePos.y);
        const velocity = MathUtil.lengthDirXY(speedMulti, -direction);

        // this.addComponent(new RenderCircle(0, 0, 5, 0x0000AA, 0xAA00FF));
        this.addComponent(new Rigidbody(BodyType.Discrete));
        this.addComponent(new Force(velocity));
        this.addComponent(new SimplePhysicsBody({angDrag: 0, linDrag: 0}));
        const texture = this.getScene().game.getResource("rockets").texture(this.rocketType, 0);
        this.addComponent(
            new Sprite(texture, {
                xAnchor: 0.5,
                yAnchor: 0.75,
                rotation: -direction + MathUtil.degToRad(90)
            }));

        const coll = this.addComponent(
            new CircleCollider(this.getScene().getGlobalSystem(CollisionSystem) as CollisionSystem, {
                layer: Layers.Ship,
                radius: colliderSize,
                xOff: 0,
                yOff: 0
            }));

        coll.onTriggerEnter.register((caller, {other, result}) => {
            if (other.layer === Layers.Asteroid)
            {
                this.explode();
            }
        });
    }

    explode()
    {
        const here = this.transform.getGlobalPosition();
        const explosionSpr = this.getScene().addEntity(new Entity("explosionspr", here.x, here.y, Layers.Explosion));
        explosionSpr.addComponent(new AnimatedSpriteController(0, [
            {
                id: 0,
                textures: this.getScene().game.getResource("bigexplosion2").textureSliceFromSheet(),
                config: {
                    xAnchor: 0.5, yAnchor: 0.5,
                    rotation: MathUtil.degToRad(Util.choose(0, 90, 180, 270)),
                    animationEndEvent: () => explosionSpr.destroy(), animationSpeed: 60
                }
            }]));

        const missile = this.getComponent<Missile>(Missile);
        if (!missile)
        {
            return;
        }
        const explosion = this.addComponent(
            new CircleCollider(this.getScene().getGlobalSystem(CollisionSystem) as CollisionSystem, {
                layer: Layers.Explosion,
                radius: missile.explosionRadius,
                xOff: 0,
                yOff: 0
            }));

        explosion.onTriggerEnter.register((caller, {other, result}) => {
            if (other.layer === Layers.Asteroid)
            {
                let force = 1;
                switch (this.rocketType) {
                    case RocketType.ICBM:
                        force = 4;
                        break;
                    case RocketType.PASSENGER:
                        force = 0.5;
                        break;
                }
                (other.getEntity() as Asteroid).pushFromCenter(this, force);
            }
        });

        // Allow a frame to pass so that each asteroid can be collided with.
        this.addComponent(new DestroyMeNextFrame());
    }
}
