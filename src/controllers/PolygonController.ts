import {
    Chart,
    DatasetController,
    UpdateMode
} from 'chart.js';
import { BACKGROUND_COLORS, BORDER_COLORS, MapChartPolygonDataset } from '../types';

// Conditional types for Google Maps objects
type GooglePolygon = typeof google extends 'undefined' ? any : google.maps.Polygon;
type GoogleMap = typeof google extends 'undefined' ? any : google.maps.Map;

const isGoogleMapsAvailable = (): boolean =>
    typeof window !== 'undefined' && !!window.google && !!window.google.maps;

export class PolygonController extends DatasetController<any, any> {
    static id = 'polygon';

    static defaults = {
        dataElementType: 'polygon',
    };

    private polygons: (GooglePolygon | null)[] = [];
    private gmap: GoogleMap | null = null;

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
        if (isGoogleMapsAvailable()) {
            this.gmap = (chart as any).map || null;
            if (!this.gmap) {
                console.warn('PolygonController: Google Map instance not found on chart object. Polygons will not be drawn.');
            }
        }
    }

    private _createGooglePolygon(polygonData: MapChartPolygonDataset, index: number): GooglePolygon | null {
        if (!isGoogleMapsAvailable() || !this.gmap || !polygonData || !polygonData.data || polygonData.data.length === 0) {
            return null;
        }

        const LatLng = window.google.maps.LatLng;
        const GooglePolygon = window.google.maps.Polygon;

        const path = polygonData.data.map(p => new LatLng(p[0], p[1]));

        const polygon = new GooglePolygon({
            paths: path,
            strokeColor: polygonData.borderColor || BORDER_COLORS[index % BORDER_COLORS.length],
            strokeOpacity: 0.8,
            strokeWeight: polygonData.borderWidth || 2,
            fillColor: polygonData.backgroundColor || BACKGROUND_COLORS[index % BACKGROUND_COLORS.length],
            fillOpacity: 0.35,
        });

        polygon.setMap(this.gmap);
        return polygon;
    }

    update(mode: UpdateMode): void {
        super.update(mode);

        this.removePolygonsFromMap();

        if (!isGoogleMapsAvailable() || !this.gmap) {
            return;
        }


        const dataset = this.chart.data.datasets[this.index];
        const newPolygons: GooglePolygon[] = [];

        if (dataset && Array.isArray(dataset.data)) {
            const googlePolygon = this._createGooglePolygon(dataset as any, this.index);
            if (googlePolygon) {
                newPolygons.push(googlePolygon);
            }
        }
        this.polygons = newPolygons;
    }

    private removePolygonsFromMap(): void {
        if (isGoogleMapsAvailable() && this.gmap) {
            this.polygons.forEach(p => {
                if (p) p.setMap(null);
            });
        }
        this.polygons = [];
    }

    destroy(): void {
        this.removePolygonsFromMap();
    }

    draw(): void {
    }
}
