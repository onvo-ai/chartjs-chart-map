import {
    DatasetController,
    Chart
} from 'chart.js';


export class MapController extends DatasetController {
    static id = 'map';

    static defaults = {
        dataElementType: 'polygon',
    };

    static overrides = {
        animations: false,
        interaction: {
            mode: 'nearest',
            intersect: true
        },
        scales: {
            x: {
                display: false,
            },
            y: {
                display: false,
            }
        },
    };

    constructor(chart: Chart, datasetIndex: number) {
        super(chart, datasetIndex);
    }
}