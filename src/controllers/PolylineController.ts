import {
  DatasetController,
  Chart,
  UpdateMode
} from 'chart.js';
import simplify from 'simplify-js';
import { BACKGROUND_COLORS, BORDER_COLORS, MapChartLineDataset } from '../types';

type GooglePolyline = typeof google extends 'undefined' ? any : google.maps.Polyline;

const isGoogleMapsAvailable = (): boolean =>
    typeof window !== 'undefined' && !!window.google && !!window.google.maps;

export class PolylineController extends DatasetController {
  static id = 'polyline';

  static defaults = {
    dataElementType: 'polyline',
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

  polyline: GooglePolyline | null = null;

  constructor(chart: Chart, datasetIndex: number) {
    super(chart, datasetIndex);
  }

  drawLine(point: MapChartLineDataset) {
    const chartMap = (this.chart as any).map;
    if (!isGoogleMapsAvailable() || !chartMap) return;

    var bounds = new window.google.maps.LatLngBounds();

    let points = [] as [number, number][]
    if (point.data.length > 100) {
      points = simplify(point.data.map(a => ({ x: a[0], y: a[1] })), 0.1).map(a => ([a.x, a.y]));
    } else {
      points = point.data;
    }

    points = points.map(a => [parseFloat((a[0]).toFixed(6)), parseFloat((a[1]).toFixed(6))]);

    const path = points.map(([lat, lng]: [number, number]) => {
      const position = new window.google.maps.LatLng(lat, lng);
      bounds.extend(position);
      return position;
    });

    this.polyline = new window.google.maps.Polyline({
      path: path,
      geodesic: true,
      strokeColor: point.borderColor,
      strokeOpacity: 1,
      strokeWeight: point.borderWidth || 2,
    }) as GooglePolyline;

    this.polyline!.addListener("click", () => {
      if (!isGoogleMapsAvailable() || !chartMap) return;
      const infowindow = new window.google.maps.InfoWindow({
        content: `<h3 style="font-size: 16px; font-weight: bold; margin-top: 0px; margin-bottom: 0px">${point.label}</h3>`,
        ariaLabel: point.label,
      });
      infowindow.setPosition(bounds.getCenter());
      infowindow.open({
        map: chartMap,
      });
    });

    (this.polyline as google.maps.Polyline).setMap(chartMap);
  }

  getDataset() {
    let data = this.chart.data.datasets[this.index] as any;
    return {
      ...data,
      backgroundColor: data.backgroundColor || BACKGROUND_COLORS[this.index % BACKGROUND_COLORS.length],
      borderColor: data.borderColor || BORDER_COLORS[this.index % BORDER_COLORS.length],
    }
  }

  update(mode: UpdateMode) {
    const meta = this._cachedMeta;
    const dataset = this.getDataset() as MapChartLineDataset;
    const chartMap = (this.chart as any).map;

    if (!isGoogleMapsAvailable() || !chartMap) {
      if (mode === "hide" || mode === "reset" || (meta && meta.hidden)) {
        if (this.polyline) {
          this.polyline = null;
        }
      }
      return;
    }

    if ((mode === "show" || mode === "default") && !this.polyline && meta && !meta.hidden) {
      this.drawLine(dataset);
    } else if ((mode === "hide" || mode === "reset" || (meta && meta.hidden)) && this.polyline) {
      (this.polyline as google.maps.Polyline).setMap(null);
      this.polyline = null;
    }
  }
};
