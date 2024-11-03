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
  const outcome = feature.properties.outcome;
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

// Load and display the LGA fluoride status GeoJSON
fetch('LGAFluoride.geojson')
  .then(response => response.json())
  .then(data => {
    lgaLayer = L.geoJson(data, {
      style: getFluorideStyle,
      onEachFeature: (feature, layer) => {
        layer.bindPopup(`<strong>LGA:</strong> ${feature.properties.lga}<br><strong>Fluoride Status:</strong> ${feature.properties.fluoride_status}`);
      }
    }).addTo(map);
  });

// Load and display the election results GeoJSON
fetch('2024QldElection.geojson')
  .then(response => response.json())
  .then(data => {
    electionLayer = L.geoJson(data, {
      style: getElectionStyle,
      onEachFeature: (feature, layer) => {
        layer.bindPopup(`<strong>Electorate:</strong> ${feature.properties.electorate}<br><strong>Outcome:</strong> ${feature.properties.outcome}`);
      }
    }).addTo(map);
  });

// Function to combine popup data from both layers on click
map.on('click', (e) => {
  // Variables to store data for the clicked area
  let lgaData = null;
  let electionData = null;

  // Find LGA and election data for the clicked location
  map.eachLayer((layer) => {
    if (layer.feature && layer.getBounds().contains(e.latlng)) {
      if (layer.feature.properties.lga) {
        lgaData = layer.feature.properties;
      } else if (layer.feature.properties.electorate) {
        electionData = layer.feature.properties;
      }
    }
  });

  // Display combined popup if data from both layers is available
  if (lgaData && electionData) {
    L.popup()
      .setLatLng(e.latlng)
      .setContent(
        `<strong>Electorate:</strong> ${electionData.electorate}<br>
         <strong>Outcome:</strong> ${electionData.outcome}<br>
         <strong>LGA:</strong> ${lgaData.lga}<br>
         <strong>Fluoride Status:</strong> ${lgaData.fluoride_status}`
      )
      .openOn(map);
  }
});