-- Questo script SQL definisce la struttura della tabella per i Punti di Interesse (POI)
-- utilizzando PostgreSQL con l'estensione PostGIS, ottimizzata per query geo-spaziali.

-- Assicurati che l'estensione PostGIS sia abilitata nel tuo database.
-- Puoi abilitarla con il seguente comando se non è già attiva:
-- CREATE EXTENSION IF NOT EXISTS postgis;

-- Creazione della tabella 'pois'
CREATE TABLE pois (
    -- ID univoco auto-incrementante per ogni POI
    id SERIAL PRIMARY KEY,

    -- Nome del Punto di Interesse (es. "Colosseo")
    nome VARCHAR(255) NOT NULL,

    -- ID univoco fornito da Google Places, utile per l'integrazione API.
    -- La clausola UNIQUE assicura che non ci siano duplicati.
    google_place_id VARCHAR(255) UNIQUE,

    -- Colonna geo-spaziale per memorizzare le coordinate.
    -- Il tipo 'GEOGRAPHY(POINT, 4326)' è ottimale per dati globali (lat/lon).
    -- - POINT: Specifica che memorizzeremo un singolo punto.
    -- - 4326: È l'SRID (Spatial Reference System Identifier) per WGS 84, lo standard per GPS.
    -- La clausola NOT NULL assicura che ogni POI abbia una posizione.
    location GEOGRAPHY(POINT, 4326) NOT NULL
);

-- Creazione di un indice spaziale (Spatial Index) sulla colonna 'location'.
-- Questo è il passo FONDAMENTALE per garantire performance elevate nelle query di prossimità.
-- Senza questo indice, il database dovrebbe calcolare la distanza da ogni singolo punto
-- nella tabella per ogni query, risultando in tempi di risposta molto lenti su grandi dataset.
-- L'indice GIST (Generalized Search Tree) è lo standard per i dati geo-spaziali in PostGIS.
CREATE INDEX pois_location_idx ON pois USING GIST (location);

-- Esempio di inserimento dati (opzionale, per test)
-- INSERT INTO pois (nome, google_place_id, location) VALUES
-- ('Colosseo', 'ChIJrRkKO7heLxMRMD_3eR4-h-E', ST_SetSRID(ST_MakePoint(12.4922, 41.8902), 4326)::geography),
-- ('Fontana di Trevi', 'ChIJg8swS71hLxMR-9i-AMVj8rA', ST_SetSRID(ST_MakePoint(12.4833, 41.9009), 4326)::geography);

COMMIT;
