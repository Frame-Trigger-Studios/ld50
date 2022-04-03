import {Component, Entity, Game, MathUtil, Sprite, System,} from "lagom-engine";
import {EARTH_X, EARTH_Y, RocketType} from "../LD50";
import {LaunchpadArrow, LaunchpadSprite} from "./RocketSelection";

export class SiloThing extends Component
{
}

export class SiloAmmo extends Component
{
    constructor(public hasRocket: boolean, public rocket: RocketType)
    {
        super();
    }

    setRocket(rocket: RocketType)
    {
        this.rocket = rocket;
        this.hasRocket = true;
        const texture = this.getScene().game.getResource("rockets").texture(rocket, 0);
        const arrowTex = this.getScene().game.getResource("launchpad").texture(1, 0);
        this.getEntity().addComponent(new LaunchpadSprite(texture as never));
        this.getEntity().addComponent(new LaunchpadArrow(arrowTex as never));
    }

    removeRocket()
    {
        this.rocket = RocketType.NONE;
        this.hasRocket = false;
        this.getEntity().getComponent(LaunchpadSprite)?.destroy();
        this.getEntity().getComponent(LaunchpadArrow)?.destroy();
    }
}

export class Silo extends Entity
{
    constructor(x: number, y: number)
    {
        super("Silo", x, y);
    }

    onAdded()
    {
        super.onAdded();
        // this.addComponent(new RenderCircle(0, 0, 5, 0x0000AA, 0x0000FF));
        this.addComponent(
            new Sprite(this.getScene().game.getResource("launchpad").texture(0, 0), {yAnchor: 1, xAnchor: 0.5}));
        this.addComponent(new SiloThing());
        this.addComponent(new SiloAmmo(false, RocketType.NONE));
    }
}

export class SiloAimer extends System<[SiloThing, Sprite]>
{
    types = () => [SiloThing, Sprite];

    update(delta: number)
    {
        this.runOnEntities((entity: Entity, silo: SiloThing, sprite: Sprite) => {
            const mousePos = this.scene.camera.viewToWorld(Game.mouse.getPosX(), Game.mouse.getPosY());

            const direction = MathUtil.pointDirection(EARTH_X,
                EARTH_Y,
                mousePos.x,
                mousePos.y);
            const newPos = MathUtil.lengthDirXY(20, -direction);
            sprite.applyConfig({rotation: -direction + MathUtil.degToRad(90)});
            entity.transform.setTransform(newPos.x, newPos.y);
            entity.getComponent<LaunchpadSprite>(LaunchpadSprite)
                  ?.applyConfig({rotation: -direction + MathUtil.degToRad(90)});
            entity.getComponent<LaunchpadArrow>(LaunchpadArrow)
                  ?.applyConfig({rotation: -direction + MathUtil.degToRad(90)});
        });
    }
}
