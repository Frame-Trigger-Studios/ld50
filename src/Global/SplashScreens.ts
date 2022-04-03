import {
    AnimatedSprite,
    Component,
    Entity, FrameTriggerSystem,
    Game,
    GlobalSystem,
    Key,
    Scene,
    TextDisp,
    Timer, TimerSystem
} from "lagom-engine";
import {GAME_WIDTH, MainScene} from "../LD50";

export class ScreenCard extends Entity
{
    constructor(readonly texture: any, readonly clickAction: number, layer = 0)
    {
        super("card", 0, 0, layer);
    }

    onAdded(): void
    {
        super.onAdded();

        this.addComponent(new AnimatedSprite(this.texture, {animationSpeed: 650}));

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

            if (Game.mouse.isButtonPressed(0) || this.getScene().game.keyboard.isKeyPressed(Key.Space, Key.Enter))
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
    constructor(game: Game)
    {
        super(game);
    }

    onAdded()
    {
        super.onAdded();
        this.addGUIEntity(new ScreenCard(this.game.getResource("loseScreen").textureSliceFromSheet(), 1))
            .addComponent(new TextDisp(GAME_WIDTH - 70, 30, "placeholder",
                {fill: 0x203c56, fontSize: 10}));

        this.addGlobalSystem(new FrameTriggerSystem());
        this.addGlobalSystem(new TimerSystem());
        this.addGlobalSystem(new ClickListener());
    }
}
