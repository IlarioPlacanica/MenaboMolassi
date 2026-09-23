# Analisi completa del PDF

Fonte: 2026 08 27_Corte Molassi_Complessivo Piani.pdf. Analizzate tutte le dieci pagine tramite estrazione del testo e verifica visiva delle tavole complete, dei confini e delle sovrapposizioni. Il PDF originale e le immagini di base non sono stati modificati.

Dieci pagine A3 orizzontali, 1190,52 × 841,80 punti, rotazione 0; MediaBox con origine non nulla. La trasformazione SVG→PDF tiene conto sia dell’inversione verticale sia della traslazione del MediaBox. Le geometrie usano viewBox 0 0 2400 1698, identico a quello della base immagine nell’unico SVG.

| Pagina | Tavola | Aree interattive |
|---|---|---:|
|1|Piano 0: 19 appartamenti e Mulino|20|
|2|Piano 1: 15 appartamenti e Mulino|16|
|3|Piano 2: 9 appartamenti, 4 soffitte e Mulino|14|
|4|Piano 3: 8 appartamenti e Mulino|9|
|5|Piano 4: B41–B44, C41–C43|7|
|6|Piano 4 · soppalchi: B44, C41–C43|4|
|7|Piano 5: B51–B53 e porzione C43|4|
|8|Piano −1: 61 cantine, 4 box, 32 posti auto e Mulino|98|
|9|Piano −2: PA201–PA250|50|
|10|Sezioni dei fabbricati A e B e del Mulino|0|

Totale: 222 geometrie riferite a 209 identità uniche. La pagina 6 non viene presentata come un piano ulteriore; la pagina 10 resta una tavola di sezioni, consultabile ed esportabile.

## Geometrie

Nelle pagine 1–9 il disegno architettonico e i confini sono raster, suddivisi in tasselli; testi e riquadri sono sovrapposti come elementi estraibili. Le sezioni contengono molti elementi vettoriali. Non sono state ridisegnate le planimetrie.

Le nuove aree sono state ricavate dai confini rossi a 2400 × 1698, includendo i segmenti scuri sui muri; regioni connesse e contorni sono stati verificati sulle tavole. Balconi e cortili separati sono sottotracciati della stessa unità. Scala, corselli, terrapieno, impianti e posti bici comuni restano esclusi. Le geometrie già verificate del Piano 1 sono mantenute.

Correzioni rispetto all’inventario testuale precedente: aggiunti B22, B23 e C33, leggibili nelle tavole ma omessi dall’estrazione originaria. Per CA111/CA109/CA107/CA106 sono state usate le etichette nelle rispettive cantine, evitando di scambiarle con le diciture di associazione dentro BX101–BX104. CA139+140 è mantenuto come codice composto; CA104 non è presente.

## Identità e dati

Mulino: una sola identità su cinque tavole. A13–A16: appartamento al Piano 1 e soffitta al Piano 2. B44, C41 e C42: piano principale e soppalco. C43: piano principale, soppalco e porzione al Piano 5. Lo stato è condiviso; la superficie commerciale è quella dell’unità, non della singola porzione. Box e cantine associati nella fonte hanno identità distinte: la dicitura di associazione non viene interpretata come obbligo di vendita congiunta.

Stati VENDUTO espliciti: AT1–AT6, BT1, BT3, CT2, CT4, C13 e C43. Gli altri partono da null/Da verificare. Le sigle R e V al Piano −1 non dispongono di legenda commerciale e non vengono dedotte. Superfici, locali e prezzi non indicati restano null. Data emissione: Piano 1 03/08/2026; altre tavole 30/07/2026.

data/pdf-reviewed.json conserva estrazione fresca di tutte le pagine, dimensioni, conteggi e impronta SHA-256. data/pdf-audit.json conserva l’inventario storico, comprese le sue omissioni documentate sopra.

## Esportazione

Ogni esportato è ottenuto copiando la pagina originale e aggiungendo tracciati e campiture con trasparenza. Non viene creato uno screenshot della schermata. Il tratteggio è ritagliato nei poligoni; la legenda degli stati correnti, con data e conteggi, viene aggiunta nella zona libera della colonna sinistra. Le annotazioni originali restano parte della fonte e possono differire dallo stato successivamente impostato nell’app.
