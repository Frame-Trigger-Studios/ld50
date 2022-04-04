import {
    AnimatedSprite,
    Component,
    Entity,
    FrameTriggerSystem,
    Game,
    GlobalSystem,
    Key,
    PIXIComponent,
    Scene,
    Timer,
    TimerSystem
} from "lagom-engine";
import {MainScene, TutorialState} from "../LD50";
import TaggedText from "pixi-tagged-text";

export class ScreenCard extends Entity
{
    constructor(readonly texture: any, readonly clickAction: number, layer = 0)
    {
        super("card", 0, 0, layer);
    }

    onAdded(): void
    {
        super.onAdded();

        this.addComponent(new AnimatedSprite(this.texture, {animationSpeed: 800}));

        // Game reload. Skip to gameplay.
        if (!MainScene.firstLoad && this.clickAction === 0)
        {
            const action = this.addComponent(new ClickAction(this.clickAction));
            action.onAction();
        }
        else
        {
            MainScene.firstLoad = false;

            this.addComponent(new Timer(500, null)).onTrigger.register(() => {
                this.addComponent(new ClickAction(this.clickAction));
            });
        }
    }
}


class ClickAction extends Component
{
    constructor(readonly action: number)
    {
        super();
    }

    onAction()
    {
        switch (this.action)
        {
            // start game
            case 0:
            {
                MainScene.tutorialState = TutorialState.Rockets;
                (this.getScene() as MainScene).startGame();
                this.getEntity().destroy();
                break;
            }
            // restart
            case 1:
            {
                this.getScene().entities.forEach(x => x.destroy());
                this.getScene().systems.forEach(x => x.destroy());
                this.getScene().globalSystems.forEach(x => x.destroy());
                this.getScene().getGame().setScene(new MainScene(this.getScene().getGame()));
                break;
            }
        }
    }
}

export class ClickListener extends GlobalSystem
{
    types = () => [ClickAction];

    update(delta: number): void
    {
        this.runOnComponents((clickActions: ClickAction[]) => {

            if (this.scene.game.mouse.isButtonPressed(0) ||
                this.getScene().game.keyboard.isKeyPressed(Key.Space, Key.Enter))
            {
                for (const action of clickActions)
                {
                    action.onAction();
                    action.destroy();
                }
            }
        });
    }
}

export class EndScreen extends Scene
{
    constructor(game: Game, readonly score: number, readonly time: number)
    {
        super(game);
    }

    onAdded()
    {
        super.onAdded();

        const text =
            this.score === 0 ? "Humanity is extinct.\n"
                             : `But you saved <pop>${this.score}</pop> humans!\n...Or <pop>${(this.score / 7_900_000_0).toFixed(7)}%</pop>.`;

        // This isn't worse than it was. At least it is only 1 number now?
        // const xoff = this.score === 0 ? 105 : 80;
        const xoff = -40;

        const textStyles = {
            default: {fill: 0x6e5181, fontSize: 14, fontFamily: "myPixelFont", align: "center", lineHeight: 20},
            pop: {fill: 0x6cb9c9, fontSize: 14, fontFamily: "myPixelFont", align: "center", lineHeight: 20}
        };

        const e = this.addGUIEntity(new ScreenCard(this.game.getResource("loseScreen").textureSliceFromSheet(), 1));
        // .addComponent(new TextDisp(xoff, 125,
        // `${text}\nTime: ${Math.floor(this.time / 1000)} seconds`,
        // {fill: 0x6e5181, fontSize: 14, fontFamily: "myPixelFont", align: "center", lineHeight: 20}));

        const inner = new TaggedText(`${text}\nTime: <pop>${Math.floor(this.time / 1000)}</pop> seconds`, <never>textStyles);
        e.addComponent(new TaggedTextComp(xoff, 125, inner));

        this.addGlobalSystem(new FrameTriggerSystem());
        this.addGlobalSystem(new TimerSystem());
        this.addGlobalSystem(new ClickListener());
    }
}


class TaggedTextComp extends PIXIComponent<TaggedText>
{
    constructor(xOff: number, yOff: number, taggedText: TaggedText)
    {
        super(taggedText);

        this.pixiObj.x = xOff;
        this.pixiObj.y = yOff;
    }
}
