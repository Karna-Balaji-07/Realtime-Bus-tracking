// assets/home.js
// Frontend behaviour: map, geocoding via Nominatim, slideshow, small UX helpers.
// Requires: Leaflet loaded in the page.

const yearSpan = document.getElementById("year");
if (yearSpan) yearSpan.textContent = new Date().getFullYear();

// Profile: if name stored in localStorage, show it
const profileNameEl = document.getElementById("profileName");
const profilePicEl = document.getElementById("profilePic");
const storedName = localStorage.getItem("mb_username") || "Guest User";
profileNameEl.textContent = storedName;

// If a profile image URL stored, use it
const storedPic = localStorage.getItem("mb_userpic");
if (storedPic) profilePicEl.src = storedPic;

// -------- Leaflet map (center on India) ----------
const map = L.map("map", { zoomControl: true }).setView([22.5937, 78.9629], 5);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: "© OpenStreetMap",
}).addTo(map);

// polyline layer and moving marker variables
let routeLine = null;
let movingMarker = null;
let routeCoords = [];

// helper: geocode a place string using Nominatim
async function geocode(q) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    q
  )}&limit=1`;
  const res = await fetch(url, { headers: { "Accept-Language": "en" } });
  if (!res.ok) throw new Error("Geocoding failed");
  const data = await res.json();
  if (!data || data.length === 0) return null;
  return {
    lat: parseFloat(data[0].lat),
    lon: parseFloat(data[0].lon),
    display_name: data[0].display_name,
  };
}

// animate a marker along array of latlngs (simple linear movement)
function animateAlong(coords, speedMsPerMeter = 0.04) {
  if (!coords || coords.length < 2) return;
  // remove old marker
  if (movingMarker) map.removeLayer(movingMarker);
  let idx = 0;
  const total = coords.length;
  movingMarker = L.circleMarker(coords[0], {
    radius: 8,
    color: "#2bd98b",
    fillColor: "#2bd98b",
    fillOpacity: 1,
  }).addTo(map);

  // create an interpolated stepper
  function step() {
    if (idx >= total - 1) {
      // loop the animation to simulate continuous live bus
      idx = 0;
    }
    const p1 = coords[idx];
    const p2 = coords[idx + 1];
    // distance in meters using haversine approximated by Leaflet
    const dist = map.distance(p1, p2);
    // steps proportional to distance
    const steps = Math.max(10, Math.round(dist / 6));
    let stepCount = 0;
    const latStep = (p2[0] - p1[0]) / steps;
    const lonStep = (p2[1] - p1[1]) / steps;

    const moveInterval = setInterval(() => {
      stepCount++;
      const lat = p1[0] + latStep * stepCount;
      const lon = p1[1] + lonStep * stepCount;
      movingMarker.setLatLng([lat, lon]);
      if (stepCount >= steps) {
        clearInterval(moveInterval);
        idx++;
        setTimeout(step, 200); // short pause between segments
      }
    }, Math.max(20, Math.round(dist * speedMsPerMeter))); // adjust speed
  }
  step();
}

// search button action: geocode start and dest, show route and perform animation
document.getElementById("searchBtn").addEventListener("click", async () => {
  const startQ = document.getElementById("startInput").value.trim();
  const destQ = document.getElementById("destInput").value.trim();
  if (!startQ || !destQ) {
    alert("Enter starting place and destination.");
    return;
  }

  try {
    // show temporary UI feedback
    document.getElementById("searchBtn").textContent = "Searching...";
    const [sres, dres] = await Promise.all([geocode(startQ), geocode(destQ)]);
    if (!sres || !dres) {
      alert("Could not find one or both places. Try different terms.");
      return;
    }

    // pan to area
    const bounds = L.latLngBounds([
      [sres.lat, sres.lon],
      [dres.lat, dres.lon],
    ]);
    map.fitBounds(bounds.pad(1.2));

    // add markers
    const sm = L.marker([sres.lat, sres.lon])
      .addTo(map)
      .bindPopup(`<b>Start</b><br>${sres.display_name}`)
      .openPopup();
    const dm = L.marker([dres.lat, dres.lon])
      .addTo(map)
      .bindPopup(`<b>Destination</b><br>${dres.display_name}`);

    // build simple straight-line route (you can replace with routing API for real roads)
    const coords = [
      [sres.lat, sres.lon],
      // intermediate midpoint to make route look smoother
      [(sres.lat + dres.lat) / 2 + 0.02, (sres.lon + dres.lon) / 2 - 0.02],
      [dres.lat, dres.lon],
    ];

    // remove old route
    if (routeLine) map.removeLayer(routeLine);

    routeLine = L.polyline(coords, {
      color: "#00a3ff",
      weight: 5,
      opacity: 0.85,
    }).addTo(map);
    routeCoords = coords;

    // start simulated live tracking
    animateAlong(coords);
  } catch (err) {
    console.error(err);
    alert("Search error: " + err.message);
  } finally {
    document.getElementById("searchBtn").textContent = "Search";
  }
});

// clear button
document.getElementById("clearBtn").addEventListener("click", () => {
  document.getElementById("startInput").value = "";
  document.getElementById("destInput").value = "";
  if (routeLine) map.removeLayer(routeLine);
  if (movingMarker) map.removeLayer(movingMarker);
  map.setView([22.5937, 78.9629], 5);
});

// simple slideshow
const slides = document.querySelectorAll("#slideshow img");
let idx = 0;
function showSlide(i) {
  slides.forEach((s, n) => s.classList.toggle("active", n === i));
}
showSlide(0);
setInterval(() => {
  idx = (idx + 1) % slides.length;
  showSlide(idx);
}, 3700);

// small nav interactions
document.getElementById("getStarted").addEventListener("click", () => {
  window.scrollTo({
    top: document.querySelector(".explore").offsetTop - 20,
    behavior: "smooth",
  });
});
document.getElementById("findBusBtn").addEventListener("click", () => {
  window.scrollTo({
    top: document.querySelector(".explore").offsetTop - 20,
    behavior: "smooth",
  });
});
document.getElementById("aboutBtn").addEventListener("click", () => {
  window.scrollTo({
    top: document.querySelector(".below").offsetTop - 20,
    behavior: "smooth",
  });
});

// allow clicking profile to edit name/picture (local demo)
document.getElementById("profilePic").addEventListener("click", () => {
  const name = prompt(
    "Enter display name (stored locally):",
    profileNameEl.textContent || "Mahesh"
  );
  if (name) {
    localStorage.setItem("mb_username", name);
    profileNameEl.textContent = name;
  }
  const pic = prompt("Enter profile picture URL (leave empty to keep):", "");
  if (pic) {
    localStorage.setItem("mb_userpic", pic);
    profilePicEl.src = pic;
  }
});
