/** PLEASE NOTE :
This secret is only used do sign and verify the loginToken which is decrypted anyway.
However: NEVER hardcode secrets like here. Build long secrets by strong random ...
ALL secrets MUST come from a safe source, for example nodeJS environment variables !
For convenience start the server with 1 password environment var. and build the others
from a safe password store …
*/
const path = require('path');
const express = require('express');
const session = require('express-session');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const csurf = require('csurf');
// memdown is an in memory db that disappears when you restart the process
const memdown = require('memdown');
const db = new memdown('srp');
const uuid = require('../../dist/framework/uuid.js').default; // optional use ...
const SRP = require('../../dist/framework/PAKE/SRP/').Server;

const urlencodedParser = bodyParser.urlencoded({ extended: false });
const csrfParser = csurf({ cookie: true });
const app = express();

const dbCheck = (err) => { if (err) { throw err } }
const [REGISTER, AUTH, EVIDENCE, VERIFY, TOKEN] = [
  SRP.ACTION.R_REGISTER, SRP.ACTION.R_SRP_AUTH, SRP.ACTION.R_SRP_EVIDENCE,
  SRP.ACTION.R_SRP_VERIFY, SRP.ACTION.R_ID_TOKEN
]; // = 0,1,2,3,4 but let's be implicit ;)

/* Helping factories */
function sendFormHTML(view) {
  return (req, res) => {
    const serverPEM = app.get('PEMS').server;
    return res.render(view, {
      publicKey: serverPEM.public,
      csrfToken: req.csrfToken()
    })
  }
}
function sendFile(filename, contentType) {
  const root = path.join(__dirname, '../..');
  return (req, res) => res.set('Content-Type', contentType) && res.sendFile(filename, {root});
}
function sendCSSfile(filename) { return sendFile(filename, 'text/css') }
function sendJSfile(filename) { return sendFile(filename, 'application/javascript') }
function sendJScode(code) {
  return (req, res) => res.set('Content-Type', 'application/javascript') && res.send(code);
}
// times: R_SRP_AUTH 800ms, R_SRP_EVIDENCE 1700ms, R_SRP_VERIFY 800ms, R_ID_TOKEN 5ms
function srpParse(allow) {
  return (req, res, next) => {
    if (!req.body || !req.body.credentials) { return res.sendStatus(400) }
    /* Allows us to use the same route and logic for all POSTs */
    try {
      const KEY = app.get('privateKey');
      const credentials = SRP.parseJSON(req.body.credentials, KEY, {
        /* If your forms have other fields, you need to allow them here ! Like:
        myFieldname: true, // or e.g. validate/transform the value with a function:
        myOtherFieldname: (value) => '!' + value */
      });
      const { I, action, identity, t } = credentials;
      console.log(SRP.ACTION[action], 'receives:', req.body.credentials);
      if (allow.indexOf(action) < 0) { return res.sendStatus(400) }
      const DB_ID = uuid(identity);
      if (action === REGISTER) {
        // REGISTER - PUT the registered user in DB :
        db.put(DB_ID, JSON.stringify(credentials), dbCheck);
        req.session.identity = identity;
        return res.status(200).json({status: 'OK', href: '/register/ok'});
      }
      // LOGIN - This will also handle 1) challenge and 3) evidence / verify token :
      // GET the registered user from DB
      db.get(DB_ID, { asBuffer: false }, (err, me) => {
        if (err) { return res.sendStatus(403) } // <-- TODO - UNREGISTERED USER
        me = JSON.parse(me);
        //console.log('me',me,'credentials',credentials);
        const { secret, shared } = (action === TOKEN) ? tokenExchange(req, me, t) :
          SRP.login({...me, ...credentials}, process.env.SRP_secret);
        console.log(SRP.ACTION[action], 'stores:', secret, 'sends:', shared);
        // PUT secret result in DB and SEND shared result :
        db.put(DB_ID, JSON.stringify(secret), dbCheck);
        res.status(200).json({...shared, href: '/home'})
      })
    } catch (e) {
      console.log(e)
      return res.sendStatus(400)
    }
  }
}
function tokenExchange(req, me, token) {
  try {
    const { secret, shared } = SRP.authorize(me, token, process.env.SRP_secret);
    /* At this point the user is authorized and 'me' is ready.
    Implement your own token logic like assigning permissions here.
    We just set the user and redirect to /home */
    req.session.I = me.I;
    req.session.identity = me.identity;
    return { secret, shared }
  } catch(e) {
    return res.sendStatus(400)
  }
}

// ROUTES
app.get('/', (req, res) => res.render('index.html'));
// here we are loading the SRP client library directly from the local dist
app.get('/browser.js', sendJSfile('./dist/framework/PAKE/SRP/browser.bundle.js'));
// here we are loading minimal CSS directly from the local dist
app.get('/milligram.css', sendCSSfile('./examples/SRP/public/milligram.css'));
// here we are sending the SRP client status function covered by CSP
app.get('/status.js', sendJScode(`(window.addEventListener("load", function loadStatus() {
  window.removeEventListener("load", loadStatus, false);
  SRP.Browser.status = function(_s, p){
    var out = document.querySelector('output');
    var cssCl = p === -1 ? 'error' : (p === 100 ? 'success' : '');
    var s = '<span class="'+cssCl+'">' + (p === -1 ? '⚠️ ' : '✅ ') + _s + '</span><br>';
    out.innerHTML = out.innerHTML + s;
  }
}))`));

// REGISTER Page and Register Post
app.get('/register', csrfParser, sendFormHTML('register.html'));
app.get('/register/ok', (req, res) => res.render('status.html', {
  status: `<p>Welcome ${req.session.identity}!</br>You can now attempt to authenticate
  at</p><h2><a href="/login">the login page</a></h2>`
}))
app.post('/register', urlencodedParser, csrfParser, srpParse([REGISTER]));
// LOGIN Page, Challenge/Login Post
app.get('/login', csrfParser, sendFormHTML('login.html'));
app.post('/login', urlencodedParser, csrfParser, srpParse([AUTH, EVIDENCE, VERIFY]));
// TOKEN Exchange, set logged in
app.post('/token', urlencodedParser, csrfParser, srpParse([TOKEN]));
// HOMEPAGE
app.get('/home', (req, res) => {
  if (!req.session.I) { return res.sendStatus(403) }
  // TODO AUTH TOKEN ETC. !
  res.render('status.html', {
    status: `<p class="success">Welcome ${req.session.identity}.
You have successfully authenticated!</br></p>`
  })
});

var exports = module.exports = { closeServer: function() { server.close() } };
SRP.getCredentials().then(() => {
  app.set('trust proxy', 1) // trust first proxy
  app.use( session({
    secret: process.env.SRP_sessionsecret,
    name: 'sessionId',
    resave: true,
    saveUninitialized: false
  }) );
  app.listen(parseInt(process.env.SRP_port), function(){
    console.log(`Server started on port 8080 in ${app.get('env')} mode`)
  })
});
