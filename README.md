# Corte Molassi · planimetrie interattive

## Avvio

Su questo computer aprire **AVVIA-MOLASSI.cmd**, lasciare aperta la finestra e visitare **http://127.0.0.1:8765**. Password: **0000**. Per fermare l’app chiudere la finestra o premere Ctrl+C.

Il file di avvio usa Python già presente nel runtime locale di Codex; in alternativa usa `py -3`. Su un altro computer servono Python 3.10+ e `python -m pip install -r requirements.txt`, poi `python serve.py`. È possibile scegliere una porta con `python serve.py --port 8766`.

L’accesso viene verificato dal server prima di inviare app, dati, planimetrie e PDF. Aprire direttamente index.html non avvia il servizio: usare l’indirizzo locale. Il pulsante Esci invalida la sessione. Le sessioni durano al massimo 8 ore e si azzerano al riavvio del server. La password può essere sostituita tramite la variabile MOLASSI_PASSWORD. Il servizio ascolta solo su questo computer; per pubblicarlo occorre una configurazione di hosting con HTTPS e autenticazione adeguata.

## Utilizzo

Scegliere il piano. Selezionare un’unità sulla planimetria, con Invio/Spazio oppure dall’elenco. Il campo Cerca unità filtra l’elenco per codice. Il filtro Solo disponibili include esclusivamente stati confermati disponibili. Zoom e Adatta controllano la visualizzazione senza modificare geometrie o esportazioni.

Attivare Modalità modifica, scegliere lo stato e premere Salva stato. Le 209 unità hanno identità uniche e 222 geometrie distribuite sulle nove tavole di piani. Il Mulino, A13–A16 con le relative soffitte, B44/C41/C42 con i soppalchi e C43 sui suoi tre livelli condividono lo stesso stato. I contatori si riferiscono alle unità rappresentate nel piano corrente; le superfici multipiano non vanno sommate.

Gli stati restano nel browser e nell’origine usata (protocollo, host e porta), e sopravvivono al ricaricamento e all’uscita. Non sono sincronizzati tra dispositivi o browser. Gli stati precedenti del Piano 1 vengono mantenuti usando la stessa chiave locale. Se il browser impedisce il salvataggio, compare un messaggio e il valore precedente resta invariato.

## Scarica PDF del piano

Il pulsante esporta una sola pagina PDF corrispondente alla tavola selezionata, con **tutti gli stati salvati correnti**. Filtri, ricerca, selezione e zoom non nascondono unità nell’esportazione. I tracciati delle campiture vengono disegnati sopra la pagina originale, mantenendone testi, immagini, dimensioni e dettagli vettoriali. Il tratteggio dei venduti viene ritagliato nei poligoni, compresi i balconi separati. Una legenda con conteggi e data di esportazione occupa lo spazio vuoto nella colonna sinistra. Anche la pagina Sezioni può essere scaricata, senza assegnarle unità inesistenti.

Le scritte VENDUTO già stampate nella fonte restano visibili, anche dopo un cambio di stato. La legenda e le campiture rappresentano lo stato corrente. L’originale non viene modificato.

## Dati e manutenzione

- data/apartments.json: unità commerciali, piani e geometrie SVG separate (schema 2).
- data/apartments.js: copia generata; dopo modifiche JSON eseguire `python tools/sync-data.py`.
- js/apartments.js, js/state.js, js/app.js: repository, persistenza e interfaccia.
- js/export.js: download del piano tramite il servizio locale.
- login.html e js/login.js: schermata di accesso.
- serve.py: sessioni e servizio locale autenticato.
- pdf_export.py: sovrapposizione delle geometrie alla pagina PDF originale.
- assets/plans/: immagini originali già presenti, conservate senza modifiche.
- ANALISI-PDF.md e data/pdf-reviewed.json: analisi completa e impronta del PDF.
- VERIFICHE.md: collaudo effettuato.

I valori non documentati restano da verificare. Le sigle isolate R e V del Piano −1 non sono interpretate automaticamente come stati commerciali. CA139+140 rimane un’unica area. Non viene introdotta CA104, assente dalla tavola. Le aree SVG seguono i confini della scheda preliminare e non costituiscono rilievo catastale.
