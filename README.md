# Geo POI Web App - MVP

Questa è un'applicazione web MVP (Minimum Viable Product) che mostra Punti di Interesse (POI) su una mappa in base alla geolocalizzazione in tempo reale dell'utente.

## Architettura

L'applicazione è divisa in due componenti principali:

-   **`/backend`**: Un server Node.js che utilizza Express. È progettato per interfacciarsi con un database **PostGIS** per eseguire query geo-spaziali reali. Se la connessione al database non è configurata, il server funziona in **modalità demo**, restituendo dati di esempio.
-   **`/frontend`**: Una semplice applicazione vanilla JavaScript che utilizza la Google Maps JavaScript API per visualizzare la mappa, tracciare la posizione dell'utente e mostrare i POI.

---

## Prerequisiti

-   [Node.js](https://nodejs.org/) (versione 14.x o successiva)
-   [npm](https://www.npmjs.com/) (generalmente installato con Node.js)
-   Un account [Google Cloud Platform](https://cloud.google.com/) con un progetto attivo e fatturazione abilitata.
-   Un'istanza di database [PostgreSQL](https://www.postgresql.org/) con l'estensione [PostGIS](https://postgis.net/) abilitata.

---

## Configurazione e Installazione

### 1. Configura le API di Google (FONDAMENTALE)

**L'applicazione frontend non funzionerà senza una chiave API di Google Maps valida.**

1.  Vai alla [Google Cloud Console](https://console.cloud.google.com/).
2.  Nel tuo progetto, abilita le API **Maps JavaScript API** e **Places API**.
3.  Crea una **chiave API** con le restrizioni di sicurezza appropriate (restrizioni HTTP per il frontend).
4.  Apri il file `frontend/index.html` e **sostituisci il segnaposto `YOUR_GOOGLE_MAPS_API_KEY`** con la tua vera chiave API.

### 2. Configura il Database e il Backend (per la modalità live)

Per disabilitare la modalità demo e utilizzare dati reali dal tuo database:

1.  **Imposta il Database**:
    -   Connettiti alla tua istanza PostgreSQL.
    -   Esegui lo script in `backend/database.sql` per creare la tabella `pois` e l'indice spaziale.
    -   Popola la tabella con i tuoi dati POI.

2.  **Configura la Connessione**:
    -   Il server backend in `backend/server.js` è configurato per utilizzare il pacchetto `node-postgres` (`pg`), che si connette tramite **variabili d'ambiente**.
    -   Prima di avviare il server, imposta le seguenti variabili d'ambiente nel tuo terminale:
        ```bash
        export PGUSER=il_tuo_utente_db
        export PGHOST=localhost
        export PGDATABASE=il_tuo_database
        export PGPASSWORD=la_tua_password
        export PGPORT=5432
        ```
    -   Se queste variabili non sono impostate, il server tornerà automaticamente alla modalità demo.

### 3. Installa le Dipendenze

Esegui questo comando nella directory `/backend` per installare Express e il driver PostgreSQL:

```bash
cd backend
npm install
```

### 4. Avvia l'Applicazione

**Per avviare il server backend:**

```bash
cd backend
# Assicurati di aver impostato le variabili d'ambiente se vuoi la modalità live
npm start
```
Il server sarà in ascolto su `http://localhost:3000`.

**Per avviare il server frontend:**

```bash
# Dalla root del progetto
cd frontend
# Puoi usare un semplice server Python o npx
python3 -m http.server 8080
```

Apri il tuo browser e naviga su `http://localhost:8080` per visualizzare l'applicazione.
