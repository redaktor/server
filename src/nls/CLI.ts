import System from '../CLI/shared/System';
const { brand, version } = System.kickstart();
/* TODO */ const dbDocs = '';

const locales = {
  de: () => import('./de/CLI')
};

const messages = {
  name: `${brand} Setup - v${version}`,
  yes: `yes`,
  no: `no`,
  eg: `e.g.`,
  node: `requires node.js`,
  _new: `new`,
  _and: `and`,
  warning: `Warning`,
  error: `Error`,
  chars: `characters`,
  needs: `You need`,
  missing: `is missing at`,
  welcome: `welcome to your`,
  thanks: `Thank You`,
  comeback: `Come Back Soon!`,
  prima: `Cool.`,
  bye: `Goodbye!`,
  startServer: `Start your server as: > PW='yourpasswordhere' node server`,
  again: `Let me try again.`,
  unknownErr: `An unknown error occured. Something went horribly wrong. Sorry!`,
  whatToDo: `What would you like to do?`,

  installed: `Awesome. You just installed ${brand}`,
  credDir: `We created the directory to store your provider credentials:`,

  pwFlow1: `The next step is to choose your first password for ${brand}.`,
  pwFlow2: `Choose a really strong unique password ...`,
  pwScore: `Your password must score at least `,
  pwRule: `At least 8 alphanumeric characters.`,
  pwHint: `Please use at least four random words and characters. Uncommon words are better.`,
  pwType: `While typing`,
  pwMask: `mask passwords`,
  pwShow: `show passwords`,
  pwCErr: `Sorry. The passwords did not match.`,
  pwErr1: `Sorry, this is much too weak:`,
  pwErr2: `Sorry, the password is a bit too weak:`,

  dbFlow1: `Now just connect to a database.`,
  dbFlow2: `Read also ${dbDocs}`, // TODO
  dbType: `Select the type of the database`,
  dbName: `Database name`,
  dbPath: `Database path -  For example "./mydb.sql"`,
  dbHost: `Database host`,
  dbPort: `Database host port`,
  dbUser: `Database username`,
  dbPass: `Database password`,
  dbSchema: `Schema name`,
  dbErr1: `Hm, we could not connect to your database yet.`,
  dbErr2: `Argh, we can't connect. Please correct the settings.`,
  dbExtra: `Enter extended database settings.`,

  ERR_TLS_CERT_ALTNAME_INVALID: String.raw`HTTPS: While using TLS, the hostname/IP
  of the peer did not match any of the subjectAltNames in its certificate.`,
  ERR_TLS_DH_PARAM_SIZE: String.raw`HTTPS: While using TLS, the parameter offered
  for the Diffie-Hellman (DH) key-agreement protocol is too small.
  By default, the key length must be greater than or equal to 1024 bits to avoid
  vulnerabilities, even though it is strongly recommended to use 2048 bits or
  larger for stronger security.`,
  ERR_TLS_HANDSHAKE_TIMEOUT: String.raw`HTTPS: A TLS/SSL handshake timed out.
  In this case, the server must also abort the connection.`,
  ERR_TLS_INVALID_PROTOCOL_VERSION: String.raw`HTTPS: Wrong protocol version.
  Valid TLS versions are 'TLSv1', 'TLSv1.1', or 'TLSv1.2'.`,
  ERR_TLS_PROTOCOL_VERSION_CONFLICT: String.raw`HTTPS: Attempting to set a
  TLS protocol minVersion or maxVersion conflicts with an attempt to set the
  secureProtocol explicitly. Use one mechanism or the other.`,
  ERR_TLS_RENEGOTIATE: `HTTPS: An attempt to renegotiate the TLS session failed.`,
  ERR_TLS_RENEGOTIATION_DISABLED: String.raw`HTTPS: An attempt was made to
  renegotiate TLS on a socket instance with TLS disabled.`,
  ERR_TLS_REQUIRED_SERVER_NAME: String.raw`HTTPS: While using TLS, the server.addContext()
  method was called without providing a hostname in the first parameter.`,
  ERR_TLS_SESSION_ATTACK: String.raw`HTTPS: An excessive amount of TLS renegotiations
  is detected, which is a potential vector for denial-of-service attacks.`,
  ERR_TLS_SNI_FROM_SERVER: String.raw`HTTPS: An attempt was made to issue Server Name
  Indication from a TLS server-side socket, which is only valid from a client.`,

  writeErr: `Sorry. It seems we can\'t write in the folder we created.`,
  writeHint: `Make sure that _{directory} is writable for "_{user}"`,

  cNoPWerr: `Sorry. You did not enter a "PW" environment variable when you started the ${brand} Server !`,
  cNoPWerr2: `Start the server like 'PW="mySuperSecretPasswordHERE" node server'`,
  cCLI: `Do you want to enter the ${brand} CLI ?`,
  cWorks: `Works like a charm. You can now manage all the credentials for ${brand}.`,
  cFoundCred: `Found known provider credentials`,
  cFoundNot: `Not installed yet`,
  cFoundAll: `All providers installed`,

  qWhat: `What is the`,
  qPw: `What is your password ?`,
  pwConfirm: `Enter your password again to confirm it:`,
  qAction: `What would you like to do ?`,
  qaCreate: `Create new credentials`,
  qsCreate: `New credentials`,
  qaEdit: `Edit existing credentials`,
  qsEdit: `Edit credentials`,
  qaQuit: `Quit`,
  qaNewP: `New (unknown) provider`,
  qProviderID: `For which provider API do you want to add credentials ?`,
  qproviderIDtba: `How should we name your provider ?`,
  qCanHelp: `Can we help to collect your credentials for`,
  qcHelp: `Yes, please help.`,
  qcNoHelp: `No, I already got my credentials.`,
  qcHelpGet: `Get it at`,
  qcOpenPage: `Open the developer page.`,
  qsOpenPage: `Opening web page ...`,
  qcGoOn: `Go on, I got the credentials.`,
  qApiKey: `What is your 'API key' ? (additional provider parameter)`,
  qMail: `What is the eMail address to send from ?`,
  qName: `What should we display as the sender ?`,
  qHost: `Which SMTP host is used ?`,
  qHostNote: `Note: May differ from the eMail address host. Refer to provider docs ...`,
  qPort: `Which SMTP port is used @`,
  qNote: `Would you like to leave a short note in the credentials just for you ?`,
  qNoNote: `Nope, all good!`,
  qeProviderID: `Which provider do you want to edit ?`,
  qProviderEdit: `What do you want to change ?`,
  qeKS: `Key and secret`,
  qsKS: `credentials`,
  qeAll: `All properties`,
  qsAll: `anything`,
  qeAdd: `Add property`,
  qsAdd: `add property`,
  qeNo: `Nothing`,
  qProviderAddKey: `Which property should we add ?`,
  qProviderAddValue: `What is the value for`,
  qProviderAddAnother: `Add another property ?`,
  qProviderNewValue: `What is the new value for`,
  vPW: `Your password`,
  vSc: `scores`,
  vLength: `The _{key} must be at least _{length} characters long.`,
  vMaxLength: `The _{key} must not be more than _{length} characters long.`,
  vNoCred: `Could not find any credentials.`,
  vNotFoundCred: `Could not find some credentials`,
  vInvalidCred: `Some credentials were invalid`,
  vHintCred: `Start the Command Line Utility to show details and to create them.`,
  vWrongPw: `Could not verify the password.`,
  vExistsP: `Sorry. A provider with this name is already installed.\nChoose another name.`,
  vPrimaryP: `Sorry. This is the primary name of an ${brand} provider.\nAdd a suffix.`,
  vEmail: `This does not look like a valid address.`,
  vAddKey: `This is a readOnly property.`,
  seePwned: `https://haveibeenpwned.com/Passwords`
};

export default { locales, messages };
