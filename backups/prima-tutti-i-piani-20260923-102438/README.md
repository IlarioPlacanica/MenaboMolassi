# Corte Molassi · planimetria interattiva

Aprire index.html direttamente oppure avviare `python serve.py` e visitare http://127.0.0.1:8765. Nessuna dipendenza frontend, build o connessione Internet necessaria. Il doppio clic funziona senza fetch; il salvataggio file:// dipende dalle restrizioni del browser, quindi il server locale è consigliato.

## Utilizzo

Piano 1 ha 15 appartamenti e il Mulino mappati, inclusi i balconi. Passare sulle aree mostra una scheda temporanea; clic o Invio/Spazio fissa la selezione. Attivare Modalità modifica, scegliere lo stato e premere Salva stato. Il filtro Solo disponibili include soltanto gli stati esplicitamente confermati disponibili. I contatori sono riferiti all'intero piano, l'elenco indica visibili/totali. Zoom da 100% a 400% con scorrimento; Adatta ripristina la tavola. Su telefono si può selezionare anche dall'elenco.

I dati iniziali non documentati restano null. C13 è venduto nella fonte. Il tratteggio SVG segue tutti i sottotracciati dell'unità; le annotazioni già stampate nel PDF restano visibili. Il Mulino ha una superficie complessiva multipiano.

## File e modifica

- data/apartments.json: fonte modificabile, piani, metadati, geometrie e stati iniziali.
- data/apartments.js: copia generata per consentire apertura file://. Dopo modifiche JSON, eseguire `python tools/sync-data.py`.
- js/apartments.js: lettura e validazione dati.
- js/state.js: localStorage versionato, validazione stati e gestione errori.
- js/app.js: interfaccia e interazioni.
- css/style.css: aspetto e responsive.
- assets/plans/: rendering originali.
- data/pdf-audit.json e ANALISI-PDF.md: inventario e metodo di analisi.

Gli stati sono locali al browser e all'origine (protocollo, host e porta), non condivisi né sincronizzati. La modalità modifica è un controllo dell'interfaccia, non un'autenticazione. Se il browser nega il salvataggio, appare un messaggio e il valore precedente resta invariato. Non vengono cancellati automaticamente dati illeggibili.

## Altri piani e pubblicazione

Il selettore mostra le altre tavole in sola consultazione. Per aggiungere interattività: creare path nelle stesse coordinate, aggiungere le unità con floor corrispondente e attivare mapped nel piano. Per unità multipiano separare l'identità commerciale dalle singole geometrie prima di introdurre contatori globali (C43, Mulino, soffitte).

Per hosting statico copiare index.html, css/, js/, data/apartments.js, assets/ e, per il collegamento sorgente, il PDF. Si può pubblicare su GitHub Pages, Netlify o hosting normale; nessuna pubblicazione è stata eseguita. Evitare di caricare dati privati o il PDF se non destinati al pubblico.
