import {ApplyForce, DiscreteRbodyCollisionSystem, PhysicsEngine} from "./Systems/Physics";
import {
    AudioAtlas,
    CollisionMatrix,
    DebugCollisionSystem,
    Diagnostics,
    FrameTriggerSystem,
    Game,
    Log,
    LogLevel,
    Scene,
    ScreenShaker,
    SimplePhysics,
    SpriteSheet,
    TimerSystem
} from "lagom-engine";
import {RocketSelection, TypingSystem} from "./Game/RocketSelection";
import {GameManager, GameManagerSystem} from "./Global/GameManager";
import {OffScreenDestroyer} from "./Systems/OffScreenDestroyer";
import {SiloAimer} from "./Game/SiloAimer";
import earthSpr from "./Art/earth.png";
import asteroidsSpr from "./Art/asteroids.png";
import launchpadSpr from "./Art/launchpad.png";
import rocketsSpr from "./Art/rockets.png";
import {SiloShooter} from "./Game/SiloShooter";
import {OffScreenPassenger, ScoreDisplay, ScoreUpdater} from "./Global/Score";
import {DestroySystem} from "./Systems/DestroyMeNextFrame";
import {RocketLoaderSystem} from "./Game/RocketLoader";
import {Earth} from "./Game/Earth";

import grooveMusic from "./Sound/LD50-v1-1.mp3";
import bigExplosionSound from "./Sound/big_explosion.wav";
import smallExplosionSound from "./Sound/small_explosion.wav";
import peopleEscapeSound from "./Sound/people_escape_trimmed.wav";
import rocketBuiltSound from "./Sound/rocket_built.wav";
import rocketLaunchSound from "./Sound/rocket_launch_short.wav";
import bigRocketLaunchSound from "./Sound/rocket_launch_short_big.wav";
import rocketAvailable from "./Sound/rocket_available.wav";

import {ClickListener, ScreenCard} from "./Global/SplashScreens";
import youLoseScreen from "./Art/endscreen.png";
import startScreen from "./Art/startscreen-splash.png";
import background from "./Art/background.png";
import mute from "./Art/mute.png";
import bigExplosion2 from "./Art/bigexplosion2.png";
import bigExplosion3 from "./Art/bigexplosion3.png";
import smallExplosion from "./Art/smallexplosion.png";
import smallExplosionAlt from "./Art/smallexplosionalt.png";
import fireSpr from "./Art/fire.png";
import {SoundManager} from "./Global/SoundManager";
import WebFont from "webfontloader";
import {Tutorial, TutorialMonitor} from "./Tutorial";
import {ShrinkAndRun, TriggerShrink} from "./Game/Rocket";


export enum Layers
{
    Background,
    Asteroid,
    Earth,
    Ship,
    Explosion,
    GUI
}

export enum TutorialState
{
    Rockets,
    ClickToShoot,
    Civilians,
    ClickToSaveCivs,
    Finished
}

export const CANVAS_WIDTH = 426;
export const GAME_WIDTH = 426;
export const GAME_HEIGHT = 240;
export const EARTH_X = GAME_WIDTH / 2;
export const EARTH_Y = GAME_HEIGHT / 2;

export const SECONDS_TO_MAX_ASTEROID_SPAWN_RATE = 240;
export const ASTEROID_SPEED_MULTIPLIER = 1;
export const EARTH_GRAVITY_MULTIPLIER = 1;


// Don't reorder these :)
export enum RocketType { STARSHIP, PASSENGER, ICBM, MISSILE, NONE}


const matrix = new CollisionMatrix();
matrix.addCollision(Layers.Asteroid, Layers.Asteroid);
matrix.addCollision(Layers.Asteroid, Layers.Earth);
matrix.addCollision(Layers.Asteroid, Layers.Ship);
matrix.addCollision(Layers.Ship, Layers.Earth);
matrix.addCollision(Layers.Ship, Layers.Ship);
matrix.addCollision(Layers.Explosion, Layers.Ship);
matrix.addCollision(Layers.Explosion, Layers.Asteroid);


export class MainScene extends Scene
{
    static tutorialState = TutorialState.Rockets;
    static firstLoad = true;

    onAdded()
    {
        super.onAdded();

        this.addGUIEntity(new ScreenCard(this.game.getResource("titleScreen").textureSliceFromSheet(), 0));
        this.addGlobalSystem(new FrameTriggerSystem());
        this.addGlobalSystem(new TimerSystem());
        this.addGlobalSystem(new ClickListener());
        this.addGUIEntity(new SoundManager());

        // this.addEntity(new Entity("background", 0, 0, Layers.Background))

    }

    startGame()
    {
        // Systems first
        this.addGlobalSystem(new FrameTriggerSystem());
        this.addSystem(new PhysicsEngine());
        this.addSystem(new SimplePhysics());
        this.addSystem(new GameManagerSystem());
        this.addSystem(new ScoreUpdater());
        this.addSystem(new ApplyForce());
        this.addSystem(new OffScreenDestroyer());
        this.addSystem(new DestroySystem());
        this.addSystem(new RocketLoaderSystem());
        this.addSystem(new OffScreenPassenger());
        this.addSystem(new TriggerShrink());
        this.addSystem(new ShrinkAndRun());
        this.addGlobalSystem(new ScreenShaker(EARTH_X, EARTH_Y));
        const collSystem = this.addGlobalSystem(new DiscreteRbodyCollisionSystem(matrix));

        this.addSystem(new SiloAimer());
        this.addSystem(new SiloShooter());
        this.addSystem(new TutorialMonitor());

        Log.logLevel = LogLevel.NONE;
        if (LD50.debug)
        {

            Log.logLevel = LogLevel.ALL;
            this.addGUIEntity(new Diagnostics("white", 8, true)).transform.x = 150;
            this.addGlobalSystem(new DebugCollisionSystem(collSystem));
        }
        this.addGlobalSystem(new TypingSystem());

        this.addEntity(new Earth("earth", 213, 120));

        this.addEntity(new GameManager("Game Manager"));
        this.addEntity(new ScoreDisplay("Score", 0, 0, Layers.GUI));
        this.addGUIEntity(new RocketSelection(0, this.camera.height - 58, Layers.GUI));

        this.addGUIEntity(new Tutorial());
    }
}

export class LD50 extends Game
{
    static debug = false;
    static muted = LD50.debug;
    static musicPlaying = false;
    static audioAtlas: AudioAtlas = new AudioAtlas();

    constructor()
    {
        super({width: CANVAS_WIDTH, height: GAME_HEIGHT, resolution: 3, backgroundColor: 0x0d001a});

        const music = LD50.audioAtlas.load("music", grooveMusic);
        music.loop(true);
        music.volume(0.7);

        LD50.audioAtlas.load("bigExplosion", bigExplosionSound).volume(0.6);
        LD50.audioAtlas.load("smallExplosion", smallExplosionSound).volume(0.5);
        LD50.audioAtlas.load("peopleEscape", peopleEscapeSound).volume(0.3);
        LD50.audioAtlas.load("rocketBuilt", rocketBuiltSound).volume(0.4);
        LD50.audioAtlas.load("rocketLaunch", rocketLaunchSound).volume(0.4);
        LD50.audioAtlas.load("bigRocketLaunch", bigRocketLaunchSound).volume(0.5);
        LD50.audioAtlas.load("rocketAvailable", rocketAvailable).volume(0);

        this.addResource("mute", new SpriteSheet(mute, 16, 16));
        this.addResource("titleScreen", new SpriteSheet(startScreen, GAME_WIDTH, GAME_HEIGHT));
        this.addResource("loseScreen", new SpriteSheet(youLoseScreen, GAME_WIDTH, GAME_HEIGHT));

        this.addResource("earth", new SpriteSheet(earthSpr, 64, 64));
        this.addResource("bigexplosion2", new SpriteSheet(bigExplosion2, 128, 128));
        this.addResource("bigexplosion3", new SpriteSheet(bigExplosion3, 128, 128));
        this.addResource("smallexplosion", new SpriteSheet(smallExplosion, 32, 32));
        this.addResource("smallexplosion2", new SpriteSheet(smallExplosionAlt, 32, 32));
        this.addResource("asteroids", new SpriteSheet(asteroidsSpr, 16, 16));
        this.addResource("launchpad", new SpriteSheet(launchpadSpr, 18, 32));
        this.addResource("rockets", new SpriteSheet(rocketsSpr, 32, 32));
        this.addResource("fire", new SpriteSheet(fireSpr, 10, 10));
        this.addResource("background", new SpriteSheet(background, 426, 240));

        WebFont.load({
            custom: {
                families: ["myPixelFont"]
            }
        });

        this.resourceLoader.loadAll().then(() => {
            this.setScene(new MainScene(this));
        });
    }
}
