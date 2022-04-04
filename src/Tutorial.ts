import {Component, Entity, Log, RenderRect, System, TextDisp} from "lagom-engine";
import {Layers} from "./LD50";

export class Tutorial extends Entity
{

    constructor(readonly type: "rocket" | "civ")
    {
        super("tutorial", 0, 0, Layers.GUI);
    }

    onAdded()
    {
        super.onAdded();

        if (this.type === "rocket")
        {
            this.addComponent(new RenderRect(2, 180, 183, 30, null, 0x6ceded));
            this.addComponent(new TextDisp(190, 180, "Launch rockets at\nthe asteroids!", {
                fontSize: 10,
                fontFamily: "myPixelFont",
                fill: 0x6ceded,
            }));//.pixiObj.linestyle;
        } else
        {
            this.addComponent(new RenderRect(2, 180, 183, 30, null, 0x6ceded));
            this.addComponent(new TextDisp(190, 180, "Launch rockets at\nthe asteroids!", {
                fontSize: 10,
                fontFamily: "myPixelFont",
                fill: 0x6ceded,
            }));
        }
        this.addComponent(new PulseMe(2.5));
    }
}

class PulseMe extends Component
{
    public dir = -1;

    constructor(readonly speed: number)
    {
        super();
    }
}

export class TextPulser extends System<[PulseMe, RenderRect]>
{
    types = () => [PulseMe, RenderRect];

    update(delta: number): void
    {
        Log.error("he;l");
        this.runOnEntities((entity, pulseMe, renderRect) => {
            renderRect.pixiObj.alpha += pulseMe.dir * pulseMe.speed * (delta / 1000);
            // renderRect.pixiObj.alpha -= 0.05;

            if (renderRect.pixiObj.alpha > 1)
            {
                pulseMe.dir = -1;
            }

            if (renderRect.pixiObj.alpha < 0)
            {
                pulseMe.dir = 1;
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