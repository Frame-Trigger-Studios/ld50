import {Button, Component, Entity, Key, RenderRect, System, TextDisp, Timer} from "lagom-engine";
import {Layers, MainScene, TutorialState} from "./LD50";

export class Tutorial extends Entity
{

    constructor()
    {
        super("tutorial", 0, 0, Layers.GUI);
    }

    onAdded()
    {
        super.onAdded();

        switch (MainScene.tutorialState)
        {
            case TutorialState.Rockets:
                this.addComponent(new RenderRect(2, 181, 143, 25, null, 0x6ceded));
                this.addComponent(new TextDisp(160, 181, "Launch rockets at\nthe asteroids!", {
                    fontSize: 10,
                    fontFamily: "myPixelFont",
                    fill: 0x6ceded,
                }));
                this.addComponent(new PulseMe(2.5, [Key.KeyQ, Key.KeyR], false, [2, 181, 143, 25]));
                break;
            case TutorialState.ClickToShoot:
                this.addComponent(new RenderRect(-100, -100, 1, 1));
                this.addComponent(new TextDisp(190, 180, "Click to launch the rocket!", {
                    fontSize: 10,
                    fontFamily: "myPixelFont",
                    fill: 0x6ceded,
                }));
                this.addComponent(new PulseMe(2.5, [], true, [-100, -100, 1, 1]));
                break;
            case TutorialState.ClickToSaveCivs:
                this.addComponent(new RenderRect(-100, -100, 1, 1));
                this.addComponent(new TextDisp(190, 180, "Click to launch the escape pod!", {
                    fontSize: 10,
                    fontFamily: "myPixelFont",
                    fill: 0x6ceded,
                }));
                this.addComponent(new PulseMe(2.5, [], true, [-100, -100, 1, 1]));
                break;
            case TutorialState.Civilians:
                this.addComponent(new RenderRect(2, 213, 143, 25, null, 0x6ceded));
                this.addComponent(new TextDisp(160, 213, "Launch escape pods\nto safety!", {
                    fontSize: 10,
                    fontFamily: "myPixelFont",
                    fill: 0x6ceded,
                }));
                this.addComponent(new PulseMe(2.5, [Key.KeyA, Key.KeyF], false, [2, 213, 143, 25]));
                break;
        }
        this.addComponent(new Timer(600, this, false)).onTrigger.register(timerCb);
    }
}

const timerCb = (caller: unknown, data: Entity): void => {
    const pulse = data.getComponent<PulseMe>(PulseMe);
    const text = data.getComponent<TextDisp>(TextDisp);
    const rect = data.getComponent<RenderRect>(RenderRect);
    if (pulse == null || text == null || rect == null) return;

    if (pulse.txtState)
    {
        data.addComponent(new TextDisp(text.pixiObj.transform.position.x, text.pixiObj.transform.position.y,
            text.pixiObj.text, {
                fontSize: 10,
                fontFamily: "myPixelFont",
                fill: 0x6cb9c9,
            }));
        data.addComponent(new RenderRect(...pulse.rectPos, null, 0x6cb9c9));
    }
    else
    {
        data.addComponent(new TextDisp(text.pixiObj.transform.position.x, text.pixiObj.transform.position.y,
            text.pixiObj.text, {
                fontSize: 10,
                fontFamily: "myPixelFont",
                fill: 0x6ceded,
            }));
        data.addComponent(new RenderRect(...pulse.rectPos, null, 0x6ceded));
    }
    pulse.txtState = !pulse.txtState;
    text.destroy();
    data.addComponent(new Timer(600, data, false)).onTrigger.register(timerCb);
};

class PulseMe extends Component
{
    public dir = -1;
    public txtState = true;

    constructor(readonly speed: number, readonly clearKeys: Key[], readonly clickClear: boolean,
                readonly rectPos: [number, number, number, number])
    {
        super();
    }
}

export class BoxPulser extends System<[PulseMe, RenderRect]>
{
    types = () => [PulseMe, RenderRect];

    update(delta: number): void
    {
        this.runOnEntities((entity, pulseMe, renderRect) => {
            // renderRect.pixiObj.alpha += pulseMe.dir * pulseMe.speed * (delta / 1000);

            if (renderRect.pixiObj.alpha > 1)
            {
                pulseMe.dir = -1;
            }

            if (renderRect.pixiObj.alpha < 0)
            {
                pulseMe.dir = 1;
            }

            if (this.getScene().game.keyboard.isKeyPressed(...pulseMe.clearKeys)
                || (pulseMe.clickClear && this.getScene().game.mouse.isButtonPressed(Button.LEFT)))
            {
                MainScene.tutorialState += 1;

                if (MainScene.tutorialState === TutorialState.Civilians)
                {
                    this.getScene()
                        .addEntity(new Entity("tutTimer", 0, 0))
                        .addComponent(new Timer(2000, null, false))
                        .onTrigger.register(caller => {
                        caller.getScene().addGUIEntity(new Tutorial());
                    });
                }
                entity.destroy();
            }
        });
    }
}

// export class ScoreDisplay extends Entity {
//
//     onAdded() {
//         super.onAdded();
//         const score = this.addComponent(new Score());
//         this.addComponent(new TextDisp(10, 8, score.getScoreText(), {
//             fontSize: 10,
//             fontFamily: "myPixelFont",
//             fill: 0x6ceded,
//         }));
//     }
// }
