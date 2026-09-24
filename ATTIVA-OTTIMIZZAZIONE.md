# Aggiornamento prestazioni

La modifica del sito riduce le operazioni necessarie per il PDF completo ed elimina l'attesa del salvataggio dietro una lettura periodica. Le letture simultanee vengono accorpate; una risposta vecchia non può sovrascrivere il salvataggio appena confermato.

Il download PDF usa gli ultimi stati sincronizzati mostrati nel sito, senza aspettare una nuova risposta Google. Richiede almeno un caricamento riuscito e non parte con modifiche non salvate o un salvataggio in corso. Durante la preparazione mostra il piano elaborato; al termine compare un collegamento di download manuale accanto al pulsante. Eventuali problemi di sincronizzazione sono segnalati: il PDF potrebbe non includere le modifiche recenti di altri utenti. Questa correzione richiede la pubblicazione dei file del sito, senza una nuova distribuzione Apps Script.

Verifica locale: `node tests/pdf-download.cjs` controlla il download con Google non rispondente, i blocchi durante il salvataggio e prima del caricamento iniziale, gli errori, il collegamento manuale e il PDF di 10 tavole senza pagine riepilogative.

Per accelerare anche login e letture Google:

1. Apri Apps Script dal foglio Google esistente.
2. Sostituisci il codice con `google-apps-script/Code.gs` incluso in questa correzione.
3. Salva. Apri Distribuisci → Gestisci distribuzioni → matita → Nuova versione → Distribuisci.
4. Mantieni URL, Esegui come Me e accesso Chiunque invariati.
5. Pubblica le modifiche locali del sito su GitHub Pages.

La cache vive sul servizio Google, dura al massimo 5 secondi e viene aggiornata dopo ogni scrittura confermata. Il foglio rimane l'archivio persistente; la password viene verificata prima di ogni lettura della cache. Non occorre modificare righe del foglio o eseguire nuovamente setup.

Misura locale del PDF completo di prova: circa 6,3 secondi prima e 1,5 secondi dopo, per 25 pagine con gli stessi testi e ordine. Questa misura esclude la rete Google: login e salvataggio restano dipendenti dai suoi tempi di risposta. Il salvataggio non viene dichiarato riuscito prima della conferma del servizio.

Le unità senza stato (in precedenza «Da verificare») sono ora considerate disponibili nel sito e nel PDF; prenotazioni e vendite esplicite restano invariate. La compatibilità con le righe vuote del foglio è mantenuta senza richiedere una migrazione del servizio Google.
