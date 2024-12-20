import {
  DatasetController,
  ChartDataset,
  Chart
} from 'chart.js';
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import { light } from './themes';

export interface PointDataPoint {
  type: "point"
  lat: number;
  lng: number;
}
export interface LineDataPoint {
  type: "line"
  points: google.maps.LatLngLiteral[];
}
export interface PolygonDataPoint {
  type: "polygon"
  points: google.maps.LatLngLiteral[];
}

export type MapDataPoint = PointDataPoint | LineDataPoint | PolygonDataPoint;

export interface MapChartDataset extends ChartDataset<'map', MapDataPoint[]> {
  data: MapDataPoint[];
  backgroundColor?: string;
  borderColor?: string;
}

export interface MapChartOptions {
  zoom?: number;
  center?: google.maps.LatLngLiteral;
  backgroundColor?: string;
  borderColor?: string;
  shape: 'circle' | 'square' | 'pin';
}

// Chart.js type extension
declare module 'chart.js' {
  interface ChartTypeRegistry {
    map: {
      type: 'map';
      data: MapDataPoint[];
      options: MapChartOptions;
    };
  }
}

// Map Plugin
export class MapController extends DatasetController {
  static id = 'map';

  static defaults = {
    dataElementType: 'map',
  };

  static overrides = {
    interaction: {
      mode: 'nearest',
      intersect: true
    },
    plugins: {

      legend: {
        display: false
      }
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

  map: google.maps.Map | null;
  markers: Map<number, google.maps.Marker>;

  constructor(chart: Chart, datasetIndex: number) {
    super(chart, datasetIndex);
    this.markers = new Map();
    this.map = null;

    const parent = chart.canvas.parentElement;
    if (!parent) return;

    const element = document.createElement('div');
    element.style.width = '100%';
    element.style.position = 'absolute';
    element.style.top = '0px';
    element.style.bottom = '0px';
    element.style.borderRadius = '8px';

    parent.appendChild(element);


    // Initialize Google Map
    const map = new google.maps.Map(element, {
      zoom: 2,
      center: { lat: 0, lng: 0 },
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      disableDefaultUI: true,
      styles: light
    });

    // Store map instance
    this.map = map;
  }

  draw() {
    if (!this.map) return;

    this.map.getDiv().style.top = this.chart.chartArea.top + "px";

    const dataset = this.chart.data.datasets[0] as MapChartDataset;
    const options = this.chart.options as MapChartOptions;
    const bounds = new google.maps.LatLngBounds();

    const bgColor = options.backgroundColor || Chart.defaults.backgroundColor.toString() || "#9BD0F5";
    const borderColor = options.borderColor || Chart.defaults.borderColor.toString() || "#36A2EB";

    // Clear existing markers
    this.markers.forEach((marker: google.maps.Marker) => {
      marker.setMap(null);
    });

    this.markers.clear();

    const labels = (this.chart.data.labels || []) as string[];
    // Add new point markers
    const markers = dataset.data.filter(a => a.type === "point").map((point: PointDataPoint, index: number) => {
      const position = new google.maps.LatLng(point.lat, point.lng);
      bounds.extend(position);

      const marker = new google.maps.Marker({
        position,
        map: this.map,
        title: labels[index],
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: dataset.backgroundColor || bgColor,
          strokeColor: dataset.borderColor || borderColor,
          fillOpacity: 0.7,
          strokeWeight: 1
        }
      });

      this.markers.set(index, marker);
      return marker;
    });

    // Add a marker clusterer to manage the markers.
    new MarkerClusterer({ markers, map: this.map });

    dataset.data.filter(a => a.type === "line").forEach((point: LineDataPoint) => {
      point.points.forEach(({ lat, lng }: { lat: number; lng: number; }) => {
        const position = new google.maps.LatLng(lat, lng);
        bounds.extend(position);
      });

      const flightPath = new google.maps.Polyline({
        path: point.points,
        geodesic: true,
        strokeColor: dataset.borderColor || borderColor,
        strokeOpacity: 1.0,
        strokeWeight: 2,
      });

      flightPath.setMap(this.map);
    });


    dataset.data.filter(a => a.type === "polygon").forEach((point: PolygonDataPoint) => {
      point.points.forEach(({ lat, lng }: { lat: number; lng: number; }) => {
        const position = new google.maps.LatLng(lat, lng);
        bounds.extend(position);
      });

      const flightPath = new google.maps.Polygon({
        paths: point.points,

        fillColor: dataset.backgroundColor || bgColor,
        strokeColor: dataset.borderColor || borderColor,
        fillOpacity: 0.7,
        strokeWeight: 1
      });

      flightPath.setMap(this.map);
    });

    // Fit bounds
    this.map.fitBounds(bounds);
  }

};
