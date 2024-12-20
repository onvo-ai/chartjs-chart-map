import { Element } from 'chart.js';

export class MapElement extends Element {

    static id = 'map';

    static defaults = {
        backgroundColor: undefined,
        borderColor: undefined,
        borderWidth: undefined,
        borderRadius: 0,
        anchorX: 'center',
        anchorY: 'center',
        width: 20,
        height: 20
    };

    constructor(cfg: any) {
        super();

        if (cfg) {
            Object.assign(this, cfg);
        }
    }

    draw(ctx: any) {

        ctx.save();

        // do drawing

        ctx.restore();
    }

}