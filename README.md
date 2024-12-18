# Chart.js Map Plugin

A Chart.js plugin that implements a new chart type integrating Google Maps functionality.

## Installation

```bash
npm install chart.js @types/google.maps
```

## Usage

1. Import the plugin and register it with Chart.js:

```typescript
import { Chart } from 'chart.js';
import './plugins/chartjs-map';
```

2. Load Google Maps API with your API key:

```html
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY"></script>
```

3. Create a new chart with type 'map':

```typescript
new Chart(canvas, {
  type: 'map',
  data: {
    datasets: [{
      data: [
        { lat: 40.7128, lng: -74.0060, label: 'New York' },
        { lat: 51.5074, lng: -0.1278, label: 'London' }
      ]
    }]
  },
  options: {
    responsive: true,
    plugins: {
      tooltip: {
        enabled: true
      }
    },
    markerStyle: {
      defaultColor: '#FF0000',
      defaultSize: 8,
      shape: 'circle'
    }
  }
});
```

## Configuration Options

### Data Point Properties

- `lat` (required): Latitude coordinate
- `lng` (required): Longitude coordinate
- `label` (optional): Marker label
- `color` (optional): Marker color
- `size` (optional): Marker size

### Chart Options

- `responsive`: Enable responsive mode
- `maintainAspectRatio`: Maintain aspect ratio
- `markerStyle`:
  - `defaultColor`: Default marker color
  - `defaultSize`: Default marker size
  - `shape`: Marker shape ('circle', 'square', 'pin')

### Plugin Options

- `tooltip`: Standard Chart.js tooltip options
- `legend`: Standard Chart.js legend options

## Features

- Google Maps integration
- Custom markers with configurable styles
- Automatic bounds fitting
- Responsive design
- Interactive tooltips
- Legend support
- Window resize handling

## TypeScript Support

Type definitions are included in the plugin. Import the types:

```typescript
import { MapDataPoint, MapChartOptions } from './plugins/chartjs-map';
```