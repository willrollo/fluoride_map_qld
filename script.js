// Initialize the map centered on Queensland
const map = L.map('map').setView([-20.9176, 142.7028], 6);

// Add a base map layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 18,
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

let lgaLayer, electionLayer;

// Function to style LGAs based on fluoride status
function getFluorideStyle(feature) {
  return {
    fillColor: feature.properties.fluoride_status === 'Fluoride free' ? 'gray' : 'blue',
    weight: 1,
    opacity: 1,
    color: 'white',
    fillOpacity: 0.7
  };
}

// Function to style election results based on party preference
function getElectionStyle(feature) {
  const outcome = feature.properties ? feature.properties.outcome : null;
  let color;

  if (outcome && outcome.includes('ALP')) {
    color = 'red';
  } else if (outcome && outcome.includes('LNP')) {
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

// Load and display the LGA fluoride status GeoJSON with a click event
fetch('LGAFluoride.geojson')
  .then(response => response.json())
  .then(data => {
    console.log("LGA Data Loaded:", data);  // Log to confirm data load
    lgaLayer = L.geoJson(data, {
      style: getFluorideStyle,
      onEachFeature: (feature, layer) => {
        layer.bindPopup(`
          <strong>LGA:</strong> ${feature.properties.lga}<br>
          <strong>Fluoride Status:</strong> ${feature.properties.fluoride_status}
        `);
      }
    }).addTo(map);
  });

// Load and display the election results GeoJSON with a click event
fetch('2024QldElection.geojson')
  .then(response => response.json())
  .then(data => {
    console.log("Election Data Loaded:", data);  // Log to confirm data load
    electionLayer = L.geoJson(data, {
      style: getElectionStyle,
      onEachFeature: (feature, layer) => {
        layer.bindPopup(`
          <strong>Electorate:</strong> ${feature.properties.electorate}<br>
          <strong>Outcome:</strong> ${feature.properties.outcome}
        `);
      }
    }).addTo(map);
  });

// Function to toggle layers based on checkbox
function toggleLayer(layer, isChecked) {
  if (isChecked) {
    map.addLayer(layer);
  } else {
    map.removeLayer(layer);
  }
}

// Event listeners for the checkboxes
document.getElementById('toggle-lga').addEventListener('change', (e) => {
  toggleLayer(lgaLayer, e.target.checked);
});

document.getElementById('toggle-election').addEventListener('change', (e) => {
  toggleLayer(electionLayer, e.target.checked);
});