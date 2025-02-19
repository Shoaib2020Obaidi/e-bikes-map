// Define the bounding box coordinates
var southWest = L.latLng(51.873963954651714, 7.467278658180352);
var northEast = L.latLng(52.03324735415047, 7.801232683892318);
var bounds = L.latLngBounds(southWest, northEast);

// Initialize the map and set the view to the center of the bounding box
var map = L.map('map', {
    minZoom: 11, // Minimum zoom level
    maxZoom: 18, // Maximum zoom level
}).setView([51.964026649822976, 7.624896635394461], 11);

// Set the maximum bounds for the map
map.setMaxBounds(bounds);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright"></a> Shoaib Obaidullah |'
}).addTo(map);


// Function to load existing GeoJSON data from a file
function loadGeoJSON(filePath, layerGroup) {
    fetch(filePath)
        .then(response => response.json())
        .then(data => {
            // Add the GeoJSON data to the map with the correct styles
            L.geoJSON(data, {
                pointToLayer: function (feature, latlng) {
                    // Apply marker style
                    return L.marker(latlng, {
                        icon: featureStyles.marker.icon
                    });
                },
                style: function (feature) {
                    // Apply styles for lines and polygons
                    switch (feature.geometry.type) {
                        case 'LineString':
                            return featureStyles.polyline;
                        case 'Polygon':
                            return featureStyles.polygon;
                        case 'Rectangle':
                            return featureStyles.rectangle;
                        case 'Circle':
                            return featureStyles.circle;
                        default:
                            return {}; // Default style
                    }
                },
                onEachFeature: function (feature, layer) {
                    // Add each feature to the drawnFeatures layer group
                    layerGroup.addLayer(layer);

                    // Add a popup with the feature type
                    var popupContent = "";
                    switch (feature.geometry.type) {
                        case 'Point':
                            popupContent = "Electric Scooter";
                            break;
                        case 'LineString':
                            popupContent = "Line";
                            break;
                        case 'Polygon':
                            popupContent = "Polygon";
                            break;
                        case 'Rectangle':
                            popupContent = "Rectangle";
                            break;
                        case 'Circle':
                            popupContent = "Circle";
                            break;
                        default:
                            popupContent = "Unknown Feature";
                    }

                    // Bind the popup to the layer
                    layer.bindPopup(popupContent);

                }
            });

            // Reinitialize the edit control after loading features
            map.removeControl(drawControl); // Remove the old control
            drawControl = initializeDrawControl(); // Reinitialize the control
            map.addControl(drawControl); // Add the new control
        })
        .catch(error => console.error(`Error loading ${filePath}:`, error));
}

// Load existing features when the page loads
window.addEventListener('load', function () {
    // Load points
    loadGeoJSON('data/points.json', drawnFeatures);

    // Load lines
    loadGeoJSON('data/lines.json', drawnFeatures);

    // Load polygons
    loadGeoJSON('data/polygons.json', drawnFeatures);
});

// Define the URLs for the four layers
var munsterUrl = 'http://localhost:8081/geoserver/munster/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=munster:munster&maxFeatures=50&outputFormat=application%2Fjson';
var restaurantsUrl = 'http://localhost:8081/geoserver/investor_advisor/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=investor_advisor:restaurants&maxFeatures=50&outputFormat=application%2Fjson';
var cafesUrl = 'http://localhost:8081/geoserver/investor_advisor/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=investor_advisor:cafes&maxFeatures=50&outputFormat=application%2Fjson';

// Define custom icons for each layer
var icons = {
    schools: L.icon({
        iconUrl: 'images/school.png', // Path to school icon
        iconSize: [30, 30], // Icon size
        iconAnchor: [15, 30] // Icon anchor point
    }),
    restaurants: L.icon({
        iconUrl: 'images/menu.png', // Path to restaurant icon
        iconSize: [30, 30], // Icon size
        iconAnchor: [15, 30] // Icon anchor point
    }),
    cafes: L.icon({
        iconUrl: 'images/cafe.png', // Path to cafe icon
        iconSize: [30, 30], // Icon size
        iconAnchor: [15, 30] // Icon anchor point
    })
};

// Function to load and add a WFS layer to the map
function addWfsLayer(url, layerName, icon) {
    fetch(url)
        .then(response => response.json())
        .then(data => {
            L.geoJSON(data, {
                pointToLayer: function (feature, latlng) {
                    // Use a custom icon for points
                    return L.marker(latlng, { icon: icon });
                },
                onEachFeature: function (feature, layer) {
                    // Bind a popup to each feature
                    layer.bindPopup(`<p>${layerName}: ${feature.properties.name || 'Munster City'}</p>`);
                }
            }).addTo(map);
        })
        .catch(error => console.error(`Error loading ${layerName} layer:`, error));
}

// Add the four layers to the map
addWfsLayer(munsterUrl, 'Munster', null); // No custom icon for the munster layer
addWfsLayer(restaurantsUrl, 'Restaurant', icons.restaurants);
addWfsLayer(cafesUrl, 'Cafe', icons.cafes);


// Draw Control Plugin
var drawnFeatures = new L.FeatureGroup();
map.addLayer(drawnFeatures);

// Define styles for features
var featureStyles = {
    marker: {
        icon: L.icon({
            iconUrl: 'images/bike.png', // Path to your marker icon
            iconSize: [60, 60], // Icon size
            iconAnchor: [30, 55] // Icon anchor point
        })
    },
    polyline: {
        color: '#000000', // Line color
        weight: 3 // Line weight
    },
    polygon: {
        color: '#ff0000', // Border color
        fillColor: '#ff0000', // Fill color
        fillOpacity: 0.5 // Fill opacity
    },
    rectangle: {
        color: '#00ff00', // Border color
        fillColor: '#00ff00', // Fill color
        fillOpacity: 0.5 // Fill opacity
    },
    circle: {
        color: '#0000ff', // Border color
        fillColor: '#0000ff', // Fill color
        fillOpacity: 0.5 // Fill opacity
    }
};

// Function to initialize the draw control
function initializeDrawControl() {
    return new L.Control.Draw({
        position: 'topleft',
        edit: {
            featureGroup: drawnFeatures, // Link the edit control to the layer group
            remove: false
        },
        draw: {
            polygon: {
                shapeOptions: featureStyles.polygon
            },
            polyline: {
                shapeOptions: featureStyles.polyline
            },
            circle: {
                shapeOptions: featureStyles.circle
            },
            rectangle: {
                shapeOptions: featureStyles.rectangle
            },
            marker: {
                icon: featureStyles.marker.icon
            }
        }
    });
}

// Initialize the draw control
var drawControl = initializeDrawControl();
map.addControl(drawControl);

// Handle newly created features
map.on("draw:created", function (e) {
    var type = e.layerType;
    var layer = e.layer;
    var geojson = layer.toGeoJSON();
    layer.bindPopup(`<p>${JSON.stringify(geojson)}</p>`);
    drawnFeatures.addLayer(layer);

    saveFeature(type, geojson);
});

// Function to save features
function saveFeature(type, geojson) {
    let filePath = "";
    if (type === "marker") {
        filePath = "data/points.json";
    } else if (type === "polyline") {
        filePath = "data/lines.json";
    } else if (type === "polygon" || type === "rectangle" || type === "circle") {
        filePath = "data/polygons.json";
    }

    if (filePath) {
        fetch("/e-scooter/save.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ filePath: filePath, data: geojson })
        })
            .then(response => response.json())
            .then(data => console.log("Saved Successfully", data))
            .catch(error => console.error("Error Saving File", error));
    }
}




// ArcGIS Online WFS layer
const arcgisWfsUrl  = "https://dservices.arcgis.com/QXyxQ2uhDaxm1exs/arcgis/services/schools_munster/WFSServer?service=WFS&version=2.0.0&request=GetFeature&typeName=schools_munster";

// Custom icon for schools
const schoolIcon = L.icon({
    iconUrl: 'images/school.png', // Path to your school icon
    iconSize: [30, 30], // Icon size
    iconAnchor: [15, 30] // Icon anchor point
});

// Define the coordinate systems
proj4.defs("EPSG:3857", "+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext +no_defs");
proj4.defs("EPSG:4326", "+proj=longlat +datum=WGS84 +no_defs");

// Function to transform coordinates from EPSG:3857 to EPSG:4326
function transformCoordinates(x, y) {
    return proj4("EPSG:3857", "EPSG:4326", [x, y]);
}

// Fetch data from the WFS service
fetch(arcgisWfsUrl )
    .then(response => response.text()) // Parse the response as text (XML)
    .then(data => {
        console.log("WFS Response:", data); // Inspect the WFS response

        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(data, "text/xml"); // Parse the XML
        const schools = xmlDoc.getElementsByTagName("schools_munster:schools_munster"); // Get all school elements

        // Loop through each school and add it to the map
        for (let school of schools) {
            const name = school.getElementsByTagName("schools_munster:NAME")[0].textContent;
            const coords = school.getElementsByTagName("gml:pos")[0].textContent.split(" ");

            console.log("School:", name, "Coordinates (EPSG:3857):", coords); // Inspect the school data

            // Transform coordinates from EPSG:3857 to EPSG:4326
            const [lng, lat] = transformCoordinates(parseFloat(coords[0]), parseFloat(coords[1]));

            console.log("Transformed Coordinates (EPSG:4326):", lat, lng); // Inspect transformed coordinates

            // Add a marker for the school
            L.marker([lat, lng], { icon: schoolIcon })
                .addTo(map)
                .bindPopup(`<b>${name}</b>`);
        }
    })
    .catch(error => {
        console.error("Error fetching WFS data:", error);
    });


