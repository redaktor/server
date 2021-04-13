/** PLEASE NOTE :
This secret is only used do sign and verify the loginToken which is decrypted anyway.
However: NEVER hardcode secrets like here. Build long secrets by strong random ...
ALL secrets MUST come from a safe source, for example nodeJS environment variables !
For convenience start the server with 1 password environment var. and build the others
from a safe password store …
*/ const LOGINSECRET = 'thisIsJust4aCheapExampleUsage / seeAbove';
const SESSIONSECRET = 'anotherCheapExampleUsage / seeAbove';

const fs = require('fs');
const path = require('path');
// sqlite saves to a file db here
const sqlite3 = require('sqlite3').verbose();
const dbPath = path.join(__dirname, 'LoginData.sqlite');
if (!fs.existsSync(dbPath)) { fs.openSync(dbPath, 'wx') }
var db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE);
//
const express = require('express');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const csurf = require('csurf');
const uuid = require('../../dist/framework/uuid.js').default; // optional use ...
const srp6a = require('../../dist/framework/PAKE/SRP/index.js');
const SRP = srp6a.Server;
const session = require('express-session');
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const csrfParser = csurf({ cookie: true });
const app = express();
app.set('trust proxy', 1) // trust first proxy
app.use( session({
  secret: SESSIONSECRET,
  name: 'sessionId',
  resave: true,
  saveUninitialized: false
}) );
app.use( helmet() );
app.use( cookieParser() );
app.use(function(req, res, next) { // set your CSP
  res.setHeader("Content-Security-Policy", "script-src 'self'");
  return next();
});
app.use('/static', express.static(path.join(__dirname, 'public')));
app.engine('html', require('ejs').renderFile);

db.serialize(function() {
  db.run("CREATE TABLE IF NOT EXISTS login (I TEXT PRIMARY KEY, identity TEXT, me TEXT)");
});
function dbGetID(I, cb) {
  const sql = `SELECT * FROM login WHERE I = ?`;
  db.get(sql, [I], (err, row) => (err || !row) ? cb(err) : cb(null, row && row.me))
}
function dbGetUserIdentity(identity, cb) {
  const sql = `SELECT * FROM login WHERE identity = ?`;
  db.get(sql, [identity], (err, row) => (err || !row) ? cb(err) : cb(null, row && row.me))
}
function dbPut(I, v, cb) {
  const sql = `UPDATE login SET me = ? WHERE I = ?`;
  db.run(sql, [v, I], (err) => err ? cb(err) : cb(null, v))
}
function dbInsert(I, identity, v, cb) {
  dbGetUserIdentity(identity, function(e, row) {
    if (!!row) { return cb('User already exists') }
    const sql = `INSERT INTO login(I,identity,me) VALUES(?,?,?)`;
    db.run(sql, [I, identity, v], (err) => err ? cb(err) : cb(null, v))
  })
}

const dbCheck = (err) => { if (err) { throw err } }
const loginHint = `You can now attempt to authenticate at <a href="/login">the login page</a>.`;
const [REGISTER, AUTH, EVIDENCE, VERIFY, TOKEN] = [
  SRP.ACTION.R_REGISTER, SRP.ACTION.R_SRP_AUTH, SRP.ACTION.R_SRP_EVIDENCE,
  SRP.ACTION.R_SRP_VERIFY, SRP.ACTION.R_ID_TOKEN
]; // = 0,1,2,3,4 but let's be implicit ;)

/* Helping factories */
function sendFormHTML(view) {
  return (req, res) => res.render(view, {csrfToken:req.csrfToken()})
}
function sendFile(filename, contentType) {
  const root = path.resolve(__dirname, '../..');
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
      const credentials = SRP.parseJSON(req.body.credentials, { /*
        // If your forms have other fields, you need to allow them here ! Like:
        myFieldname: true, // or e.g. validate/transform the value with a function:
        myOtherFieldname: (value) => '!' + value
      */});
      const { I, action, identity, t } = credentials;
      if (allow.indexOf(action) < 0) { return res.sendStatus(400) }
      //console.log(SRP.ACTION[action], 'receives:', req.body.credentials);
      const DB_ID = uuid(I);
      if (action === REGISTER) {
        // REGISTER - PUT the registered user in DB :
        dbInsert(DB_ID, identity, JSON.stringify(credentials), function(e, v) {
          console.log('dbInsert', e, v);
          return !!e ? res.render('status.html', { status: e.message }) :
          res.render('status.html', {
            status: `Welcome ${identity}!</br>You can now attempt to authenticate
            at <h2><a href="/login">the login page</a></h2>`
          })
        })
        /*
        try {
          dbInsert(DB_ID, identity, JSON.stringify(credentials), dbCheck);
        } catch(e) {
          console.log('2',e)
          // FIXME TODO 'User already exists'
          return res.render('register.html', { status: e.message })
        }*/
      }
      // LOGIN - This will also handle 1) challenge and 3) evidence / verify token :
      // GET the registered user from DB
      dbGetID(DB_ID, function(err, me) {
        if (err) { return res.sendStatus(403) } // <-- TODO - UNREGISTERED USER
        me = JSON.parse(me);
        const result = (action === TOKEN) ? tokenExchange(req, me, t) :
          SRP.login({...me, ...credentials}, LOGINSECRET);
        const { secret, shared } = result;
        console.log(SRP.ACTION[action], 'stores:', secret, 'sends:', shared);
        // PUT secret result in DB and SEND shared result :
        dbPut(DB_ID, JSON.stringify(secret), dbCheck);
        res.status(200).json({...shared, href: '/home'})
      })
    } catch (e) {
      return res.sendStatus(400)
    }
  }
}
function tokenExchange(req, me, token) {
  try {
    const { secret, shared } = SRP.authorize(me, token, LOGINSECRET);
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
app.post('/register', urlencodedParser, csrfParser, srpParse([REGISTER]));
// LOGIN Page, Challenge/Login Post
app.get('/login', csrfParser, sendFormHTML('login.html'));
app.post('/login', urlencodedParser, csrfParser, srpParse([AUTH, EVIDENCE, VERIFY]));
// TOKEN Exchange, set logged in
app.post('/token', urlencodedParser, csrfParser, srpParse([TOKEN]));
// HOMEPAGE
app.get('/home', (req, res) => {
  if (!req.session.I) { return res.sendStatus(403) }
  res.render('status.html', {
    status: `<p class="success">Welcome ${req.session.identity}.
You have successfully authenticated!</br></p>`
  });
});
/*
function requireLogin(req, res, next) {
  if (req.session.loggedIn) {
    next(); // allow the next route to run
  } else {
    // require the user to log in
    res.redirect("/login"); // or render a form, etc.
  }
} */
const server = app.listen(8080, () => {
  console.log(`Node started on port 8080 in ${app.get('env')} mode`)
});
var exports = module.exports = { closeServer: function() { server.close() } };
