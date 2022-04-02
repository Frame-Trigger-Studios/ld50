import {Component, Entity, Key, RenderRect, System, TextDisp} from "lagom-engine";

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

export class TypingSystem extends System<[TypedLetters]> {
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

    types = () => [TypedLetters];

    update(delta: number): void
    {
        this.runOnEntities((entity: Entity, typedLetters: TypedLetters) => {

            const game = this.getScene().getGame();
            this.allowedKeys.forEach((v, k) => {
                if (game.keyboard.isKeyPressed(k)) {
                    if (typedLetters != null && typedLetters.pattern.startsWith(typedLetters.typed + v)
                        && this.noneStarted(entity, typedLetters)) {
                        typedLetters.typed += v;

                        const textDisp = entity.findChildWithName("TypedLettersTextDisp");
                        const text = textDisp?.getComponent<TextDisp>(TextDisp);
                        if (text) {
                            const expectedText = entity.findChildWithName("PreviewLettersTextDisp")
                                ?.getComponent<TextDisp>(TextDisp);
                            if (typedLetters.typed == typedLetters.pattern) {
                                text.pixiObj.text = "";
                                typedLetters.typed = "";
                                if (expectedText) {
                                    expectedText.pixiObj.text = typedLetters.pattern[0];
                                }
                            }
                            else
                            {
                                text.pixiObj.text = typedLetters.typed;
                                if (expectedText) {
                                    expectedText.pixiObj.text = typedLetters.pattern;
                                }
                            }
                        }
                    }
                }
            });
        });
    }

    private noneStarted(entity: Entity, target: TypedLetters): boolean {
        const children = entity?.parent?.children;
        if (children) {
            return !children.some((entity) => {
                const typedLetters = entity.getComponent<TypedLetters>(TypedLetters);
                if (typedLetters && target != typedLetters) {
                    return typedLetters.typed.length > 0;
                }
                else
                {
                    return false;
                }
            });
        }
        return true;
    }
}