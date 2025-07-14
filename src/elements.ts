import { Element } from 'chart.js';

const DEFAULTS = {
    backgroundColor: undefined,
    borderColor: undefined,
    borderWidth: undefined,
    borderRadius: 0,
    anchorX: 'center',
    anchorY: 'center',
    width: 20,
    height: 20
};

export class MarkerElement extends Element {
    static id = 'marker';
    static defaults = DEFAULTS;

    constructor(cfg: any) {
        super();

        if (cfg) {
            Object.assign(this, cfg);
        }
    }

    draw(_: any) {
        // do something
    }
}

export class PolylineElement extends Element {
    static id = 'polyline';
    static defaults = DEFAULTS;

    constructor(cfg: any) {
        super();

        if (cfg) {
            Object.assign(this, cfg);
        }
    }

    draw(_: any) {
        // do something
    }
}

export class PolygonElement extends Element {
    static id = 'polygon';
    static defaults = DEFAULTS;

    constructor(cfg: any) {
        super();

        if (cfg) {
            Object.assign(this, cfg);
        }
    }

    draw(_: any) {
        // do something
    }
}