import '../src/style.css';
import { MapController, MapElement } from '../src/index.js';
import 'chart.js/auto';
import { Chart } from 'chart.js';

Chart.register(MapController, MapElement);

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {

  // Create and setup canvas
  const canvas = document.createElement('canvas');
  canvas.id = 'mapChart';
  document.querySelector<HTMLDivElement>('#app')!.innerHTML = '';
  document.querySelector<HTMLDivElement>('#app')!.appendChild(canvas);

  // Load Google Maps API
  const script = document.createElement('script');
  const API_KEY = "HERE_YOUR_API_KEY";
  script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&apiOptions=MCYJ5E517XR2JC`;
  script.async = true;
  script.defer = true;

  script.onload = () => {
    // Sample data
    const data = {
      datasets: [{
        data: [
          { type: "point", lat: 40.7128, lng: -74.0060, label: 'New York', color: '#FF0000' },
          { type: "point", lat: 51.5074, lng: -0.1278, label: 'London', color: '#00FF00' },
          { type: "point", lat: 35.6762, lng: 139.6503, label: 'Tokyo', color: '#0000FF' },
          { type: "point", lat: 48.8566, lng: 2.3522, label: 'Paris', color: '#FFA500' },
          { type: "point", lat: -33.8688, lng: 151.2093, label: 'Sydney', color: '#800080' },
          {
            type: "line", points: [
              { lat: 37.772, lng: -122.214 },
              { lat: 21.291, lng: -157.821 },
              { lat: -18.142, lng: 178.431 },
              { lat: -27.467, lng: 153.027 }], label: "Test"
          },
          {
            type: "polygon", points: [
              { lat: 25.774, lng: -80.19 },
              { lat: 18.466, lng: -66.118 },
              { lat: 32.321, lng: -64.757 },
            ], label: "Bermuda", color: '#0000FF'
          }
        ]
      }]
    };

    // Create chart
    new Chart(canvas, {
      type: 'map',
      data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
      }
    });
  };

  document.head.appendChild(script);
});