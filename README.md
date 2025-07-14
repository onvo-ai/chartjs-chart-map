# Chart.js Map Plugin

A Chart.js plugin that implements a new chart type integrating Google Maps functionality. Supports both client-side and server-side rendering.

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

## Server-Side Rendering

This plugin supports server-side rendering using the node-canvas library. To use it on the server:

1. Install the required dependencies:

```bash
npm install canvas
# or
yarn add canvas
```

2. Use the following approach to render the map on the server:

```javascript
// Server-side rendering example
const { createCanvas } = require('canvas');
const { Chart } = require('chart.js');
const { PolygonController, PolylineController, MarkerController, MapPlugin, MapController } = require('@onvo-ai/chartjs-chart-map');

// Register the controllers and plugin
Chart.register(PolylineController, MarkerController, PolygonController, MapController, MapPlugin);

async function renderChart() {
  // Create a canvas
  const width = 800;
  const height = 600;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Create the chart
  const chart = new Chart(ctx, {
    type: 'map',
    data: {
      datasets: [
        {
          type: "marker",
          label: "Markers",
          data: [
            [37.772, -122.214],
            [21.291, -157.821]
          ]
        }
      ]
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: 'Map Chart'
        }
      }
    }
  });
  
  // The chart will generate a static map URL that you can use
  // Wait for the chart to be updated
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Access the static map URL
  const staticMapUrl = chart.staticMapUrl;
  console.log('Static Map URL:', staticMapUrl);
  
  // You can now use this URL to fetch the image and draw it on your canvas
  // Example:
  const { loadImage } = require('canvas');
  try {
    const img = await loadImage(staticMapUrl);
    
    // Clear the canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw the image with rounded corners
    const radius = 16; // Border radius
    
    // Save context state
    ctx.save();
    
    // Create rounded rectangle path
    ctx.beginPath();
    ctx.moveTo(radius, 0);
    ctx.lineTo(width - radius, 0);
    ctx.arcTo(width, 0, width, radius, radius);
    ctx.lineTo(width, height - radius);
    ctx.arcTo(width, height, width - radius, height, radius);
    ctx.lineTo(radius, height);
    ctx.arcTo(0, height, 0, height - radius, radius);
    ctx.lineTo(0, radius);
    ctx.arcTo(0, 0, radius, 0, radius);
    ctx.closePath();
    
    // Clip to the rounded rectangle
    ctx.clip();
    
    // Draw the image
    ctx.drawImage(img, 0, 0, width, height);
    
    // Restore context
    ctx.restore();
    
    // Optional: Draw a border
    ctx.beginPath();
    ctx.moveTo(radius, 0);
    ctx.lineTo(width - radius, 0);
    ctx.arcTo(width, 0, width, radius, radius);
    ctx.lineTo(width, height - radius);
    ctx.arcTo(width, height, width - radius, height, radius);
    ctx.lineTo(radius, height);
    ctx.arcTo(0, height, 0, height - radius, radius);
    ctx.lineTo(0, radius);
    ctx.arcTo(0, 0, radius, 0, radius);
    ctx.closePath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#e0e0e0';
    ctx.stroke();
    
    // Save the canvas to a file or return it as a buffer
    const buffer = canvas.toBuffer('image/png');
    // e.g., fs.writeFileSync('map.png', buffer);
    return buffer;
  } catch (err) {
    console.error('Error rendering map:', err);
    return null;
  }
}

renderChart().then(buffer => {
  // Use the buffer as needed
});
```

This approach allows you to generate static map images on the server using the Google Maps Static API.