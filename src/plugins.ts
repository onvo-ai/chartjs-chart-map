// import { MarkerClusterer } from "@googlemaps/markerclusterer";
import { light, dark } from './themes';
import { MapChartOptions } from './types';

/**
 * Converts RGB, RGBA, or hex color to hex format
 * @param color - Color in rgb(), rgba(), or hex format
 * @returns Hex color string
 */
function convertColorToHex(color: string): string {
    if (!color) return color;

    // Check if it's already a hex color
    if (color.startsWith('#') || /^[0-9A-Fa-f]{6}$/.test(color)) {
        return color;
    }

    // Check for rgb() format
    const rgbMatch = color.match(/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/);
    if (rgbMatch) {
        const r = parseInt(rgbMatch[1], 10);
        const g = parseInt(rgbMatch[2], 10);
        const b = parseInt(rgbMatch[3], 10);
        return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    }

    // Check for rgba() format
    const rgbaMatch = color.match(/^rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)$/);
    if (rgbaMatch) {
        const r = parseInt(rgbaMatch[1], 10);
        const g = parseInt(rgbaMatch[2], 10);
        const b = parseInt(rgbaMatch[3], 10);
        // For static maps, we ignore the alpha channel as it doesn't support transparency
        return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    }

    // Return original if not matching any format
    return color;
}

// Helper to check if running in a browser environment with Google Maps API loaded
const isGoogleMapsAvailable = (): boolean =>
    typeof window !== 'undefined' && !!window.google && !!window.google.maps;

// Convert Google Maps style array to Static Maps style parameter
const convertStyleToStaticMapFormat = (styles: any[]): string => {
    return styles.map(style => {
        let feature = style.featureType || 'all';
        let element = style.elementType || 'all';
        let rules = style.stylers.map((rule: any) => {
            const key = Object.keys(rule)[0];
            const value = rule[key];

            // Handle visibility special case
            if (key === 'visibility') {
                return `visibility:${value}`;
            }
            // Handle color with proper format
            else if (key === 'color') {
                // Remove # from hex color
                const colorValue = value.startsWith('#') ? value.substring(1) : value;
                return `color:0x${colorValue}`;
            }
            return `${key}:${value}`;
        }).join('|');

        return `style=feature:${feature}|element:${element}|${rules}`;
    }).join('&');
};

export const MapPlugin = {
    id: 'map',
    beforeInit: (chart: any) => {
        // Check if we're in a browser environment
        const isBrowser = typeof window !== 'undefined';
        const parent = isBrowser ? chart.canvas.parentElement : null;
        const options = chart.options as MapChartOptions;

        // If Google Maps API is available, use interactive map
        if (isGoogleMapsAvailable() && parent) {
            const element = document.createElement('div');
            element.style.position = 'absolute';
            element.style.left = '0px';
            element.style.top = '0px';
            element.style.width = '100%';
            element.style.height = '100%';
            element.style.borderRadius = '8px';

            parent.appendChild(element);

            // Initialize Google Map
            const map = new window.google.maps.Map(element, {
                zoom: 2,
                center: { lat: 0, lng: 0 },
                mapTypeId: window.google.maps.MapTypeId.ROADMAP,
                disableDefaultUI: true,
                styles: options.theme === "light" ? light : dark,
            });

            chart.map = map;
        }
        // If we're not in a browser or Google Maps API is not available (server-side)
        // We'll create a static map in the afterUpdate hook
        else {
            chart.useStaticMap = true;
        }
    },

    // Create a function to render static map image
    renderStaticMap: (chart: any, bounds: any, markers: any[], polylines: any[], polygons: any[]) => {
        if (!chart.useStaticMap) return;

        // Get the API key from chart options or use a default
        const options = chart.options as MapChartOptions;
        const API_KEY = "AIzaSyDqUZ6lVdQA-9iBpfI1q4mSCH9seg2E-7M"; // TODO: Use process env variable for self hosting

        // Calculate map dimensions based on chart area
        let width = Math.round(chart.chartArea.width) || 640;
        let height = Math.round(chart.chartArea.height) || 480;

        // Google Maps Static API has a maximum size limit of 640x640
        // Scale the largest dimension to 640 and maintain aspect ratio
        if (width > 640 || height > 640) {
            const aspectRatio = width / height;
            if (width >= height) {
                width = 640;
                height = Math.round(width / aspectRatio);
            } else {
                height = 640;
                width = Math.round(height * aspectRatio);
            }
        }

        // Start building the static map URL
        let staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?size=${width}x${height}`;

        // Add map styling based on theme
        const mapStyles = options.theme === "light" ? light : dark;
        const stylesParam = convertStyleToStaticMapFormat(mapStyles);
        staticMapUrl += `&${stylesParam}`;

        // Add markers
        markers.forEach((marker) => {
            // Validate coordinates
            if (isNaN(marker.lat) || isNaN(marker.lng) ||
                marker.lat < -90 || marker.lat > 90 ||
                marker.lng < -180 || marker.lng > 180) {
                console.warn('Invalid marker coordinates:', marker);
                return; // Skip invalid markers
            }

            const color = marker.color || 'red';
            // Remove # from hex color if present
            const colorValue = color.startsWith('#') ? color.substring(1) : color;

            // Format coordinates with fixed precision to avoid floating point issues
            const lat = parseFloat(marker.lat.toFixed(6));
            const lng = parseFloat(marker.lng.toFixed(6));

            staticMapUrl += `&markers=color:0x${colorValue}|${lat},${lng}`;
        });

        // Add polylines
        polylines.forEach(polyline => {
            let color = polyline.color || 'blue';
            // Remove # from hex color if present
            color = color.startsWith('#') ? color.substring(1) : color;

            const weight = polyline.weight || 5;

            // Format each point with fixed precision
            const path = polyline.points.map((point: [number, number]) => {
                const lat = parseFloat(point[0].toFixed(6));
                const lng = parseFloat(point[1].toFixed(6));
                return `${lat},${lng}`;
            }).join('|');

            // Add encoded polyline path
            if (path) {
                staticMapUrl += `&path=color:0x${color}|weight:${weight}|${path}`;
            }
        });

        // Add polygons
        polygons.forEach(polygon => {

            let fillColor = polygon.fillColor || '00FF00';
            let strokeColor = polygon.strokeColor || '005500';

            // The colors could be rgba() or rgb() as well, if so convert it to hex first
            fillColor = convertColorToHex(fillColor);
            strokeColor = convertColorToHex(strokeColor);

            // Remove # from hex colors if present
            fillColor = fillColor.startsWith('#') ? fillColor.substring(1) : fillColor;
            strokeColor = strokeColor.startsWith('#') ? strokeColor.substring(1) : strokeColor;


            const weight = polygon.weight || 2;

            // Format each point with fixed precision
            const path = polygon.points.map((point: [number, number]) => {
                if (!Array.isArray(point) || point.length < 2) {
                    console.warn('Invalid polygon point:', point);
                    return null;
                }
                const lat = parseFloat(point[0].toFixed(6));
                const lng = parseFloat(point[1].toFixed(6));
                return `${lat},${lng}`;
            })
                .filter((point: any) => point !== null)
                .join('|');

            // Close the polygon by adding the first point again at the end if needed
            let closedPath = path;
            if (polygon.points.length > 0 && path) {
                const firstPoint = polygon.points[0];
                const lastPoint = polygon.points[polygon.points.length - 1];

                // If first and last points are not the same, add first point to close the polygon
                if (firstPoint[0] !== lastPoint[0] || firstPoint[1] !== lastPoint[1]) {
                    const lat = parseFloat(firstPoint[0].toFixed(6));
                    const lng = parseFloat(firstPoint[1].toFixed(6));
                    closedPath += `|${lat},${lng}`;
                }
            }

            // Add encoded polygon path
            if (closedPath) {
                staticMapUrl += `&path=fillcolor:0x${fillColor}80|color:0x${strokeColor}|weight:${weight}|${closedPath}`;
            }
        });

        // Use center parameter but let the API auto-fit the view
        if (bounds && bounds.southwest && bounds.northeast) {
            // Calculate center point
            const centerLat = (bounds.northeast.lat + bounds.southwest.lat) / 2;
            const centerLng = (bounds.northeast.lng + bounds.southwest.lng) / 2;

            // Format coordinates with fixed precision
            const lat = parseFloat(centerLat.toFixed(6));
            const lng = parseFloat(centerLng.toFixed(6));

            staticMapUrl += `&center=${lat},${lng}`;

            // Don't specify zoom to let the API auto-fit based on markers and paths
        }

        // Add API key
        staticMapUrl += `&key=${API_KEY}&scale=2`;

        // Store the URL for later use
        chart.staticMapUrl = staticMapUrl;
    },
    beforeDraw: (chart: any) => {
        // If using interactive Google Map
        if (isGoogleMapsAvailable() && chart.map) {
            chart.map.getDiv().style.top = chart.chartArea.top + "px";
            chart.map.getDiv().style.left = chart.chartArea.left + "px";
            chart.map.getDiv().style.width = chart.chartArea.width + "px";
            chart.map.getDiv().style.height = chart.chartArea.height + "px";
        }
        // If using static map, draw the image
        else if (chart.useStaticMap && chart.staticMapImage && chart.staticMapImage.complete) {
            const ctx = chart.ctx;
            ctx.drawImage(chart.staticMapImage, chart.chartArea.left, chart.chartArea.top, chart.chartArea.width, chart.chartArea.height);
        }
    },
    afterUpdate: (chart: any) => {
        // Process data for both interactive and static maps
        const staticMarkers: any[] = [];
        const staticPolylines: any[] = [];
        const staticPolygons: any[] = [];
        let boundsData = {
            northeast: { lat: -90, lng: -180 },
            southwest: { lat: 90, lng: 180 }
        };

        // Process datasets to collect points for bounds calculation
        const hidden = chart._metasets.map((a: any) => a.hidden);
        chart.data.datasets.filter((_: any, i: number) => !hidden[i]).forEach((dataset: any) => {
            if (dataset.type === "marker") {
                const points = Array.isArray(dataset.data[0])
                    ? dataset.data
                    : [dataset.data];

                points.forEach((point: any) => {
                    const lat = point[0];
                    const lng = point[1];

                    // Update bounds
                    boundsData.northeast.lat = Math.max(boundsData.northeast.lat, lat);
                    boundsData.northeast.lng = Math.max(boundsData.northeast.lng, lng);
                    boundsData.southwest.lat = Math.min(boundsData.southwest.lat, lat);
                    boundsData.southwest.lng = Math.min(boundsData.southwest.lng, lng);

                    // Add to static markers
                    staticMarkers.push({
                        lat,
                        lng,
                        color: dataset.borderColor || dataset.backgroundColor
                    });

                    // If using interactive map
                    if (isGoogleMapsAvailable() && chart.map) {
                        const position = new window.google.maps.LatLng(lat, lng);
                        const bounds = new window.google.maps.LatLngBounds();
                        bounds.extend(position);
                    }
                });
            } else if (dataset.type === "polyline") {
                // Add to static polylines
                staticPolylines.push({
                    points: dataset.data,
                    color: dataset.borderColor,
                    weight: dataset.borderWidth || 2
                });

                // Process points for bounds
                dataset.data.forEach(([lat, lng]: [number, number]) => {
                    // Update bounds
                    boundsData.northeast.lat = Math.max(boundsData.northeast.lat, lat);
                    boundsData.northeast.lng = Math.max(boundsData.northeast.lng, lng);
                    boundsData.southwest.lat = Math.min(boundsData.southwest.lat, lat);
                    boundsData.southwest.lng = Math.min(boundsData.southwest.lng, lng);

                    // If using interactive map
                    if (isGoogleMapsAvailable() && chart.map) {
                        const position = new window.google.maps.LatLng(lat, lng);
                        const bounds = new window.google.maps.LatLngBounds();
                        bounds.extend(position);
                    }
                });
            } else if (dataset.type === "polygon") {
                // Add to static polygons
                staticPolygons.push({
                    points: dataset.data,
                    fillColor: dataset.backgroundColor,
                    strokeColor: dataset.borderColor,
                    weight: dataset.borderWidth || 2
                });

                // Process points for bounds
                dataset.data.forEach((point: any) => {
                    if (Array.isArray(point)) {
                        const lat = point[0];
                        const lng = point[1];

                        // Update bounds
                        boundsData.northeast.lat = Math.max(boundsData.northeast.lat, lat);
                        boundsData.northeast.lng = Math.max(boundsData.northeast.lng, lng);
                        boundsData.southwest.lat = Math.min(boundsData.southwest.lat, lat);
                        boundsData.southwest.lng = Math.min(boundsData.southwest.lng, lng);

                        // If using interactive map
                        if (isGoogleMapsAvailable() && chart.map) {
                            const position = new window.google.maps.LatLng(lat, lng);
                            const bounds = new window.google.maps.LatLngBounds();
                            bounds.extend(position);
                        }
                    }
                });
            }
        });

        // For interactive map, fit bounds
        if (isGoogleMapsAvailable() && chart.map) {
            const bounds = new window.google.maps.LatLngBounds(
                new window.google.maps.LatLng(boundsData.southwest.lat, boundsData.southwest.lng),
                new window.google.maps.LatLng(boundsData.northeast.lat, boundsData.northeast.lng)
            );

            // Fit bounds if there are any points to fit
            if (staticMarkers.length > 0 || staticPolylines.length > 0 || staticPolygons.length > 0) {
                chart.map.fitBounds(bounds);
            }
        }
        // For static map, render it
        else if (chart.useStaticMap) {
            // Add some padding to bounds
            const latPadding = (boundsData.northeast.lat - boundsData.southwest.lat) * 0.1;
            const lngPadding = (boundsData.northeast.lng - boundsData.southwest.lng) * 0.1;

            boundsData.northeast.lat += latPadding;
            boundsData.northeast.lng += lngPadding;
            boundsData.southwest.lat -= latPadding;
            boundsData.southwest.lng -= lngPadding;

            // Render the static map
            MapPlugin.renderStaticMap(chart, boundsData, staticMarkers, staticPolylines, staticPolygons);
        }
    },
    defaults: {
        provider: 'google',
        apiKey: 'AIzaSyDqUZ6lVdQA-9iBpfI1q4mSCH9seg2E-7M' // Default API key
    }
}