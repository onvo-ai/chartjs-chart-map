import { Chart } from 'chart.js';
import { MapController } from './controller';
import { MapElement } from './element';

Chart.register(MapController, MapElement);
export { MapController, MapElement };