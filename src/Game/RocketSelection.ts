import {Component, Entity, GlobalSystem, Key, Sprite, TextDisp, Timer} from "lagom-engine";
import {RocketType} from "../LD50";
import {CompletedRocket} from "./RocketLoader";

const DISABLE_ALPHA = 0.3;

class RocketTypeModifier extends Component {
    constructor(public type: RocketType) {
        super();
    }
}

export class RocketSelection extends Entity
{
    constructor(x: number, y: number, depth: number)
    {
        super("rocketSelection", x, y, depth);
    }

    onAdded()
    {
        super.onAdded();
        this.addChild(new TypePane(0, 0, 1, "QWER", RocketType.MISSILE));
        this.addChild(new TypePane(80, 0, 1, "REWQWQ", RocketType.ICBM));
        this.addChild(new TypePane(0, 30, 1, "ASDF", RocketType.PASSENGER));
        this.addChild(new TypePane(80, 30, 1, "FDSASA", RocketType.STARSHIP));
    }
}

export class TypePane extends Entity
{
    constructor(x: number, y: number, depth: number, readonly text: string, readonly rocketType: RocketType)
    {
        super("typePane", x, y, depth);
    }

    onAdded()
    {
        const texture = this.getScene().game.getResource("rockets").texture(this.rocketType, 0);
        this.addComponent(new Sprite(texture, {
            xAnchor: 0,
            yAnchor: 0.1,
            xOffset: -8 ,
        }));
        // Big rockets have even enum values
        const spriteWidth = (this.rocketType % 2 == 0) ? 20 : 16;
        super.onAdded();
        this.addChild(new PreviewLettersTextDisp(spriteWidth, 5, 0, this.text));
        this.addChild(new TypedLettersTextDisp(spriteWidth, 5, 0, ""));
        this.addComponent(new TypedLetters(this.text, ""));
        this.addComponent(new RocketTypeModifier(this.rocketType));
    }
}

export class TypedLettersTextDisp extends Entity
{
    constructor(x: number, y: number, depth: number, readonly text: string)
    {
        super("TypedLettersTextDisp", x, y, depth);
    }

    onAdded()
    {
        super.onAdded();
        this.addComponent(new TextDisp(0, 0, this.text, {fill: 0x6ceded, fontSize: 16, fontFamily: "myPixelFont"}));
    }
}

export class PreviewLettersTextDisp extends Entity
{
    constructor(x: number, y: number, depth: number, readonly text: string)
    {
        super("PreviewLettersTextDisp", x, y, depth);
    }

    onAdded()
    {
        super.onAdded();
        this.addComponent(new TextDisp(0, 0, this.text[0], {fill: 0x6e5181, fontSize: 16, fontFamily: "myPixelFont"}));
    }
}

export class TypedLetters extends Component
{
    constructor(public pattern: string, public typed: string)
    {
        super();
    }
}

export class TypingSystem extends GlobalSystem
{
    private allowedKeys: Map<string, string>;

    constructor()
    {
        super();
        this.allowedKeys = new Map<string, string>([
            [Key.KeyQ, "Q"],
            [Key.KeyW, "W"],
            [Key.KeyE, "E"],
            [Key.KeyR, "R"],
            [Key.KeyA, "A"],
            [Key.KeyS, "S"],
            [Key.KeyD, "D"],
            [Key.KeyF, "F"],
        ]);
    }

    types = () => [];

    update(delta: number): void
    {
        const game = this.getScene().getGame();
        let letter = "";
        this.allowedKeys.forEach((v, k) => {
            if (game.keyboard.isKeyPressed(k))
            {
                letter = v;
                return;
            }
        });
        if (letter == "")
        {
            return;
        }

        const typingEntities = this.getScene().entities.filter((entity) => entity.getComponent(TypedLetters) != null);
        const startedEntities = typingEntities.filter(entity => {
            const typpedLetters = entity.getComponent<TypedLetters>(TypedLetters);
            return typpedLetters && typpedLetters.typed.length > 0;
        });

        let matchingEntity = null;

        // Block rocket building if there is a stored rocket.
        if (typingEntities.some(entity => entity.getComponent(CompletedRocket) != null))
        {
            return;
        }

        if (startedEntities.length > 0)
        {
            // assume only one started
            matchingEntity = startedEntities[0];
        } else
        {
            const matchingEntities = typingEntities
                .filter(entity => !entity.getComponent(Timer) )
                .filter(entity => {
                const typedLetters = entity.getComponent<TypedLetters>(TypedLetters);
                // console.log("typed: " + typedLetters?.pattern + " " + typedLetters?.typed + " " + letter);
                return typedLetters?.pattern.startsWith(typedLetters.typed + letter);
            });
            if (matchingEntities.length > 0)
            {
                matchingEntity = matchingEntities[0];
            }
        }

        if (matchingEntity)
        {
            const typingEntity = matchingEntity;
            const typedLetters = typingEntity.getComponent<TypedLetters>(TypedLetters);
            const textDisp = typingEntity.findChildWithName("TypedLettersTextDisp");
            const text = textDisp?.getComponent<TextDisp>(TextDisp);
            const expectedText = typingEntity.findChildWithName("PreviewLettersTextDisp")
                ?.getComponent<TextDisp>(TextDisp);
            if (typedLetters == null)
            {
                return;
            }
            // console.log("typed: " + typedLetters.pattern);
            if (typedLetters.pattern.startsWith(typedLetters.typed + letter))
            {
                typedLetters.typed += letter;

                if (!text)
                {
                    return;
                }

                if (typedLetters.typed == typedLetters.pattern) {
                    this.resetTyped(typedLetters, text, expectedText);
                    const rocketType = matchingEntity.getComponent<RocketTypeModifier>(RocketTypeModifier);
                    if (rocketType) {
                        matchingEntity.addComponent(new CompletedRocket(rocketType.type));
                    }
                    TypingSystem.changeTypingPaneAlpha([typingEntity], DISABLE_ALPHA);
                } else {
                    text.pixiObj.text = typedLetters.typed;
                    if (expectedText) {
                        expectedText.pixiObj.text = typedLetters.pattern;
                    }

                    TypingSystem.changeTypingPaneAlpha(typingEntities.filter(entity => entity != typingEntity), DISABLE_ALPHA);
                }
            } else {
                this.resetTyped(typedLetters, text, expectedText);
                TypingSystem.changeTypingPaneAlpha(typingEntities.filter(entity => !entity.getComponent(Timer)), 1);

            }
        }
    }

    private resetTyped(typedLetters: TypedLetters,
                       enteredText: TextDisp | undefined | null,
                       expectedText: TextDisp | undefined | null)
    {
        typedLetters.typed = "";
        if (enteredText)
        {
            enteredText.pixiObj.text = "";
        }
        if (expectedText)
        {
            expectedText.pixiObj.text = typedLetters.pattern[0];
        }
    }

    // Naughty naughty
    public static changeTypingPaneAlpha(entities: Entity[], alpha: number) {
        entities
            .forEach(entity => {
            const sprite = entity.getComponent<Sprite>(Sprite);
            if (sprite) {
                sprite.pixiObj.alpha = alpha;
            }
            const previewText = entity.findChildWithName("PreviewLettersTextDisp")?.getComponent<TextDisp>(TextDisp);
            if (previewText) {
                previewText.pixiObj.alpha = alpha;
            }
        });
    }
}

export class LaunchpadSprite extends Sprite {
    constructor(texture: never /* PIXI.Texture */)
    {
        super(<never>texture, {xAnchor:0.5, yAnchor:0.75});
    }
}