// busDetails.js  (must use ES Modules)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getDatabase, ref, get, onValue } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

// ---- 1. Firebase config ----
const firebaseConfig = {
  apiKey: "AIzaSyB5TbdjcN6DkwsD9Xr34XJ2Nx6HWx2Q8i0",
  authDomain: "bus-tracking-a0d37.firebaseapp.com",
  databaseURL: "https://bus-tracking-a0d37-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "bus-tracking-a0d37",
  storageBucket: "bus-tracking-a0d37.firebasestorage.app",
  messagingSenderId: "1098696368650",
  appId: "1:1098696368650:web:87d41cea634d40166b75f3"
};

// ---- 2. Init Firebase ----
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ---- 3. Load all buses ----
export async function bootstrapFindBus() {
  const busesRef = ref(db, "buses");

  try {
    const snap = await get(busesRef);

    if (!snap.exists()) {
      alert("No buses found in database.");
      return;
    }

    const buses = snap.val();
    renderBusList(buses);

  } catch (err) {
    console.error("Error loading buses:", err);
    alert("Failed to load buses.");
  }
}

// ---- 4. Render buses into HTML list ----
function renderBusList(buses) {
  const list = document.getElementById("busesList");
  list.innerHTML = "";

  Object.keys(buses).forEach(id => {
    const b = buses[id];

    const item = document.createElement("div");
    item.className = "item";

    item.innerHTML = `
      <div class="title">${b.name} (${id})</div>
      <div class="small">${b.route} | ${b.company} | ${b.type}</div>
      <button class="btn" onclick="window.location='trackbus.html?bus=${id}'">Track</button>
    `;

    list.appendChild(item);
  });
}


// ---- 5. LOAD TRACK ----
export async function loadTrackFor(busId) {
  const panel = document.getElementById("trackInfo");
  panel.innerHTML = "Loading...";

  try {
    const trackRef = ref(db, `tracks/${busId}`);
    const snap = await get(trackRef);

    if (!snap.exists()) {
      panel.innerHTML = `<span style="color:red">Track not found for ${busId}</span>`;
      return;
    }

    const data = snap.val();

    panel.innerHTML = `
      <div><b>Bus:</b> ${busId}</div>
      <div><b>Status:</b> ${data.status}</div>
      <div><b>Last Location:</b> ${data.lat}, ${data.lng}</div>
      <div><b>Last Updated:</b> ${data.timestamp}</div>
    `;

  } catch (err) {
    console.error(err);
    panel.innerHTML = "Error loading track.";
  }
}


// ---- 6. Auto-track when ?bus=ID ----
export function bootstrapTrack() {
  const bus = new URL(window.location.href).searchParams.get("bus");
  if (bus) loadTrackFor(bus);
}
