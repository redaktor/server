"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const locales = ['de'];
const messages = {
    warning: "Warning",
    error: "Error",
    node: "requires node.js",
    _new: "new",
    _and: "and",
    yes: "yes",
    no: "no",
    chars: "characters",
    need: "You need",
    missing: "is missing at",
    eg: "e.g.",
    welcome: "welcome to your",
    thanks: "Thank You",
    comeback: "Come Back Soon!",
    bye: "Goodbye!",
    startServer: "Start your server as: > PW='yourpasswordhere' node server",
    noAgain: "No. Let me try again.",
    unknown: "An unknown error occured. Something went horribly wrong. Sorry!",
    cInstalled: "Awesome. You just installed IndieAuth",
    cCredDir: "We created the directory to store your provider credentials:",
    cPWnote1: "The next step is to choose your password for the IndieAuth server.",
    cPWnote2: "  You need the password to start your server because the credentials\n  will be encrypted !",
    cPWnote3: "Choose a really strong unique password ...",
    cPWerr: "Sorry. The passwords did not match.",
    cWriteErr: "Sorry. It seems we can\'t write in the folder we created.",
    cWriteHint: "Make sure that _{directory} is writable for \"_{user}\"",
    cNoPWerr: "Sorry. You did not enter a \"PW\" environment variable when you started the IndieAuth Server !",
    cNoPWerr2: "Start the server like 'PW=\"mySuperSecretPasswordHERE\" node server'",
    cCLI: "Do you want to enter the IndieAuth CLI ?",
    cWorks: "Works like a charm. You can now manage all the credentials for IndieAuth.",
    cFoundCred: "Found known provider credentials",
    cFoundNot: "Not installed yet",
    cFoundAll: "All providers installed",
    qWhat: "What is the ",
    qPw: "What is your password ?",
    qPwConfirmed: "Enter your password again to confirm it:",
    qAction: "What would you like to do ?",
    qaCreate: "Create new credentials",
    qsCreate: "New credentials",
    qaEdit: "Edit existing credentials",
    qsEdit: "Edit credentials",
    qaQuit: "Quit",
    qaNewP: "New (unknown) provider",
    qProviderID: "For which provider API do you want to add credentials ?",
    qproviderIDtba: "How should we name your provider ?",
    qCanHelp: "Can we help to collect your credentials for",
    qcHelp: "Yes, please help.",
    qcNoHelp: "No, I already got my credentials.",
    qcHelpGet: "Get it at",
    qcOpenPage: "Open the developer page.",
    qsOpenPage: "Opening web page ...",
    qcGoOn: "Go on, I got the credentials.",
    qApiKey: "What is your 'API key' ? (additional provider parameter)",
    qMail: "What is the eMail address to send from ?",
    qName: "What should we display as the sender ?",
    qHost: "Which SMTP host is used ?",
    qHostNote: "Note: May differ from the eMail address host. Refer to provider docs ...",
    qPort: "Which SMTP port is used @",
    qNote: "Would you like to leave a short note in the credentials just for you ?",
    qNoNote: "Nope, all good!",
    qeProviderID: "Which provider do you want to edit ?",
    qProviderEdit: "What do you want to change ?",
    qeKS: "Key and secret",
    qsKS: "credentials",
    qeAll: "All properties",
    qsAll: "anything",
    qeAdd: "Add property",
    qsAdd: "add property",
    qeNo: "Nothing",
    qProviderAddKey: "Which property should we add ?",
    qProviderAddValue: "What is the value for",
    qProviderAddAnother: "Add another property ?",
    qProviderNewValue: "What is the new value for",
    vPW1: "Sorry, this appetizer is much to weak",
    vPW2: "Sorry, password is a bit to weak",
    vPW: "Your password",
    vSc: "scores",
    vLength: "The _{key} must be at least _{length} characters long.",
    vMaxLength: "The _{key} must not be more than _{length} characters long.",
    vNoCred: "Could not find any credentials.",
    vNotFoundCred: "Could not find some credentials",
    vInvalidCred: "Some credentials were invalid",
    vHintCred: "Start the Command Line Utility to show details and to create them.",
    vWrongPw: "Could not verify the password.",
    vExistsP: "Sorry. A provider with this name is already installed.\nChoose another name.",
    vPrimaryP: "Sorry. This is the primary name of an IndieAuth provider.\nAdd a suffix.",
    vEmail: "This does not look like a valid address.",
    vAddKey: "This is a readOnly property."
};
exports.default = { locales, messages };
//# sourceMappingURL=CLI.js.map