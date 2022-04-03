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
        const direction = MathUtil.pointDirection(EARTH_X, EARTH_Y, mousePos.x, mousePos.y);
        const velocity = MathUtil.lengthDirXY(speedMulti, -direction);

        this.transform.rotation = -direction + MathUtil.degToRad(90);

        this.addComponent(new Rigidbody(BodyType.Discrete));
        this.addComponent(new Force(velocity));
        this.addComponent(new SimplePhysicsBody({angDrag: 0, linDrag: 0}));
        const texture = this.getScene().game.getResource("rockets").texture(this.rocketType, 0);
        this.addComponent(
            new Sprite(texture, {
                xAnchor: 0.5,
                yAnchor: 0.75
            }));

        const coll = this.addComponent(
            new CircleCollider(this.getScene().getGlobalSystem(CollisionSystem) as CollisionSystem, {
                layer: Layers.Ship,
                radius: colliderSize,
                xOff: 0,
                yOff: -8
            }));

        if (this.rocketType == RocketType.ICBM)
        {
            this.addComponent(new AnimatedSpriteController(0, [{
                id: 0,
                textures: this.getScene().game.getResource("fire").textureSliceFromSheet(),
                config: {animationSpeed: 100, xAnchor: 0.5, yAnchor: 0, yOffset: 0, xOffset: -4}
            }]));
            this.addComponent(new AnimatedSpriteController(0, [{
                id: 0,
                textures: this.getScene().game.getResource("fire").textureSliceFromSheet(),
                config: {animationSpeed: 100, xAnchor: 0.5, yAnchor: 0, yOffset: 0, xOffset: 4}
            }]));
        }
        else
        {
            this.addComponent(new AnimatedSpriteController(0, [{
                id: 0,
                textures: this.getScene().game.getResource("fire").textureSliceFromSheet(),
                config: {animationSpeed: 100, xAnchor: 0.5, yAnchor: 0, yOffset: 0}
            }]));
        }

        // this.addComponent(new RenderCircle(0, -8, colliderSize, 0x0000AA, 0xAA00FF));

        coll.onTriggerEnter.register((caller, {other, result}) => {
            if (other.layer === Layers.Asteroid)
            {
                this.explode();
            }
        });
    }

    explode()
    {
        let texture = "smallexplosion";
        switch (this.rocketType)
        {
            case RocketType.STARSHIP:
                texture = "bigexplosion3";
                break;
            case RocketType.PASSENGER:
                texture = "smallexplosion2";
                break;
            case RocketType.ICBM:
                texture = "bigexplosion2";
                break;
            case RocketType.MISSILE:
                texture = "smallexplosion";
                break;
        }

        this.getScene().addEntity(new Explosion(this, texture));

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
                switch (this.rocketType)
                {
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

/**
 * Self destructing explosion.
 */
export class Explosion extends Entity
{
    constructor(refEntity: Entity, readonly texName: string)
    {
        const here = refEntity.transform.getGlobalPosition();
        super("explosionSpr", here.x, here.y, Layers.Explosion);
    }

    onAdded()
    {
        super.onAdded();
        this.addComponent(new AnimatedSpriteController(0, [
            {
                id: 0,
                textures: this.getScene().game.getResource(this.texName).textureSliceFromSheet(),
                config: {
                    xAnchor: 0.5, yAnchor: 0.5,
                    rotation: MathUtil.degToRad(Util.choose(0, 90, 180, 270)),
                    animationEndEvent: () => this.destroy(), animationSpeed: 60
                }
            }]));
        // if (this.texName.startsWith("big")) {
        //     this.addComponent(new ScreenShake(1, 900));
        // } else {
        //     this.addComponent(new ScreenShake(0.5, 200));
        // }
    }
}
