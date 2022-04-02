import {Entity, RenderRect} from "lagom-engine";

export class TypePane extends Entity
{
    constructor(x: number, y: number, depth: number) {
        super("typePane", x, y, depth);
    }


    onAdded() {
        super.onAdded();
        this.addComponent(new RenderRect(0, 0, 400, 200, 0xFFFFFF, 0x000000));

    }
}