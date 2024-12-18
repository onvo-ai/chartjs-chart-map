import {
  DatasetController,
  ChartDataset,
  Chart
} from 'chart.js';
import { MarkerClusterer } from "@googlemaps/markerclusterer";
// import { dark, light } from './themes';

export interface PointDataPoint {
  type: "point"
  lat: number;
  lng: number;
  label?: string;
  color?: string;
  size?: number;
}
export interface LineDataPoint {
  type: "line"
  points: {
    lat: number;
    lng: number;
  }[];
  label?: string;
  color?: string;
}
export interface PolygonDataPoint {
  type: "polygon"
  points: {
    lat: number;
    lng: number;
  }[];
  label?: string;
  color?: string;
}

export type MapDataPoint = PointDataPoint | LineDataPoint | PolygonDataPoint;

export interface MapChartDataset extends ChartDataset<'map', MapDataPoint[]> {
  data: MapDataPoint[];
}

export interface MapChartOptions {
  zoom?: number;
  center?: google.maps.LatLngLiteral;
  markerStyle?: {
    defaultColor: string;
    defaultSize: number;
    shape: 'circle' | 'square' | 'pin';
  };
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
export default class MapController extends DatasetController {
  static id = 'map';

  static defaults = {
    dataElementType: 'map',
  };

  static overrides = {
    interaction: {
      mode: 'nearest',
      intersect: true
    },
    legend: {
      display: false
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

    // Initialize Google Map
    const map = new google.maps.Map(parent, {
      zoom: 2,
      center: { lat: 0, lng: 0 },
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      disableDefaultUI: true,
      // styles: dark
    });

    // Store map instance
    this.map = map;
  }

  draw() {
    if (!this.map) return;
    const dataset = this.chart.data.datasets[0] as MapChartDataset;
    const options = this.chart.options as MapChartOptions;
    const bounds = new google.maps.LatLngBounds();

    // Clear existing markers
    this.markers.forEach((marker: google.maps.Marker) => {
      marker.setMap(null);
    });

    this.markers.clear();

    // Add new point markers
    const markers = dataset.data.filter(a => a.type === "point").map((point: PointDataPoint, index: number) => {
      const position = new google.maps.LatLng(point.lat, point.lng);
      bounds.extend(position);

      const marker = new google.maps.Marker({
        position,
        map: this.map,
        title: point.label,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: point.size || options.markerStyle?.defaultSize || 8,
          fillColor: (point.color || options.markerStyle?.defaultColor || '#FF0000'),
          strokeColor: point.color || options.markerStyle?.defaultColor || '#FF0000',
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
        strokeColor: "#FF0000",
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

        fillColor: (point.color || options.markerStyle?.defaultColor || '#FF0000'),
        strokeColor: point.color || options.markerStyle?.defaultColor || '#FF0000',
        fillOpacity: 0.7,
        strokeWeight: 1
      });

      flightPath.setMap(this.map);
    });

    // Fit bounds
    this.map.fitBounds(bounds);
  }

};
