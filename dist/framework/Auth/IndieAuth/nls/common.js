"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const main_1 = require("@dojo/framework/has/main");
const bundlePath = ((main_1.default('host-node') ? __dirname : 'src/Auth/IndieAuth/nls') + '/common');
const locales = ['de'];
const messages = {
    _yes: 'Yes',
    _no: 'No',
    _try: 'Try It!',
    _domainStub: 'yourdomain.com',
    _signIn: 'Sign In',
    _start: 'Get Started',
    _sample: 'Sample Code',
    _profile: 'Profile',
    _profiles: 'Profiles',
    _setupInstructions: 'Setup Instructions',
    navDev: 'Developers',
    navFAQ: 'FAQ',
    navSetup: 'Setup',
    title: 'IndieAuth',
    description: 'Sign in with your domain name',
    footerWhy: 'Why the Indie Web?',
    footerStart: 'Getting Started',
    footerList: 'List of Projects',
    footerHistory: 'The History of IndieAuth',
    footerMfs: 'Microformats',
    footerCom: 'Community'
};
exports.default = { bundlePath, locales, messages };
//# sourceMappingURL=common.js.map