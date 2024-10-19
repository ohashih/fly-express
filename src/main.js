import "./style.css";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";

import L from "leaflet";
import "leaflet-draw/dist/leaflet.draw";

import icon from "leaflet/dist/images/marker-icon.png";
import iconRetina from "leaflet/dist/images/marker-icon-2x.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

var map = L.map("map", { drawControl: true });

// デフォルトのアイコンを変更
var DefaultIcon = L.icon({
  iconUrl: icon,
  iconRetinaUrl: iconRetina,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// ポップアップフォーム
const popupForm = `
  <form
    id="popup-form"
    class="flex flex-col"
    data-lat="@@lat@@"
    data-lng="@@lng@@"
  >
    <h2 class="font-bold mb-3 text-lg">Add a point:</h2>
    <div class="w-full flex justify-between mb-2">
      <label for="point-name">Point Name</label>
      <input type="text" id="point-name" name="point-name" class="border p-1" >
    </div>
    <div class="w-full flex justify-between mb-2">
      <label for="description">Description</label>
      <input type="text" id="description" name="description" class="border p-1" >
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

const init = async () => {
  // 地図の初期位置の設定
  map.setView([33.18, 131.62], 16);
  navigator.geolocation.getCurrentPosition(
    (position) => {
      map.panTo([position.coords.latitude, position.coords.longitude]);
    },
    (error) => {
      console.error("Geolocation error", error);
    },
  );
  // 描画した図形を格納するレイヤー
  const drawnItems = new L.FeatureGroup();
  map.addLayer(drawnItems);
  map.on("draw:created", (e) => {
    drawnItems.addLayer(e.layer);
  });
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);

  await loadMarkers();
};

const loadMarkers = async () => {
  const response = await fetch("/api/locations");
  const locations = await response.json();
  if (locations.length === 0) {
    console.log("NO locations");
    return;
  }
  locations.forEach((location) => {
    const marker = L.marker([location.latitude, location.longitude]).addTo(map);
    marker.bindPopup(location.point_name);
  });
};

// フォーム送信時の処理
const onFormSubmit = async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = {
    latitude: e.target.dataset.lat,
    longitude: e.target.dataset.lng,
    point_name: formData.get("point-name"),
    description: formData.get("description"),
  };

  if (data.point_name === "" || data.description === "") {
    alert("Please enter a point name");
    return;
  }
  try {
    const response = await fetch("/api/locations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to save location ${response.status}`);
    }
    const location = await response.json();
    const marker = L.marker([location.latitude, location.longitude]).addTo(map);
    marker.bindPopup(location.point_name).openPopup();
  } catch (error) {
    console.error("submitting from:", error);
  }
};

// マップクリック時の処理
const onMapClick = (e) => {
  L.popup({ closeButton: true, minWidth: 240 })
    .setLatLng(e.latlng)
    .setContent(
      popupForm
        .replace(/@@lat@@/g, e.latlng.lat)
        .replace(/@@lng@@/g, e.latlng.lng),
    )
    .openOn(map);

  document
    .getElementById("popup-form")
    .addEventListener("submit", onFormSubmit);
};

init();
map.on("click", onMapClick);
