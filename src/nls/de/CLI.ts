import System from '../../CLI/shared/System';
const { brand } = System.kickstart();
/* TODO */ const dbDocs = '';
const messages = {
  yes: `ja`,
  no: `nein`,
  eg: `z.B.`,
  node: `benötigt node.js`,
  _new: `neu`,
  _and: `und`,
  warning: `Warnung`,
  error: `Fehler`,
  chars: `Buchstaben`,
  needs: `Du benötigst`,
  missing: `fehlt bei`,
  welcome: `Willkommen zum`,
  thanks: `Dank Dir`,
  comeback: `Bis bald!`,
  prima: `Super`,
  bye: `Tschö!`,
  startServer: `Starte den Server so: > PW='yourPassworthere' node server`,
  again: `Lass es mich nochmal versuchen.`,
  unknownErr: `Ein unbekannter Fehler trat auf. Etwas lief schrecklich schief. Entschuldigung!`,
  whatToDo: `Was möchtest Du tun?`,

  installed: `Fantastisch. Du hast ${brand} installiert`,
  credDir: `Wir haben den Ordner angelegt um Deine Zugangsdaten zu speichern:`,

  pwFlow1: `Im nächsten Schritt legst Du Dein erstes Passwort für ${brand} fest.`,
  pwFlow2: `Such Dir ein echt starkes Passwort aus ...`,
  pwScore: `Benötigte Mindest-Punkte:`,
  pwRule: `Mindestens 8 alphanumerische Zeichen.`,
  pwHint: `Bitte benutze mindestens vier zufällige Wörter und Zeichen. Ungebräuchliche sind besser.`,
  pwType: `Während des Tippens`,
  pwMask: `Passwörter maskieren`,
  pwShow: `Passwörter zeigen`,
  pwCErr: `Sorry. Die Passworte sind verschieden.`,
  pwErr1: `Verzeihung, das ist viel zu schwach:`,
  pwErr2: `Verzeihung, das Passwort ist ein wenig zu schwach:`,

  dbFlow1: `Verbinde Dich jetzt noch mit einer Datenbank.`,
  dbFlow2: `Schau Dir auch ${dbDocs} an`, // TODO
  dbType: `Wähle den Typ der Datenbank`,
  dbName: `Datenbank Name`,
  dbPath: `Datenbank Pfad -  Zum Beispiel "./mydb.sql"`,
  dbHost: `Datenbank Host`,
  dbPort: `Datenbank Host Port`,
  dbUser: `Datenbank Benutzername`,
  dbPass: `Datenbank Passwort`,
  dbSchema: `Schema Name`,
  dbErr1: `Hm, wir konnten Dich noch nicht mit der Datenbank verbinden:`,
  dbErr2: `Schade, wir können Dich nicht verbinden. Bitte korrigiere die Einstellungen.`,

  ERR_TLS_CERT_ALTNAME_INVALID: String.raw`HTTPS: Bei der Benutzung von TLS stimmte
  der Hostname oder die IP mit keinem der subjectAltNames im Zertifikat überein.`,
  ERR_TLS_DH_PARAM_SIZE: String.raw`HTTPS: Bei der Benutzung von TLS ist der Parameter
  für den Diffie-Hellman (DH) Schlüsselaustausch zu klein. Die Schlüssellänge muss
  größer/gleich 1024 bits sein um Sicherheitslücken zu vermeiden.
  Es wird dringend empfohlen, 2048 bits oder mehr zu benutzen.`,
  ERR_TLS_HANDSHAKE_TIMEOUT: String.raw`HTTPS: Ein TLS/SSL handshake dauerte zu lange.
  In diesem Fall muss der Server die Verbindung abbrechen.`,
  ERR_TLS_INVALID_PROTOCOL_VERSION: String.raw`HTTPS: Falsche Protokoll Version.
  Gültige TLS Versionen sind 'TLSv1', 'TLSv1.1', or 'TLSv1.2'.`,
  ERR_TLS_PROTOCOL_VERSION_CONFLICT: String.raw`HTTPS: Der Versuch, eine TLS minVersion
  oder maxVersion zu setzen, steht in Konflikt mit dem expliziten Setzen von secureProtocol.
  Benutze nur einen der beiden Mechanismen.`,
  ERR_TLS_RENEGOTIATE: String.raw`HTTPS: Ein Versuch, die TLS Session neu aufzubauen,
  schlug fehl (TLS-Renegotiate).`,
  ERR_TLS_RENEGOTIATION_DISABLED: String.raw`HTTPS: Ein Versuch, die TLS Session an
  eine Instanz ohne TLS weiterzugeben, schlug fehl.`,
  ERR_TLS_REQUIRED_SERVER_NAME: String.raw`HTTPS: Bei der Benutzung von TLS wurde die
  server.addContext() Methode aufgerufen, aber der ersten Parameter ist kein Hostname.`,
  ERR_TLS_SESSION_ATTACK: String.raw`HTTPS: Ein übetriebenes Vorkommen von TLS
  renegotiations wurde entdeckt. Dies ist ein möglicher Vektor für DoS-Attacken.`,
  ERR_TLS_SNI_FROM_SERVER: String.raw`HTTPS: Es wurde versucht, eine Server Name Indication
  (SNI) serverseitig auszustellen, die nur in einem Client gültig ist.`,

  writeErr: `Sorry. Es scheint, wir können in dem Ordner, den wir gerade erstellt haben, nicht speichern.`,
  writeHint: `Stelle sicher, daß _{directory} beschreibbar ist für "_{user}"`,

  cNoPWerr: `Sorry. Du hast keine "PW" Umgebungsvariable angegeben, als Du den ${brand} Server gestartet hast !`,
  cNoPWerr2: `Starte den Server so: 'PW="MEINSuperPasswortHIER" node server'`,
  cCLI: `Möchtest Du die ${brand} CLI starten?`,
  cWorks: `Funktioniert perfekt. Du kannst jetzt alle Credentials für ${brand} verwalten.`,
  cFoundCred: `Bekannte Provider Zugangsdaten gefunden`,
  cFoundNot: `Noch nicht installiert`,
  cFoundAll: `Alle Provider installiert`,

  qWhat: `Was ist der Wert für`,
  qPw: `Wie lautet Dein Passwort ?`,
  pwConfirm: `Gib Dein Passwort zur Bestätigung erneut ein:`,
  qAction: `Was möchtest Du tun ?`,
  qaCreate: `Erstelle neue Zugangsdaten`,
  qsCreate: `Neue Zugangsdaten`,
  qaEdit: `Bearbeite existierende Zugangsdaten`,
  qsEdit: `Bearbeite Zugangsdaten`,
  qaQuit: `Beenden`,
  qaNewP: `Neuer (unbekannter) Provider`,
  qProviderID: `Für welche Provider API möchtest Du Zugangsdaten erstellen ?`,
  qproviderIDtba: `Wie soll der Provider heissen ?`,
  qCanHelp: `Können wir helfen, Zugangsdaten zu sammeln für`,
  qcHelp: `Ja, bitte helft.`,
  qcNoHelp: `Nein, ich habe die Zugangsdaten.`,
  qcHelpGet: `Bekomme die Daten auf`,
  qcOpenPage: `Öffne die Entwicklerseite.`,
  qsOpenPage: `Öffnen der Webseite ...`,
  qcGoOn: `Weiter, ich habe die Zugangsdaten.`,
  qApiKey: `Wie ist dein 'API key' ? (zusätzlicher Provider Parameter)`,
  qMail: `Wie lautet die eMail Adresse von der wir senden ?`,
  qName: `Wer soll als Absender angezeigt werden ?`,
  qHost: `Welcher SMTP host wird benutzt ?`,
  qHostNote: `Achtung: Könnte vom eMail-Adressen-Host abweichen. Siehe Provider docs ...`,
  qPort: `Welcher SMTP port wird benutzt @`,
  qNote: `Möchtest Du eine kurze Notiz in den Zugangsdaten hinterlassen, nur für Dich ?`,
  qNoNote: `Nö, alles gut!`,
  qeProviderID: `Welchen Provider möchtest Du bearbeiten ?`,
  qProviderEdit: `Was möchtest Du ändern ?`,
  qeKS: `Key und Secret`,
  qsKS: `Zugangsdaten`,
  qeAll: `Beliebige Eigenschaften`,
  qsAll: `beliebig`,
  qeAdd: `Eigenschaft hinzufügen`,
  qsAdd: `Eigenschaft hinzufügen`,
  qeNo: `Nichts`,
  qProviderAddKey: `Welche Eigenschaft sollen wir hinzufügen ?`,
  qProviderAddValue: `Was ist der Wert für`,
  qProviderAddAnother: `Add another property ?`,
  qProviderNewValue: `Was ist der neue Wert für`,
  vPW: `Dein Passwort`,
  vSc: `erzielt`,
  vLength: `Der Wert für _{key} muss mindestens _{length} Buchstaben lang sein.`,
  vMaxLength: `Der Wert für _{key} darf nicht länger als _{length} Buchstaben sein.`,
  vNoCred: `Konnte keine Zugangsdaten finden.`,
  vNotFoundCred: `Konnte einige Zugangsdaten nicht finden`,
  vInvalidCred: `Einige Zugangsdaten waren ungültig`,
  vHintCred: `Starte das Command Line Utility (CLI) um Details anzuzeigen und sie zu erstellen.`,
  vWrongPw: `Konnte das Passwort nicht verifizieren.`,
  vExistsP: `Sorry. Ein Provider mit diesem Namen ist schon installiert.\nWähle einen anderen Namen.`,
  vPrimaryP: `Sorry. Dies ist ein reservierter Name eines ${brand} Providers.\nFüge ein suffix zu.`,
  vEmail: `Das sieht nicht wie eine gültige Adresse aus.`,
  vAddKey: `Dies ist eine readOnly Eigenschaft.`
};

export default messages;
