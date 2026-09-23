# Verifiche dell’aggiornamento · 23/09/2026

## Analisi e copertura

- Analizzate tutte le dieci pagine del PDF, visivamente e mediante estrazione del testo. Verificati i confini sulle sovrapposizioni di tutte le tavole.
- 209 unità uniche, 222 geometrie: p0 20, p1 16, p2 14, p3 9, p4 7, p4s 4, p5 4, s1 98, s2 50. Sezioni consultabili senza inventare unità.
- Aggiunti B22, B23 e C33, non presenti nell’inventario testuale storico. Risolte le associazioni tra etichette delle cantine e annotazioni dentro i box.
- Mantenuti balconi e cortili separati come sottotracciati. Il terrazzo senza codice adiacente alla soffitta A13 al Piano 2 resta non attribuito: il PDF non indica esplicitamente la sua unità commerciale.
- PDF originale e immagini base conservati senza modifiche.

## Accesso e servizio

- Richieste senza sessione a HTML, dati e planimetrie reindirizzate alla schermata di accesso; API protette con risposta 401.
- Password errata rifiutata; password 0000 accettata. Cookie HttpOnly e SameSite=Strict. Logout invalida il token.
- File Python e percorsi esterni non serviti. Dati di esportazione malformati, identificativi inesistenti e stati non validi rifiutati.
- Servizio limitato a 127.0.0.1. Nessuna pubblicazione esterna.

## PDF

- Esportate tutte le dieci pagine tramite API usando un insieme di prova con tutti i quattro stati.
- Per ciascun esportato: una pagina, MediaBox identico, testo della fonte conservato, medesimo numero di immagini e impronte identiche delle immagini estratte. Impronta del PDF originale invariata dopo le esportazioni.
- Rendering e verifica visiva di tutti i PDF: allineamento di campiture, ritaglio del tratteggio e conservazione della tavola. Legenda spostata e compattata per evitare contatto con la legenda originale del Piano 3; generati e verificati nuovamente i dieci esportati finali.
- Download dal browser verificato anche con filtro Solo disponibili e zoom 150%: il piano viene esportato completo.

## Interfaccia e persistenza

- Selezione diretta SVG e da elenco, attivazione da tastiera, modifica e salvataggio verificati.
- A14 modificata al Piano 1, stato condiviso con la soffitta al Piano 2 e mantenuto dopo ricaricamento. C43 modificata nel soppalco e verificata al Piano 5. Stati di prova ripristinati.
- Ricerca per codice verificata su CA139+140; scheda corretta per cantina e soffitta. Filtro conferma 1/14 quando una sola unità del Piano 2 è disponibile.
- Corretto il ripristino involontario del selettore di stato alla perdita del focus SVG.
- Prova mobile 390 × 844: nessun overflow orizzontale del documento; lo zoom resta nel contenitore scorrevole della mappa.
- Test isolati del salvataggio: tutti gli stati, riapertura, migrazione della chiave v1, ID/stati non validi, JSON illeggibile e scrittura locale negata.
- Verifica sintattica dei cinque file JS applicativi e compilazione dei moduli Python superate.

## Ripetizione dei controlli

`node tools/test-state.cjs .`

Con il servizio avviato: `python tools/test-app.py 8765 cartella-esportati-di-prova`.

Gli stati sono locali al browser/origine. Le sigle R/V del seminterrato non vengono convertite in stati senza legenda. Le scritte già stampate nel PDF restano visibili. Le geometrie non costituiscono validazione catastale.
