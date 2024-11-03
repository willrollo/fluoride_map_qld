// Initialize the map centered on Queensland
const map = L.map('map').setView([-20.9176, 142.7028], 6);

// Add a base map layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 18,
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Function to style LGAs based on fluoride status
function getFluorideStyle(feature) {
  return {
    fillColor: feature.properties.has_flouride ? 'blue' : 'gray',
    weight: 1,
    opacity: 1,
    color: 'white',
    fillOpacity: 0.7
  };
}

// Load and display the LGA fluoride status GeoJSON
fetch('LGAFluoride.geojson')
  .then(response => response.json())
  .then(data => {
    L.geoJson(data, {
      style: getFluorideStyle,
      onEachFeature: (feature, layer) => {
        layer.bindPopup(`<strong>${feature.properties.LGA_Name}</strong><br>Fluoride: ${feature.properties.has_flouride ? 'Yes' : 'No'}`);
      }
    }).addTo(map);
  });

// Function to style election results based on party preference
function getElectionStyle(feature) {
  const outcome = feature.properties.outcome; // Using 'outcome' property for election result
  let color;

  if (outcome.includes('ALP')) {
    color = 'red';
  } else if (outcome.includes('LNP')) {
    color = 'blue';
  } else {
    color = 'gray';
  }

  return {
    fillColor: color,
    weight: 1,
    opacity: 1,
    color: 'white',
    fillOpacity: 0.5
  };
}

// Load and display the election results GeoJSON
fetch('2024QldElection.geojson')
  .then(response => response.json())
  .then(data => {
    L.geoJson(data, {
      style: getElectionStyle,
      onEachFeature: (feature, layer) => {
        layer.bindPopup(`<strong>${feature.properties.electorate}</strong><br>Party Outcome: ${feature.properties.outcome}`);
      }
    }).addTo(map);
  });