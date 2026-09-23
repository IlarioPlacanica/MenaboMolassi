# Analisi del PDF e metodo di mappatura

Sorgente: 2026 08 27_Corte Molassi_Complessivo Piani.pdf. Dieci pagine A3 orizzontali, 1190,52 × 841,80 punti, rotazione 0, PDF 1.6, nessuna cifratura o modulo. I metadati riportano 27/08/2026; il Piano 1 ha data emissione 03/08/2026, le altre tavole 30/07/2026.

| Pagina | Contenuto |
|---|---|
|1|Piano 0: AT1–AT7, BT1–BT6, CT1–CT6 e Mulino|
|2|Piano 1: A11–A16, B11–B14, C11–C15 e Mulino|
|3|Piano 2: B21–B24, C21–C25, soffitte A13–A16 e Mulino|
|4|Piano 3: B31–B34, C31–C34 e Mulino|
|5|Piano 4: B41–B44, C41–C43|
|6|Seconda tavola Piano 4: soppalchi B44, C41–C43; non un piano autonomo|
|7|Piano 5: B51–B53 e porzione C43|
|8|Piano −1: cantine CA, posti auto PA1xx, BX101–BX104, Mulino e locali comuni|
|9|Piano −2: PA201–PA250, corselli e terrapieno|
|10|Sezioni fabbricati A e B, non una planimetria selezionabile per unità|

Il file data/pdf-audit.json contiene testo, inventario completo dei codici effettivamente estratti, coordinate e conteggi per ogni pagina. I caratteri accentati presentano alcune sostituzioni nella codifica del testo: non ricostruiti come dati certi. CA139+140 è un identificativo composto; non va scisso automaticamente. Alcuni codici ricorrono su più livelli: non sono nuove unità da conteggiare più volte.

## Struttura grafica

Le pagine 1–9 hanno ciascuna 23 immagini: 20 tasselli di fondo (5 colonne × 4 righe, circa 4961 × 3508 pixel complessivi) più 3 loghi. Il disegno architettonico e i confini rossi sono raster; testi e riquadri delle etichette sono sovrapposti come elementi estraibili. Al Piano 1: 1.137 caratteri, 114 linee, 4 curve e 27 rettangoli; questi vettori non costituiscono perimetri immobiliari chiusi. La sezione, pagina 10, è invece ricca di vettori (15.782 linee, 3.599 curve, 288 rettangoli).

Il MediaBox ha origine non nulla. Per normalizzare le coordinate di pdfplumber sottrarre x0 e top del bbox, poi scalare a 2400 × 1698. Non utilizzare direttamente le coordinate negative del PDF.

## Metodo Piano 1

1. Rendering Poppler della pagina completa a 300 dpi, circa 4961 × 3508 px, senza ritagliare o ridisegnare la grafica originale.
2. Analisi del rendering a 2400 × 1698: maschera dei contorni rossi, riempimento delle regioni a partire dai codici verificati, tracciamento del bordo, semplificazione con tolleranza di 1 pixel.
3. Correzione manuale di due discontinuità: confine occidentale A12 per escludere Scala A; divisorio B14/C12. Controllo di tutte le aree rispetto ai contorni della tavola. I balconi separati sono sottotracciati della stessa unità; le parti comuni restano escluse.
4. Un solo SVG con viewBox 0 0 2400 1698 contiene sia l'immagine sia i path. L'immagine ad alta risoluzione è scalata nello stesso sistema del rendering di riferimento. Zoom e responsive agiscono sul solo SVG, mai separatamente sull'overlay.
5. Il tratteggio venduto è un pattern usato come riempimento del path, quindi ritagliato dalla forma effettiva anche su balconi e concavità.

Le superfici sono commerciali come riportate: A11 44, A12 57, A13 44, A14 50, A15 49, A16 82; B11 67, B12 57, B13 54, B14 96; C11 42, C12 91, C13 50, C14 50, C15 57 m². Mulino 1398 m² è il valore complessivo ripetuto su più tavole, non attribuito al solo Piano 1.

C13 riporta VENDUTO. Tutti gli altri stati sono null (da verificare); l'assenza della scritta VENDUTO non prova la disponibilità. Locali e prezzi sono null. La scritta VENDUTO stampata nel PDF resta parte dell'immagine anche se si modifica lo stato nell'app.

La precisione segue i confini rossi raster della scheda preliminare: non è un rilievo catastale. Gli altri piani sono predisposti per la consultazione della tavola e la futura mappatura, senza geometrie inventate.
