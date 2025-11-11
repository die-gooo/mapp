// Variabili globali per mantenere lo stato
let map;
let userMarker;
let infoWindow;
let poiMarkers = []; // Array per tenere traccia dei marker dei POI

/**
 * Funzione di callback chiamata dall'API di Google Maps.
 */
function initMap() {
  const defaultPosition = { lat: 41.9028, lng: 12.4964 }; // Roma

  map = new google.maps.Map(document.getElementById('map'), {
    center: defaultPosition,
    zoom: 15,
  });

  infoWindow = new google.maps.InfoWindow();
  startGeolocation();
}

/**
 * Gestisce la logica di geolocalizzazione.
 */
function startGeolocation() {
  if (!navigator.geolocation) {
    alert("Geolocalizzazione non supportata.");
    return;
  }

  navigator.geolocation.watchPosition(
    (position) => {
      const userPosition = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };

      map.setCenter(userPosition);
      updateUserMarker(userPosition);

      // Chiama il backend per ottenere i POI vicini
      fetchNearbyPois(userPosition);
    },
    () => handleLocationError(true, infoWindow, map.getCenter()),
    { enableHighAccuracy: true }
  );
}

/**
 * Aggiorna il marker della posizione dell'utente.
 */
function updateUserMarker(position) {
  if (!userMarker) {
    userMarker = new google.maps.Marker({
      position: position,
      map: map,
      title: "La tua posizione",
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: "#4285F4",
        fillOpacity: 1,
        strokeColor: "white",
        strokeWeight: 2,
      },
    });
  } else {
    userMarker.setPosition(position);
  }
}

/**
 * Chiama l'API del backend per ottenere i POI vicini.
 */
async function fetchNearbyPois(position) {
  try {
    const response = await fetch(`/api/pois/nearby?lat=${position.lat}&lon=${position.lng}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const pois = await response.json();
    updatePoiMarkers(pois);
  } catch (error) {
    console.error("Errore nel recupero dei POI:", error);
  }
}

/**
 * Aggiorna i marker dei POI sulla mappa.
 */
function updatePoiMarkers(pois) {
  // Rimuove i vecchi marker
  poiMarkers.forEach(marker => marker.setMap(null));
  poiMarkers = [];

  // Aggiunge i nuovi marker
  pois.forEach(poi => {
    const marker = new google.maps.Marker({
      position: { lat: poi.latitude, lng: poi.longitude },
      map: map,
      title: poi.nome,
    });

    // Aggiunge un listener per il click sul marker
    marker.addListener('click', () => {
      fetchPlaceDetails(poi.google_place_id);
    });

    poiMarkers.push(marker);
  });
}

/**
 * Chiama l'API del backend per ottenere i dettagli di un luogo.
 */
async function fetchPlaceDetails(placeId) {
  try {
    const response = await fetch(`/api/places/details/${placeId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const details = await response.json();

    const content = `
      <div class="info-window-content">
        <h3>${details.name}</h3>
        <p>${details.formatted_address}</p>
        <p>Valutazione: ${details.rating} ★</p>
      </div>
    `;

    infoWindow.setContent(content);
    // Trova il marker corrispondente per aprire l'infowindow
    const targetMarker = poiMarkers.find(m => m.getTitle() === details.name);
    if (targetMarker) {
        infoWindow.open(map, targetMarker);
    }

  } catch (error) {
    console.error("Errore nel recupero dei dettagli del luogo:", error);
  }
}


/**
 * Gestisce gli errori di geolocalizzazione.
 */
function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(
    browserHasGeolocation
      ? "Errore: Il servizio di geolocalizzazione è fallito."
      : "Errore: Il tuo browser non supporta la geolocalizzazione."
  );
  infoWindow.open(map);
}
