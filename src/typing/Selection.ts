import {Component, Entity, Key, RenderRect, System, TextDisp} from "lagom-engine";

export class TypePane extends Entity
{
    constructor(x: number, y: number, depth: number) {
        super("typePane", x, y, depth);
    }

    onAdded() {
        super.onAdded();
        this.addComponent(new RenderRect(0, 0, 150, 100, 0xFFFFFF, 0x000000));
        const randomText = "QWER";
        this.addComponent(new TextDisp(40, 40, randomText, {fill:"gray"}));
        this.addComponent(new TextDisp(40, 40, ""));
        this.addComponent(new TypedLetters(randomText, ""));
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
        ]);
    }

    types = () => [TypedLetters];

    update(delta: number): void
    {
        this.runOnEntities((entity: Entity) => {

            const game = this.getScene().getGame();
            this.allowedKeys.forEach((v, k) => {
                if (game.keyboard.isKeyPressed(k)) {
                    const typedLetters = entity.getComponent<TypedLetters>(TypedLetters);
                    if (typedLetters != null && typedLetters.pattern.startsWith(typedLetters.typed + v)) {
                        typedLetters.typed += v;
                        const typedPane = this.getScene().getEntityWithName("typePane");
                        typedPane?.addComponent(new TextDisp(40, 40, typedLetters.typed, {fill:"red"}));
                    }
                }
            });
        });
    }
}