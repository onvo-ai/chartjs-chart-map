import {
    DatasetController,
    Chart
} from 'chart.js';
import { BACKGROUND_COLORS, BORDER_COLORS } from '../types';

// Conditional type for Google Maps Marker
type GoogleMarker = typeof google extends 'undefined' ? any : google.maps.Marker;

// Helper to check if running in a browser environment with Google Maps API loaded
const isGoogleMapsAvailable = (): boolean =>
    typeof window !== 'undefined' && !!window.google && !!window.google.maps;

export class MarkerController extends DatasetController {
    static id = 'marker';

    static defaults = {
        dataElementType: 'marker',
    };

    static overrides = {
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

    points: GoogleMarker[] = []; // Use conditional type for the instance property

    getDataset() {
        let data = this.chart.data.datasets[this.index] as any;
        return {
            ...data,
            backgroundColor: data.backgroundColor || BACKGROUND_COLORS[this.index % BACKGROUND_COLORS.length],
            borderColor: data.borderColor || BORDER_COLORS[this.index % BORDER_COLORS.length],
        }
    }

    constructor(chart: Chart, datasetIndex: number) {
        super(chart, datasetIndex);
    }

    normalizeData(data: any): [number, number][] {
        // Handle single point format: [lat, lng]
        if (Array.isArray(data) && typeof data[0] === 'number' && typeof data[1] === 'number') {
            return [[data[0], data[1]]];
        }

        // Handle array of points format: [[lat, lng], [lat, lng], ...]
        if (Array.isArray(data) && Array.isArray(data[0])) {
            return data;
        }

        // Default empty array if format is unrecognized
        return [];
    }

    drawPoints(dataset: any) {
        // @ts-ignore
        const map = (this.chart as any).map;
        if (!isGoogleMapsAvailable() || !map) return;

        const normalizedData = this.normalizeData(dataset.data);

        normalizedData.forEach((pointData) => {
            const position = new window.google.maps.LatLng(
                parseFloat(pointData[0].toFixed(6)),
                parseFloat(pointData[1].toFixed(6))
            );

            const marker = new window.google.maps.Marker({
                position,
                map: map,
                title: dataset.label,
                icon: {
                    path: window.google.maps.SymbolPath.CIRCLE, // Direct usage, guarded by isGoogleMapsAvailable
                    scale: 8,
                    fillColor: dataset.backgroundColor,
                    strokeColor: dataset.borderColor,
                    fillOpacity: 1,
                    strokeWeight: dataset.borderWidth || 1
                }
            });

            marker.addListener("click", () => {
                if (!isGoogleMapsAvailable() || !map) return; // Double check guard for safety
                const infowindow = new window.google.maps.InfoWindow({
                    content: `<h3 style="font-size: 16px; font-weight: bold; margin-top: 0px; margin-bottom: 0px">${dataset.label}</h3>`,
                    ariaLabel: dataset.label,
                });
                infowindow.open({
                    anchor: marker,
                    map: map,
                });
            });

            this.points.push(marker as GoogleMarker); // Cast to GoogleMarker when pushing to the typed array
        });
    }

    clearPoints() {
        if (!isGoogleMapsAvailable() || !(this.chart as any).map) return;
        this.points.forEach(point => (point as google.maps.Marker).setMap(null)); // Cast to actual GMaps type for method call
        this.points = [];
    }

    update(mode: string) {
        const meta = this._cachedMeta;
        const dataset = this.getDataset();
        const chartMap = (this.chart as any).map;

        if (!isGoogleMapsAvailable() || !chartMap) {
            // If Google Maps isn't available or map not set on chart, clear local points array if hidden
            if (mode === "hide" || mode === "reset" || (meta && meta.hidden)) {
                this.points = [];
            }
            return;
        }

        if ((mode === "show" || mode === "default") && this.points.length === 0 && meta && !meta.hidden) {
            this.drawPoints(dataset);
        } else if ((mode === "hide" || mode === "reset" || (meta && meta.hidden)) && this.points.length > 0) {
            this.clearPoints();
        }
    }
};
