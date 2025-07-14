import { Chart, ChartType } from 'chart.js';
import { PolygonController, PolylineController, MarkerController, MapController } from './controllers';
import { MapPlugin } from './plugins';
import { MapChartDataset, MapChartOptions } from "./types";
import { PolygonElement, PolylineElement, MarkerElement } from './elements';
import './style.css';

// Chart.js type extension
declare module 'chart.js' {
    interface ChartTypeRegistry {
        map: {
            type: 'polygon' | 'line' | 'point';
            data: MapChartDataset[];
            options: MapChartOptions;
        };
    }
    interface MapPlugin<TType extends ChartType> {
        map?: {
            color?: string
        }
    }
}

Chart.register(MapController, PolygonController, MarkerController, PolylineController, PolylineElement, MarkerElement, PolygonElement);
export { MapController, MapPlugin, PolygonController, PolylineController, MarkerController, PolylineElement, MarkerElement, PolygonElement };