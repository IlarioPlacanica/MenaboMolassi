# Corte Molassi — GitHub Pages e stati condivisi

Questa versione continua il progetto esistente: 10 tavole originali, geometrie SVG esistenti, venduto rosso pieno ed esportazione PDF nel browser. Il PDF scaricato contiene la pagina originale e le campiture correnti, anche delle unità nascoste dai filtri.

## Attivazione Google Sheets (una sola volta)

1. Crea un Google Sheet privato, poi apri **Estensioni → Apps Script**.
2. Incolla il contenuto di `google-apps-script/Code.gs` nell’editor e salva.
3. Esegui `setup` e autorizza l’accesso al foglio. Viene creata la scheda Stati e impostata la password **0000** nelle proprietà dello script.
4. Seleziona **Distribuisci → Nuova distribuzione → App web**: esegui come **te**, accesso **Chiunque**. Non rendere pubblico il foglio. Se l’organizzazione impedisce l’accesso Chiunque, serve un account che lo consenta.
5. Copia l’URL della distribuzione che termina in `/exec` e inseriscilo nel campo `endpoint` di `js/config.js`.
6. Pubblica i file aggiornati nel repository GitHub Pages. Nessun server Python è necessario.
7. Accedi con **0000** da due browser diversi. Modifica un’unità: il secondo browser deve mostrare il nuovo stato dopo circa 5 secondi più il tempo di risposta Google. Ricarica entrambe le pagine e verifica la persistenza. Scarica il PDF del piano e controlla la stessa unità.

## Comportamento

La sincronizzazione usa interrogazioni automatiche ogni 5 secondi nelle schede visibili, non notifiche push istantanee. Le scritture sono confermate soltanto dopo il salvataggio nel foglio. Le modifiche concorrenti alla stessa unità sono rifiutate se basate su una versione superata. Prima del download si legge nuovamente lo stato condiviso; senza connessione il download viene bloccato per evitare un PDF presentato come aggiornato.

La password viene verificata dal servizio Google a ogni richiesta; nella sessione del browser resta la credenziale fino all’uscita. Gli stati locali della versione precedente non vengono importati automaticamente: concordare gli eventuali valori da migrare prima di usarla.

GitHub Pages rende pubblici i file statici, compreso il PDF originale. La password protegge l’accesso ordinario all’interfaccia e le operazioni sugli stati condivisi, ma non rende privati quei file. Per rendere riservate anche le planimetrie occorre un hosting con autenticazione dei file.

Non modificare manualmente colonne o versioni della scheda Stati. Le quote Google e i tempi di rete limitano il numero di utenti e la frequenza effettiva degli aggiornamenti.

## Verifiche e stato della consegna

Test automatici con servizio Google simulato: password errata, due utenti, conflitti, errori di rete, validazione e rilascio del blocco. Esportazione delle 10 tavole verificata con la libreria PDF inclusa. La connessione a un vero foglio Google e la pubblicazione non sono verificate finché manca l’URL della distribuzione.

Documentazione Google: https://developers.google.com/apps-script/guides/web e https://developers.google.com/apps-script/guides/content
