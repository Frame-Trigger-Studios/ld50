import {AnimatedSpriteController, Button, Component, Entity, Mouse, SpriteSheet, System, Timer} from "lagom-engine";

import {Layers, LD50} from "../LD50";

class MuteComp extends Component
{
}

class MuteListener extends System<[AnimatedSpriteController, MuteComp]>
{
    types = () => [AnimatedSpriteController, MuteComp];

    update(delta: number): void
    {
        this.runOnEntities((e: Entity, spr: AnimatedSpriteController) => {
            if (Mouse.isButtonPressed(Button.LEFT))
            {
                const pos = e.scene.game.renderer.plugins.interaction.mouse.global;

                if (pos.x > 0 && pos.x < 16 && pos.y > 0 && pos.y < 16)
                {
                    (e.scene.getEntityWithName("audio") as SoundManager).toggleMute();
                    spr.setAnimation(Number(LD50.muted));
                }
            }
        });
    }
}

export class SoundManager extends Entity
{
    constructor()
    {
        super("audio", 0, 0, Layers.GUI);

        this.startMusic();
    }

    onAdded(): void
    {
        super.onAdded();

        this.addComponent(new MuteComp());
        const spr = this.addComponent(new AnimatedSpriteController(Number(LD50.muted), [
            {
                id: 0,
                textures: this.scene.game.getResource("mute").textures([[0, 0]], 16, 16)
            }, {
                id: 1,
                textures: this.scene.game.getResource("mute").textures([[1, 0]], 16, 16)
            }]));

        this.addComponent(new Timer(50, spr, false)).onTrigger.register((caller, data) => {
            data.setAnimation(Number(LD50.muted));
        });

        this.scene.addSystem(new MuteListener());
    }

    toggleMute()
    {
        LD50.muted = !LD50.muted;

        if (LD50.muted)
        {
            this.stopAllSounds();
        }
        else
        {
            this.startMusic();
        }
    }

    startMusic()
    {
        if (!LD50.muted && !LD50.musicPlaying)
        {
            LD50.audioAtlas.play("music");
            LD50.musicPlaying = true;
        }
    }

    stopAllSounds(music = true)
    {
        if (music)
        {
            LD50.audioAtlas.sounds.forEach((v: any, k: string) => v.stop());
            LD50.musicPlaying = false;
        }
        else
        {
            LD50.audioAtlas.sounds.forEach((v: any, k: string) => {
                if (k !== "music") v.stop();
            });
        }
    }

    onRemoved(): void
    {
        super.onRemoved();
        this.stopAllSounds(false);
    }

    playSound(name: string)
    {
        if (!LD50.muted)
        {
            LD50.audioAtlas.play(name);
        }
    }
}
