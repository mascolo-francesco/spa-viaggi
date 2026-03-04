**VERIFICA DI INFORMATICA  
Realizzazione di una SPA per l'organizzazione di viaggi di gruppo**

Durata: 3 ore

Tecnologie richieste:

• Frontend: Angular (oppure, in alternativa, HTML/CSS/JavaScript tradizionale)

• Backend: Flask (oppure FastAPI)

• Database: MongoDB

**1) SITUAZIONE**

Un gruppo di amici organizza spesso viaggi insieme: weekend, vacanze brevi, visite a città europee, eventi o gite di più giorni. Attualmente tutte le informazioni vengono gestite in modo disordinato (chat, fogli sparsi, appunti personali), per cui nasce l'esigenza di realizzare una web app unica che permetta di raccogliere e consultare facilmente i dati relativi ai viaggi.

L'applicazione dovrà consentire agli utenti di accedere tramite login e di visualizzare informazioni legate ai viaggi già presenti nel sistema, oltre a inserire o modificare dati durante la pianificazione.

Le informazioni che possono essere gestite riguardano, ad esempio: dati generali del viaggio (titolo, destinazione, periodo, descrizione), partecipanti coinvolti, attività o tappe previste (visite, eventi, spostamenti, ecc.), spese o budget indicativi e note aggiuntive utili all'organizzazione.

Ogni viaggio può contenere informazioni diverse rispetto agli altri: alcuni potrebbero avere molte attività pianificate, altri solo una descrizione generale; alcune spese potrebbero essere dettagliate, altre molto sintetiche; alcuni viaggi potrebbero includere informazioni extra decise liberamente da chi li inserisce.

Esempi di dati che si potrebbero memorizzare (indicativi):  
• "Weekend a Berlino", con date, elenco partecipanti, visita a un museo, costo del volo e note logistiche.  
• "Gita al lago", con poche informazioni, magari solo destinazione e partecipanti.  
• "Viaggio a Barcellona", con più tappe, spese suddivise per categoria e commenti vari.

Gli esempi servono solo a chiarire il contesto: la progettazione dei dati e della struttura del database è parte integrante della prova e deve essere decisa dallo studente.

**Accesso all'applicazione**

• Non è prevista la registrazione utenti.

• Gli utenti saranno inseriti direttamente nel database prima dell'esecuzione.

• È richiesto solo il login.

• Non è necessario gestire sessioni o sistemi di autenticazione avanzati.

**Discussione orale**

Al termine della realizzazione pratica, ogni studente dovrà sostenere una breve interrogazione orale con il docente, durante la quale dovrà spiegare le scelte progettuali effettuate, descrivere la struttura dei dati utilizzata, illustrare il funzionamento delle API e del frontend e commentare parti significative del codice.

**Uso di strumenti di IA**

È consentito utilizzare strumenti di IA come supporto allo sviluppo. Lo studente deve comunque essere in grado di comprendere il codice consegnato e spiegare chiaramente le soluzioni adottate durante l'orale.

**2) RICHIESTE**

Le richieste sono indipendenti tra loro: è possibile completarne alcune anche se altre risultano incomplete.

**A) Preparazione iniziale (base comune)**

• Creare il database e popolarlo con dati di esempio.

• Inserire almeno 3 utenti fittizi.

• Inserire almeno 10 viaggi con informazioni varie e non uniformi.

• Predisporre backend e frontend in modo che possano comunicare correttamente.

**B) Login**

Realizzare la funzionalità di login tramite inserimento di credenziali e verifica dei dati presenti nel database.

**C) Elenco viaggi**

Visualizzare nell'interfaccia un elenco dei viaggi disponibili.

**D) Dettaglio viaggio**

Permettere la visualizzazione delle informazioni complete di un singolo viaggio selezionato.

**E) Inserimento di un nuovo viaggio**

Consentire l'aggiunta di nuovi viaggi tramite interfaccia frontend e salvataggio nel database.

**F) Gestione dei partecipanti**

Permettere la visualizzazione e la modifica dell'elenco dei partecipanti di un viaggio.

**G) Gestione attività o tappe**

Consentire l'inserimento e l'aggiornamento delle attività previste per un viaggio.

**H) Gestione spese e riepilogo**

Permettere l'inserimento di spese e la visualizzazione di un riepilogo sintetico dei costi.

**I) Visualizzazione su mappa dei viaggi**

Permette la visualizzazione di una mappa contenente i marker dei viaggi realizzati o progettati (rossi quelli già fatti, verdi quelli da fare). Cliccando con il mouse sul marker, devono essere visualizzate le info del viaggio

**J) Download info viaggio**

Permettere di scaricare un file PDF contenente tutte le informazioni sul viaggio.

**Consegna**

Al termine delle 3 ore lo studente deve consegnare il link alla propria repository github contenente:

• codice frontend;

• codice backend;

• una cartella contenente i dati inseriti nel database.