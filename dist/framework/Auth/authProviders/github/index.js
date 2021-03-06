"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const locales = {
    de: () => Promise.resolve().then(() => require('./de'))
};
const provider = {
    id: 'github',
    title: 'GitHub',
    scope: 'user',
    authUrl: 'https://github.com/login/oauth/authorize',
    accessUrl: 'https://github.com/login/oauth/access_token',
    me: {
        templates: [
            '{protocol:5}://{www:3.*}github.com{/userId,path*}{?tab}'
        ],
        target: "https://github.com{/userId}"
    },
    verify: {
        url: 'https://api.github.com/user',
        meta: { userId: '/login', userMe: '/blog' }
    },
    setUrl: true,
    description: 'Build software better, together.\nWe\’re supporting a community where more ' +
        'than 15 million people learn, share, and work together to build software.',
    setup: {
        instructions: 'Please note: Open the developer page and "Register a new application" ...',
        key: 'Consumer Key (API Key)',
        secret: 'Consumer Secret (API Secret)',
        url: 'https://github.com/settings/developers'
    },
    svg: '<circle fill="#3E373C" cx="224" cy="224" r="224"/> <circle fill="#000000" cx="224" cy="224" ' +
        'r="204"/> <path fill="#FFFFFF" d="M143.443,236.848c9.585,17.081,28.069,27.704,59.248,30.646c-4.452,' +
        '3.312-9.797,9.604-10.533,16.876c-5.597,3.554-16.846,4.725-25.596,2.019c-12.258-3.803-16.949-' +
        '27.618-35.304-24.226c-3.976,0.735-3.187,3.312,0.252,5.49c5.594,3.554,10.862,7.997,14.923,17.46c3.12,' +
        '7.268,9.675,20.251,30.414,20.251c8.229,0,13.994-0.969,13.994-0.969s0.156,18.541,0.156,25.755c0,8.309-' +
        '11.432,10.656-11.432,14.654c0,1.585,3.782,1.729,6.826,1.729c6.008,0,18.518-4.921,18.518-13.564c0-6.863,' +
        '0.112-29.952,0.112-33.99c0-8.826,4.824-11.624,4.824-11.624s0.6,47.133-1.15,53.452c-2.056,7.427-5.763,' +
        '6.372-5.763,9.688c0,4.928,15.056,1.207,20.046-9.604c3.859-8.432,2.167-54.66,2.167-54.66l4.119-0.086c0,' +
        '0,0.232,21.166,0.092,30.841c-0.145,10.02-0.836,22.688,5.229,28.673c3.981,3.926,16.899,10.814,16.899,' +
        '4.516c0-3.657-7.082-6.671-7.082-16.575V288c5.648,0,4.804,14.993,4.804,14.993l0.407,27.856c0,0-1.237,' +
        '10.146,11.193,14.396c4.377,1.505,13.769,1.909,14.203-0.607c0.445-2.533-11.299-6.303-11.404-14.164c-' +
        '0.063-4.787,0.222-7.586,0.222-28.423c0-20.825-2.854-28.53-12.785-34.667c30.653-3.097,49.633-10.534,' +
        '58.877-30.47c0.726,0.026,3.769-9.311,3.369-9.311c2.071-7.525,3.192-16.425,3.422-26.971c-0.058-28.577-' +
        '13.998-38.689-16.681-43.438c3.951-21.637-0.653-31.49-2.799-34.865c-7.896-2.759-27.481,7.095-38.174,' +
        '14.037c-17.453-5.006-54.312-4.521-68.137,1.294c-25.51-17.931-39.007-15.186-39.007-15.186s-8.72,' +
        '15.345-2.302,37.79c-8.395,10.497-14.647,17.924-14.647,37.608c0,11.097,1.329,21.021,4.33,29.688C138.927,' +
        '227.565,143.324,236.855,143.443,236.848z"/>'
};
exports.default = { locales, provider };
//# sourceMappingURL=index.js.map