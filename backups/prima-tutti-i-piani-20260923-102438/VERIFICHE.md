# Verifiche del prototipo — 23/09/2026

Esito: Piano 1 funzionante nel browser locale all'indirizzo http://127.0.0.1:8765.

- Ispezione testo e struttura di tutte le 10 pagine; esame visivo della panoramica completa e del Piano 1 ad alta risoluzione.
- Piano 1: 16 geometrie (15 appartamenti e Mulino), con balconi associati come sottotracciati. Corrette discontinuità A12/Scala A e B14/C12; verifica visiva di tutti i contorni rispetto alla base originale.
- Rendering principale 300 dpi. Tutte le altre 9 tavole renderizzate a 180 dpi per consultazione; file controllati come presenti e leggibili.
- Browser: selezione diretta SVG, selezione da elenco, hover con ritorno alla selezione fissata, attivazione da tastiera, modalità modifica.
- A14: passaggi disponibile → riservato → venduto → da verificare verificati; persistenza dopo refresh confermata sia per disponibile sia per venduto. Stato iniziale da verificare ripristinato a fine test e confermato con ulteriore refresh.
- Filtro: con A14 disponibile mostra esattamente 1/16; contatori 1 disponibile, 1 venduto, 14 da verificare.
- Visualizzazione desktop 1440×1000 al 100% e 200%; telefono 390×844 al 100% e 300%; selettore e tavola interrata a 1024×900.
- Nessun overflow orizzontale del documento su telefono (scrollWidth 390, viewport 390). Lo scorrimento della planimetria ingrandita resta nel suo contenitore.
- Allineamento controllato su screenshot e tramite dimensioni DOM di SVG/immagine; le differenze di arrotondamento sono inferiori a 0,02 px. Immagine e overlay condividono il sistema di coordinate.
- Tratteggio venduto visualmente confinato a C13 e, durante la prova, ad A14 e balcone separato, senza riempire lo spazio intermedio né le unità confinanti.
- Nessun errore o avviso nella console browser durante i controlli.
- Verifica sintattica dei file JS superata. Test isolato della persistenza superato per tutti gli stati, riapertura, stato/id non validi, JSON corrotto e scrittura localStorage negata. Eseguibile con: node tools/test-state.cjs .
- Corretto un problema iniziale di assegnazione della classe SVG che impediva l'inizializzazione di colori ed etichette accessibili.

Limiti: le altre tavole sono in sola consultazione, non dichiarate interattive. L'apertura diretta file:// è supportata dall'architettura senza fetch, ma il collaudo browser è stato eseguito su HTTP locale. Le aree seguono la scheda preliminare raster; non costituiscono validazione catastale. Nessuna pubblicazione esterna eseguita.
