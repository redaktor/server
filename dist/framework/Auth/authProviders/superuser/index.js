"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _stacknetwork_1 = require("../_stacknetwork");
const provider = Object.assign(Object.assign({}, _stacknetwork_1.default), {
    id: 'superuser',
    title: 'superuser',
    me: {
        templates: [
            '{protocol:5}://{www:3.*}superuser.com/users{/userId,aliasName,path*}{?tab}'
        ],
        target: 'https://superuser.com/users{/userId}{/aliasName}',
        query: { tab: 'profile' }
    },
    verify: {
        set: {
            options: _stacknetwork_1.default._verifyOptions,
            result: (provider, oauth) => {
                return ((res) => { res.data.userId = res.data.items[0].user_id.toString(); return res; });
            }
        },
        meta: { userId: '/userId', userMe: '/items/0/website_url' }
    },
    setup: {
        instructions: 'StackExchange maintains a unified API for all network pages.' +
            'Please note: Open the developer page and "Register Your V2.0 Application"',
        key: 'Client Id',
        secret: 'Client Secret',
        additionalProperties: [
            {
                type: 'input',
                name: 'provider_apiKey',
                message: function () { return this.msg('qApiKey'); },
                when: function (o) { return (o.providerID === 'superuser'); }
            }
        ],
        url: 'http://stackapps.com/apps/oauth/register'
    },
    description: 'Super User is a question and answer site for computer enthusiasts ' +
        'and power users. A StackExchange network site.',
});
exports.default = { provider };
//# sourceMappingURL=index.js.map