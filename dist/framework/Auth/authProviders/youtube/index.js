"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const locales = {
    de: () => Promise.resolve().then(() => require('./de')),
    es: () => Promise.resolve().then(() => require('./es')),
    fr: () => Promise.resolve().then(() => require('./fr')),
    zh: () => Promise.resolve().then(() => require('./zh'))
};
const provider = {
    id: 'youtube',
    title: 'YouTube',
    scope: 'https://www.googleapis.com/auth/youtube.readonly',
    authUrl: 'https://accounts.google.com/o/oauth2/auth',
    accessUrl: 'https://www.googleapis.com/oauth2/v4/token',
    me: {
        templates: [
            '{protocol:5}://{www:3.*}youtube.com/c{/userId,path*}',
            '{protocol:5}://{www:3.*}youtube.com{/userId,path*}',
        ],
        target: 'https://www.youtube.com/{+userId}'
    },
    verify: {
        url: 'https://www.googleapis.com/youtube/v3/channels',
        query: {
            mine: true,
            part: 'id,snippet'
        },
        set: {
            result: (provider, oauth) => {
                return ((res) => {
                    console.log('ID', res.data.items[0].id);
                    res.data.userId = res.data.items[0].id;
                    res.data.profileUrl = 'https://youtube.com/channel/' + res.data.userId;
                    if (provider.userId.slice(0, 1) === '+') {
                        let uid = provider.userId.toLowerCase().slice(1);
                        if (uid === res.data.items[0].snippet.customUrl) {
                            res.data.userId = provider.userId;
                        }
                    }
                    return res;
                });
            }
        },
        meta: { userId: '/userId' }
    },
    description: 'Broadcast Yourself',
    setup: {
        instructions: 'Please note: Open the developer page and create your credentials...\n' +
            'Make sure that YouTube API is enabled for your application.',
        key: 'Client-ID',
        secret: 'Clientkey',
        url: 'https://console.developers.google.com/apis/credentials'
    },
    svg: '<circle fill="#3E373C" cx="224" cy="224" r="224"/>' +
        '<circle fill="#FFFFFF" cx="224" cy="224" r="204"/>' +
        '<g><path fill="#010101" d="M180.914,267.864h-12.889v-7.461c-4.885,5.6-9.026,8.428-13.546,8.428c-3.959,0-6.711-1.867-8.089-5.244' +
        'c-0.837-2.053-1.429-5.258-1.429-9.968v-54.274h12.886v50.882v4.745c0.302,1.903,1.112,2.604,2.748,2.604' +
        'c2.468,0,4.7-2.144,7.428-5.994v-52.236h12.89L180.914,267.864L180.914,267.864z M135.463,246.156c0,7.279-1.199,12.311-3.8,15.736' +
        'c-3.435,4.676-9.09,7.148-14.52,7.148c-5.425,0-10.987-2.473-14.417-7.148c-2.639-3.426-3.898-8.457-3.898-15.736l0.012-24.365' +
        'c0-7.319,1.416-12.877,4.058-16.34c3.428-4.686,8.102-6.606,14.246-6.606c5.428,0,10.812,1.921,14.246,6.606' +
        'c2.6,3.463,4.071,8.96,4.071,16.279v24.426H135.463z M122.579,220.376c0.679-6.787-1.43-9.963-5.434-9.963' +
        'c-4.002,0-6.104,3.176-5.425,9.963v27.138c-0.679,6.784,1.422,10.151,5.422,10.151c4.004,0,6.108-3.367,5.431-10.151' +
        'L122.579,220.376z M101.543,176.281H87.295l-9.474,35.736l-9.519-35.736H54.057c2.898,8.527,16.958,54.271,16.958,54.271v37.312' +
        'h13.571v-37.312L101.543,176.281z"/>' +
        '<g><path fill="#D82532" d="M364.078,218.396c0-6.268-1.619-8.151-5.689-8.151c-4.104,0-5.843,1.728-5.843,8.07v7.5l11.532-0.014' +
        'V218.396z M313.484,210.245c-2.021,0-4.337,1.066-6.392,3.095l-0.013,41.142c2.051,2.055,4.384,3.094,6.404,3.094' +
        'c3.542,0,5.143-2.601,5.143-9.384v-29.17C318.627,212.234,317.026,210.245,313.484,210.245z M391.921,183.681' +
        'c0,0-1.979-13.896-8.053-20.016c-7.702-8.033-16.335-8.072-20.298-8.543c-28.348-2.041-70.867-2.041-70.867-2.041h-0.092' +
        'c0,0-42.521,0-70.867,2.041c-3.96,0.468-12.592,0.51-20.298,8.543c-6.075,6.119-8.051,20.016-8.051,20.016' +
        's-2.027,16.318-2.027,32.639v15.3c0,16.318,2.027,32.639,2.027,32.639s1.976,13.896,8.051,20.015' +
        'c7.705,8.033,17.829,7.78,22.335,8.621c16.207,1.546,68.873,2.025,68.873,2.025s42.565-0.062,70.916-2.101' +
        'c3.961-0.474,12.593-0.513,20.296-8.546c6.072-6.119,8.054-20.015,8.054-20.015s2.023-16.32,2.023-32.639v-15.3' +
        'C393.943,199.999,391.921,183.681,391.921,183.681z M235.861,267.864h-13.564v-78.016h-14.246v-12.873l42.737-0.016v12.889' +
        'h-14.927V267.864z M284.71,267.864h-12.89v-7.461c-4.886,5.6-9.027,8.428-13.544,8.428c-3.962,0-6.713-1.867-8.089-5.244' +
        'c-0.842-2.053-1.436-5.258-1.436-9.968v-53.593h12.892v54.948c0.301,1.904,1.108,2.601,2.746,2.601' +
        'c2.469,0,4.701-2.144,7.427-5.994v-51.555h12.891v67.838H284.71z M331.514,247.514c0,6.267-0.534,10.693-1.354,13.566' +
        'c-1.641,5.042-5.214,7.663-10.104,7.663c-4.365,0-8.838-2.631-12.942-7.708l-0.02,6.829h-12.209V176.96h12.209l-0.013,29.639' +
        'c3.967-4.883,8.457-7.661,12.975-7.661c4.891,0,8.179,2.828,9.818,7.901c0.819,2.726,1.641,7.115,1.641,13.537V247.514' +
        'L331.514,247.514z M358.503,257.572c3.022,0,4.784-1.645,5.485-4.925c0.114-0.668,0.092-3.602,0.092-8.527h12.89v1.924' +
        'c0,3.956-0.325,6.758-0.438,7.987c-0.414,2.722-1.376,5.185-2.87,7.358c-3.399,4.923-8.439,7.35-14.854,7.35' +
        'c-6.423,0-11.316-2.312-14.866-6.944c-2.609-3.395-4.281-8.438-4.281-15.639v-23.745c0-7.246,1.521-12.847,4.129-16.272' +
        'c3.554-4.641,8.445-7.096,14.714-7.096c6.163,0,11.052,2.455,14.491,7.096c2.568,3.426,3.997,8.73,3.997,15.975l0.002,13.865' +
        'h-24.447v12.184C352.502,254.419,354.284,257.572,358.503,257.572z"/></g></g>'
};
exports.default = { locales, provider };
//# sourceMappingURL=index.js.map