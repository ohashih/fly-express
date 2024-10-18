
import './style.css'
import 'leaflet/dist/leaflet.css'
import 'leaflet-draw/dist/leaflet.draw.css'

import L from 'leaflet'
import 'leaflet-draw/dist/leaflet.draw'

var map = L.map('map', {drawControl: true});
map.setView([33.18, 131.62], 16);

var popupForm = `
  <form
    id="popup-form"
    class="flex flex-col"
    data-lat="@@lat@@"
    data-lng="@@lng@@"
  >
    <h2 class="font-bold mb-3 text-lg">Add a point:</h2>
    <div class="w-full flex justify-between mb-2">
      <label for="point-name">Point Name</label>
      <input type="text" id="point-name" class="border p-1" >
    </div>
    <div class="w-full flex justify-between mb-2">
      <label for="description">Description</label>
      <input type="text" id="description" class="border p-1" >
    </div>
    <div class="w-full flex justify-end">
      <button
        type="submit"
        id="btn-submit"
        class="border rounded p-1 bg-neutral-50"
      >
        保存
      </button>
    </div>
  </form>
`;

// 現在地を取得
navigator.geolocation.getCurrentPosition((position) => {
  map.panTo([position.coords.latitude, position.coords.longitude]);

  fetch('/api/locations').then((response) => {
    return response.json();
  }).then((data) => {
    data.forEach((location) => {
      var marker = L.marker([location.latitude, location.longitude]).addTo(map);
      marker.bindPopup(location.point_name);
    });
  });
});

let drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

map.on('draw:created', (e) => {
  drawnItems.addLayer(e.layer);
});

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

function onFormSubmit(e) {
  e.preventDefault();
  console.log(e);
  fetch('/api/locations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      latitude: e.target.dataset.lat,
      longitude: e.target.dataset.lng,
      point_name: e.target.querySelector('#point-name').value,
      description: e.target.querySelector('#description').value
    })
  }).then((response) => {
    return response.json();
  }).then((data) => {
    var marker = L.marker([data.latitude, data.longitude]).addTo(map);
    marker.bindPopup(data.point_name).openPopup();
  });
}

function onMapClick(e) {
  L.popup({closeButton: true, minWidth: 240})
      .setLatLng(e.latlng)
      .setContent(popupForm.replace('@@lat@@', e.latlng.lat).replace('@@lng@@', e.latlng.lng))
      .openOn(map);

  document.getElementById('popup-form').addEventListener('submit', onFormSubmit);
}

map.on('click', onMapClick);
