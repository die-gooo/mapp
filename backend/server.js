// Importazione dei moduli necessari
const express = require('express');
const { Pool } = require('pg'); // Driver per PostgreSQL

// Creazione di un'istanza dell'applicazione Express
const app = express();
const PORT = process.env.PORT || 3000;

// --- Configurazione della Connessione al Database ---
// Il server tenterà di connettersi a PostgreSQL utilizzando le variabili d'ambiente.
// Se non sono definite, la connessione fallirà e il server utilizzerà i dati di esempio.
// Esempio di variabili d'ambiente necessarie:
// PGUSER='tuo_utente'
// PGHOST='localhost'
// PGDATABASE='tuo_database'
// PGPASSWORD='tua_password'
// PGPORT=5432
let pool;
try {
  pool = new Pool();
  console.log('Pool di connessione al database configurato. Il server tenterà di usare PostGIS.');
} catch (error) {
  console.warn('Configurazione del database non trovata. Il server utilizzerà i dati di esempio (mock data).');
}

// Middleware
app.use(express.json());

// --- Mock Data (Dati di Esempio per Fallback) ---
const mockPois = [
  { id: 1, nome: 'Colosseo', latitude: 41.8902, longitude: 12.4922, google_place_id: 'ChIJrRkKO7heLxMRMD_3eR4-h-E' },
  { id: 2, nome: 'Fontana di Trevi', latitude: 41.9009, longitude: 12.4833, google_place_id: 'ChIJg8swS71hLxMR-9i-AMVj8rA' },
];
const mockPlaceDetails = {
  'ChIJrRkKO7heLxMRMD_3eR4-h-E': { name: "Colosseo", formatted_address: "Piazza del Colosseo, 1, 00184 Roma RM, Italia", rating: 4.7 },
  'ChIJg8swS71hLxMR-9i-AMVj8rA': { name: "Fontana di Trevi", formatted_address: "Piazza di Trevi, 00187 Roma RM, Italia", rating: 4.8 },
};


// --- Definizione degli Endpoint API ---

/**
 * @route GET /api/pois/nearby
 * @desc Esegue una query geo-spaziale per trovare i POI entro un raggio di 5km.
 *       Se la connessione al DB non è configurata, restituisce dati di esempio.
 */
app.get('/api/pois/nearby', async (req, res) => {
  const { lat, lon } = req.query;

  // Se il pool non è stato inizializzato o mancano le coordinate, usa i dati di esempio
  if (!pool || !lat || !lon) {
    console.log('Richiesta POI: Connessione DB non disponibile o coordinate mancanti. Invio dati di esempio.');
    return res.json(mockPois);
  }

  const userLat = parseFloat(lat);
  const userLon = parseFloat(lon);
  const searchRadiusInMeters = 5000;

  try {
    const query = `
      SELECT id, nome, google_place_id, ST_X(location::geometry) as longitude, ST_Y(location::geometry) as latitude
      FROM pois
      WHERE ST_DWithin(
        location,
        ST_MakePoint($1, $2)::geography,
        $3
      )
    `;
    const values = [userLon, userLat, searchRadiusInMeters];

    console.log(`Esecuzione query PostGIS per coordinate: lat=${userLat}, lon=${userLon}`);
    const { rows } = await pool.query(query, values);
    res.json(rows);

  } catch (error) {
    console.error("Errore durante la query a PostGIS:", error);
    res.status(500).json({ error: 'Errore del server durante la ricerca dei POI.' });
  }
});

/**
 * @route GET /api/places/details/:placeId
 * @desc Proxy per la Google Places API (attualmente usa dati di esempio).
 */
app.get('/api/places/details/:placeId', (req, res) => {
  const { placeId } = req.params;
  const details = mockPlaceDetails[placeId];

  if (details) {
    res.json(details);
  } else {
    res.status(404).json({ error: 'Dettagli non trovati.' });
  }
});

// Avvio del server
app.listen(PORT, () => {
  console.log(`Server in ascolto sulla porta ${PORT}`);
});
