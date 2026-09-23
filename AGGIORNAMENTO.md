# Attivazione venditore e cliente

I file del sito usano il PDF originale in scala di grigi. Le campiture di venduto, prenotato e disponibile sono rispettivamente rosse, gialle e blu, tutte al 45%. La scheda a sinistra permette di salvare anche sigla del venditore e nome cliente.

## Aggiornare il servizio Google già esistente

1. Dal foglio Google usato per gli stati, apri Estensioni → Apps Script.
2. Sostituisci il contenuto del codice con quello del file `google-apps-script/Code.gs` aggiornato e salva.
3. Apri Distribuisci → Gestisci distribuzioni → seleziona la distribuzione attuale → Modifica (matita).
4. In Versione scegli Nuova versione e premi Distribuisci. Mantieni Esegui come Me e accesso Chiunque. Aggiornando la distribuzione esistente l'URL rimane invariato.
5. Pubblica le modifiche del sito su GitHub Pages e ricarica la pagina.

Non occorre creare un nuovo foglio o cancellare righe. Le colonne Venditore e Cliente vengono aggiunte al primo salvataggio; gli stati già registrati restano disponibili. Il nuovo sito impedisce di salvare sul vecchio servizio, per evitare che i nuovi campi vengano ignorati.

## Utilizzo e stampa

Attiva Modalità modifica, scegli un'unità, compila Stato commerciale, Sigla del venditore (massimo 20 caratteri) e Nome cliente (massimo 120 caratteri), quindi premi Salva scheda. I dati sono condivisi tra gli utenti e tra i diversi livelli della stessa unità. Le modifiche concorrenti vengono segnalate.

Scarica PDF del piano produce la tavola originale con le campiture e, nelle pagine successive dello stesso PDF, un riepilogo leggibile di tutte le unità del piano: sigla, stato, venditore e cliente. I nomi lunghi vanno a capo. Il riferimento è la sigla già presente sulla planimetria. I filtri dell'interfaccia non escludono unità dal PDF. I campi non compilati sono indicati come non indicati.

I nomi dei clienti restano nel foglio e nelle risposte protette dalla password, non nei file statici del repository. I PDF esportati includono i nomi salvati.

## Verifiche eseguite

- Esportazione delle 10 tavole, inclusi i riepiloghi multipagina.
- Controllo visivo di allineamento, trasparenza e leggibilità della stampa.
- Prova nel browser della scheda con stato, venditore e cliente.
- Test del servizio simulato con due utenti, conflitti, rete assente e testi che potrebbero essere interpretati come formule.

La nuova versione del servizio Google deve ancora essere distribuita dal proprietario dell'account. Le verifiche dei nuovi campi sono state eseguite in ambiente di prova e non hanno modificato i dati reali.
