import {Component, Entity, GlobalSystem, Key, RenderRect, System, TextDisp} from "lagom-engine";
import {SiloAmmo, SiloThing} from "../SiloAimer";

export class RocketSelection extends Entity
{
    constructor(x: number, y: number, depth: number) {
        super("rocketSelection", x, y, depth);
    }

    onAdded() {
        super.onAdded();
        this.addComponent(new RenderRect(0, 0, 150, 60, 0xFFFFFF, 0x000000));
        this.addChild(new TypePane(0, 0, 1, "QWER"));
        this.addChild(new TypePane(0, 30, 1, "ASDF"));
    }
}

export class TypePane extends Entity
{
    constructor(x: number, y: number, depth: number, readonly text:string) {
        super("typePane", x, y, depth);
    }

    onAdded() {
        super.onAdded();
        this.addChild(new PreviewLettersTextDisp(5, 5, 0, this.text));
        this.addChild(new TypedLettersTextDisp(5, 5, 0, ""));
        this.addComponent(new TypedLetters(this.text, ""));
    }
}

export class CompletedRocket extends Component{}

export class TypedLettersTextDisp extends Entity {
    constructor(x: number, y: number, depth: number, readonly text: string) {
        super("TypedLettersTextDisp", x, y, depth);
    }

    onAdded() {
        super.onAdded();
        this.addComponent(new TextDisp(0, 0, this.text, {fill:"red", fontSize: 16}));
    }
}

export class PreviewLettersTextDisp extends Entity {
    constructor(x: number, y: number, depth: number, readonly text: string) {
        super("PreviewLettersTextDisp", x, y, depth);
    }

    onAdded() {
        super.onAdded();
        this.addComponent(new TextDisp(0, 0, this.text[0], {fill:"gray", fontSize: 16}));
    }
}

class TypedLetters extends Component {
    constructor(public pattern: string, public typed: string) {
        super();
    }
}

export class TypingSystem extends GlobalSystem {
    private allowedKeys: Map<string, string>;

    constructor() {
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
            if (game.keyboard.isKeyPressed(k)) {
                letter = v;
                return;
            }
        });
        if (letter == "") {
            return;
        }
        console.log(letter);

        const typingEntities = this.getScene().entities.filter((entity) => entity.getComponent(TypedLetters) != null);
        const startedEntities = typingEntities.filter(entity => {
            const typpedLetters = entity.getComponent<TypedLetters>(TypedLetters);
            return typpedLetters && typpedLetters.typed.length > 0;
        });

        let matchingEntity = null;

        // Block rocket building if there is a stored rocket.
        if (typingEntities.some(entity => entity.getComponent(CompletedRocket) != null)) {
            return;
        }

        if (startedEntities.length > 0 ) {
            // assume only one started
            matchingEntity = startedEntities[0];
        } else {
            const matchingEntities = typingEntities.filter(entity => {
                const typedLetters = entity.getComponent<TypedLetters>(TypedLetters);
                // console.log("typed: " + typedLetters?.pattern + " " + typedLetters?.typed + " " + letter);
                return typedLetters?.pattern.startsWith(typedLetters.typed + letter);
            });
            if (matchingEntities.length > 0) {
                matchingEntity = matchingEntities[0];
            }
        }

        if (matchingEntity) {
            const typingEntity = matchingEntity;
            const typedLetters = typingEntity.getComponent<TypedLetters>(TypedLetters);
            const textDisp = typingEntity.findChildWithName("TypedLettersTextDisp");
            const text = textDisp?.getComponent<TextDisp>(TextDisp);
            const expectedText = typingEntity.findChildWithName("PreviewLettersTextDisp")
                ?.getComponent<TextDisp>(TextDisp);
            if (typedLetters == null) {
                return;
            }
            // console.log("typed: " + typedLetters.pattern);
            if (typedLetters.pattern.startsWith(typedLetters.typed + letter)) {
                typedLetters.typed += letter;

                if (!text) {
                    return;
                }

                if (typedLetters.typed == typedLetters.pattern) {
                    this.resetTyped(typedLetters, text, expectedText);
                    matchingEntity.addComponent(new CompletedRocket());
                }
                else
                {
                    text.pixiObj.text = typedLetters.typed;
                    if (expectedText) {
                        expectedText.pixiObj.text = typedLetters.pattern;
                    }
                }
            } else {
                this.resetTyped(typedLetters, text, expectedText);
            }
        }
    }

    private resetTyped(typedLetters: TypedLetters,
                         enteredText: TextDisp | undefined | null,
                         expectedText: TextDisp | undefined | null) {
        typedLetters.typed = "";
        if (enteredText) {
            enteredText.pixiObj.text = "";
        }
        if (expectedText) {
            expectedText.pixiObj.text = typedLetters.pattern[0];
        }
    }
}

export class RocketLoaderSystem extends System<[CompletedRocket]> {
    types = () => [CompletedRocket];

    update(delta: number): void
    {
        this.runOnEntities((entity: Entity, completedRocket: CompletedRocket) => {
            const siloAmmo = this.getScene().getEntityWithName("Silo")?.getComponent<SiloAmmo>(SiloAmmo);
            if (siloAmmo) {
                siloAmmo.hasRocket = true;
            }
        });
    }
}