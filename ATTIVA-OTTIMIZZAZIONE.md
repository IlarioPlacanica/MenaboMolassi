# Aggiornamento prestazioni

La modifica del sito riduce le operazioni necessarie per il PDF completo ed elimina l'attesa del salvataggio dietro una lettura periodica. Le letture simultanee vengono accorpate; una risposta vecchia non può sovrascrivere il salvataggio appena confermato. Il PDF continua a leggere i dati condivisi prima di esportare.

Per accelerare anche login e letture Google:

1. Apri Apps Script dal foglio Google esistente.
2. Sostituisci il codice con `google-apps-script/Code.gs` incluso in questa correzione.
3. Salva. Apri Distribuisci → Gestisci distribuzioni → matita → Nuova versione → Distribuisci.
4. Mantieni URL, Esegui come Me e accesso Chiunque invariati.
5. Pubblica le modifiche locali del sito su GitHub Pages.

La cache vive sul servizio Google, dura al massimo 5 secondi e viene aggiornata dopo ogni scrittura confermata. Il foglio rimane l'archivio persistente; la password viene verificata prima di ogni lettura della cache. Non occorre modificare righe del foglio o eseguire nuovamente setup.

Misura locale del PDF completo di prova: circa 6,3 secondi prima e 1,5 secondi dopo, per 25 pagine con gli stessi testi e ordine. Questa misura esclude la rete Google: login e salvataggio restano dipendenti dai suoi tempi di risposta. Il salvataggio non viene dichiarato riuscito prima della conferma del servizio.
