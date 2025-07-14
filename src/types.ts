import {
    ChartDataset
} from 'chart.js';

// Conditional type for Google Maps LatLngLiteral
type GoogleLatLngLiteral = typeof google extends 'undefined' ? { lat: number; lng: number } : google.maps.LatLngLiteral;

interface MapChartDatasetBase extends Omit<ChartDataset<'map', any>, 'type'> {
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
    label: string;
}
export interface MapChartPointDataset extends MapChartDatasetBase {
    type: "point";
    data: [number, number];
}
export interface MapChartLineDataset extends MapChartDatasetBase {
    type: "line";
    data: [number, number][];
}
export interface MapChartPolygonDataset extends MapChartDatasetBase {
    type: "polygon";
    data: [number, number][];
}

export type MapChartDataset = MapChartPointDataset | MapChartLineDataset | MapChartPolygonDataset;


export interface MapChartOptions {
    zoom?: number;
    center?: GoogleLatLngLiteral;
    backgroundColor?: string;
    borderColor?: string;
    theme?: 'light' | 'dark';
    shape: 'circle' | 'square' | 'pin';
}

export const BORDER_COLORS = [
    'rgb(54, 162, 235)', // blue
    'rgb(255, 99, 132)', // red
    'rgb(255, 159, 64)', // orange
    'rgb(255, 205, 86)', // yellow
    'rgb(75, 192, 192)', // green
    'rgb(153, 102, 255)', // purple
    'rgb(201, 203, 207)' // grey
];

// Border colors with 50% transparency
export const BACKGROUND_COLORS = /* #__PURE__ */ BORDER_COLORS.map(color => color.replace('rgb(', 'rgba(').replace(')', ', 0.5)'));
