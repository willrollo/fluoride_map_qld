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
// Load and display the LGA fluoride status GeoJSON
fetch('LGAFluoride.geojson')
  .then(response => response.json())
  .then(data => {
    console.log("LGA Data Loaded:", data);  // Log LGA data
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

// Load and display the election results GeoJSON
fetch('2024QldElection.geojson')
  .then(response => response.json())
  .then(data => {
    console.log("Election Data Loaded:", data);  // Log to confirm data load
    electionLayer = L.geoJson(data, {
      style: getElectionStyle,
      onEachFeature: (feature, layer) => {
        console.log("Election Feature Properties:", feature.properties);  // Log properties for debugging
        // Bind popup with electorate and outcome if they exist
        const electorate = feature.properties.electorate;
        const outcome = feature.properties.outcome;
        layer.bindPopup(`
          <strong>Electorate:</strong> ${electorate ? electorate : 'Unknown'}<br>
          <strong>Outcome:</strong> ${outcome ? outcome : 'Unknown'}
        `);
      }
    }).addTo(map);
  });

// Function to combine popup data from both layers on click
map.on('click', (e) => {
  const clickPoint = turf.point([e.latlng.lng, e.latlng.lat]);
  let lgaData = null;
  let electionData = null;

  // Check LGA layer for a matching polygon
  lgaLayer.eachLayer((layer) => {
    if (layer.feature && layer.feature.geometry && turf.booleanPointInPolygon(clickPoint, layer.feature)) {
      lgaData = layer.feature.properties;
      console.log("LGA Match Found:", lgaData);  // Log LGA data
    }
  });

  // Check election layer for a matching polygon
  electionLayer.eachLayer((layer) => {
    if (layer.feature && layer.feature.geometry && turf.booleanPointInPolygon(clickPoint, layer.feature)) {
      electionData = layer.feature.properties;
      console.log("Election Match Found:", electionData);  // Log Election data
    }
  });

  // Display combined popup if data from both layers is available
  if (lgaData && electionData) {
    L.popup()
      .setLatLng(e.latlng)
      .setContent(`
        <strong>Electorate:</strong> ${electionData.electorate}<br>
        <strong>Outcome:</strong> ${electionData.outcome}<br>
        <strong>LGA:</strong> ${lgaData.lga}<br>
        <strong>Fluoride Status:</strong> ${lgaData.fluoride_status}
      `)
      .openOn(map);

  } else if (lgaData) {
    // Display only LGA data if no matching election data
    L.popup()
      .setLatLng(e.latlng)
      .setContent(`
        <strong>LGA:</strong> ${lgaData.lga}<br>
        <strong>Fluoride Status:</strong> ${lgaData.fluoride_status}
      `)
      .openOn(map);

  } else if (electionData) {
    // Display only election data if no matching LGA data
    L.popup()
      .setLatLng(e.latlng)
      .setContent(`
        <strong>Electorate:</strong> ${electionData.electorate}<br>
        <strong>Outcome:</strong> ${electionData.outcome}
      `)
      .openOn(map);
  }
});