import {
    AnimatedSpriteController,
    BodyType,
    CircleCollider,
    CollisionSystem,
    Component,
    Entity,
    MathUtil,
    Rigidbody,
    ScreenShake,
    SimplePhysicsBody,
    Sprite,
    System,
    Util
} from "lagom-engine";
import {Force} from "../Systems/Physics";
import {EARTH_X, EARTH_Y, GAME_HEIGHT, GAME_WIDTH, Layers, RocketType} from "../LD50";
import {OffScreenDestroyable} from "../Systems/OffScreenDestroyer";
import {DestroyMeNextFrame} from "../Systems/DestroyMeNextFrame";
import {Asteroid} from "./Asteroid";
import {Score} from "../Global/Score";
import {SoundManager} from "../Global/SoundManager";

const SMALL_MISSILE_RADIUS = 20;
const BIG_MISSILE_RADIUS = 75;
const SMALL_PASSENGER_COUNT = 100;
const BIG_PASSENGER_COUNT = 500;

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
        let colliderSize = 7;

        if (this.rocketType == RocketType.MISSILE)
        {
            this.addComponent(new Missile(SMALL_MISSILE_RADIUS));
            this.addComponent(new OffScreenDestroyable());
        }
        else if (this.rocketType == RocketType.ICBM)
        {
            speedMulti = 0.06;
            colliderSize = 12;
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

        const mousePos = this.scene.camera.viewToWorld(this.scene.game.mouse.getPosX(),
            this.scene.game.mouse.getPosY());
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
        let sound = "bigExplosion";
        switch (this.rocketType)
        {
            case RocketType.STARSHIP:
                texture = "bigexplosion3";
                break;
            case RocketType.PASSENGER:
                texture = "smallexplosion2";
                sound = "smallExplosion";
                break;
            case RocketType.ICBM:
                texture = "bigexplosion2";
                break;
            case RocketType.MISSILE:
                texture = "smallexplosion";
                sound = "smallExplosion";
                break;
        }

        this.getScene().addEntity(new Explosion(this, texture));
        (this.getScene().getEntityWithName("audio") as SoundManager)
            .playSound(sound);

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
        if (this.texName.startsWith("big"))
        {
            this.addComponent(new ScreenShake(0.8, 900));
        }
        else
        {
            this.addComponent(new ScreenShake(0.5, 200));
        }
    }
}

export class ShrinkAndRunning extends Component
{
}

export class ShrinkAndRun extends System<[PassengerShip, Sprite, AnimatedSpriteController, Rigidbody, ShrinkAndRunning]>
{
    types = () => [PassengerShip, Sprite, AnimatedSpriteController, Rigidbody, ShrinkAndRunning];

    update(delta: number)
    {
        this.runOnEntities((entity, ship, sprite, sprite2, body) => {
            const curr = sprite.pixiObj.transform.scale;
            curr.x = MathUtil.clamp(curr.x - delta / 300, 0, 100);
            curr.y = MathUtil.clamp(curr.y - delta / 300, 0, 100);
            sprite.applyConfig({xScale: curr.x, yScale: curr.y});
            sprite2.applyConfig({xScale: curr.x, yScale: curr.y});

            const dir = MathUtil.pointDirection(0, 0, body.pendingX, body.pendingY);
            const f = MathUtil.lengthDirXY(1, -dir).multiply(delta / 10);
            body.pendingX += f.x;
            body.pendingY += f.y;
        });
    }
}

export class TriggerShrink extends System<[PassengerShip]>
{
    types = () => [PassengerShip];

    update(delta: number)
    {
        this.runOnEntities(((entity, ship) => {
            if (entity.transform.x > GAME_WIDTH - 20
                || entity.transform.x < 20
                || entity.transform.y > GAME_HEIGHT - 20
                || entity.transform.y < 20)
            {
                if (entity.getComponent(ShrinkAndRunning) === null)
                {
                    entity.addComponent(new ShrinkAndRunning());
                }
            }
        }));
    }
}
