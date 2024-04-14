# MTAA---Backend

Backend je riešený pomocou Node.js a Express.js.
Nas spustenie backendu je potrebné mať nainštalovaný Node.js a npm.

Spustenie servera lokálne:

-   1. Navigácia do /local
-   2. Spustenie príkazu `npm install` alebo skrátený príkaz `npm i`
-   3. Spustenie príkazu `npm start`

Spustenie servera na dockeri:

-   docker-compose down; docker-compose build; docker-compose up

Na otestovanie API calls sme používali Thunder Client v Visual Studio Code.
Stačí si importovať collections: Thunder_Client\thunder-collection_MTAA-Backend.json

Na overenie Websocketu sme vytvorili websocket.js, ktorý vytvorí button, ktorý sa pripojí na websocket (dalsie calls ako move, resigns sme netestovali, až v apke na frontende, keď budeme vedieť ako bude prebiehať logika hry)
na adrese http://localhost:8080/ server vracia stránku s websocket buttonom.
