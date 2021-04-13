"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function Actors(Action, includePerson = true) {
    const act = Action.toLowerCase();
    const actors = [
        [`${Action}:Actor`, `The actor can ${act} other Actors`],
        [`${Action}:Actor:Application`, `The actor can ${act} Applications`],
        [`${Action}:Actor:Group`, `The actor can ${act} Groups`],
        [`${Action}:Actor:Organization`, `The actor can ${act} Organizations`],
        [`${Action}:Actor:Service`, `The actor can ${act} Services`]
    ];
    if (!!includePerson) {
        actors.push([`${Action}:Actor:Person`, `The actor can ${act} Persons`]);
    }
    return actors;
}
function Objects(Action) {
    const act = Action.toLowerCase();
    return [
        [`${Action}:Object`, `The actor can ${act} Objects`],
        [`${Action}:Object:Article`, `The actor can ${act} Articles`],
        [`${Action}:Object:Audio`, `The actor can ${act} Audio`],
        [`${Action}:Object:Event`, `The actor can ${act} Events`],
        [`${Action}:Object:Image`, `The actor can ${act} Images`],
        [`${Action}:Object:Note`, `The actor can ${act} Notes`],
        [`${Action}:Object:Page`, `The actor can ${act} Pages`],
        [`${Action}:Object:Place`, `The actor can ${act} Places`],
        [`${Action}:Object:Video`, `The actor can ${act} Videos`]
    ];
}
function Links(Action) {
    const act = Action.toLowerCase();
    return [
        [`${Action}:Link`, `The actor can ${act} Links`],
        [`${Action}:Link:Mention`, `The actor can ${act} Mentions`]
    ];
}
function Redaktor(Action) {
    const act = Action.toLowerCase();
    return [
        [`${Action}:Plugin`, `The actor can ${act} redaktor plugins`],
        [`${Action}:Plugin:Menu`, `The actor can ${act} menu items and edit menus.`],
        [`${Action}:Theme`, `The actor can ${act} redaktor themes`],
        [`${Action}:Bookmark`, `The actor can ${act} redaktor bookmarks`]
    ];
}
const ID_PERMISSION = new Map();
exports.PERMISSIONS = [
    [`*`, `The unique Owner can do everything on the site.`],
    [`Accept`, `The actor can accept objects (includes Reject)`],
    [`Add`, `The actor can add objects to targets (e.g. Collections)`],
    [`Announce`, `The actor can call the target's attention (e.g. for "Status Messages")`],
    [`Block`, `The actor can block Objects, Actors or redaktor items (see also Ignore)`],
    [`Block:Domain`, `The actor can block a complete domain`],
    [`Block:User`, `The actor can block a complete local user`],
    ...Actors('Block'),
    ...Objects('Block'),
    [`BlockGlobal`, `The actor can block complete domains or Actors instance-wide`],
    [`Create`, `The actor can create objects, actors or redaktor items`],
    ...Links('Create'),
    ...Actors('Create'),
    ...Objects('Create'),
    ...Redaktor('Create'),
    [`Delete`, `The actor can delete objects, actors or redaktor items`],
    ...Links('Delete'),
    ...Actors('Delete'),
    ...Objects('Delete'),
    ...Redaktor('Delete'),
    [`Flag`, `The actor can report content as being inappropriate`],
    [`Flag:Domain`, `The actor can report a complete domain as being inappropriate`],
    [`Flag:User`, `The actor can report a complete local user as being inappropriate`],
    ...Actors('Flag'),
    ...Objects('Flag'),
    [`Follow`, `The actor can manage relationships (this includes Ignore and Block)`],
    ...Actors('Follow'),
    [`Ignore`, `The actor can ignore Objects, Actors or redaktor items (see also Block)`],
    [`Ignore:Domain`, `The actor can ignore a complete domain`],
    [`Ignore:User`, `The actor can ignore a complete local user`],
    ...Actors('Ignore'),
    ...Objects('Ignore'),
    [`Invite`, `The actor can extend an invitation for the object to the target`],
    ...Actors('Invite'),
    ...Objects('Invite'),
    [`Join`, `The actor can join the object (includes Leave)`],
    ...Actors('Join', false),
    ...Objects('Join'),
    [`Like`, `The actor can like or endorse the object (includes Dislike)`],
    ...Objects('Like'),
    [`Move`, `The actor can move objects from origins to targets (e.g. Collections)`],
    [`Offer`, `The actor can offer objects to targets`],
    [`Question`, `The actor can ask or create Polls`],
    [`Read`, `The actor can read objects, actors or redaktor items (includes Listen and View)`],
    ...Links('Read'),
    ...Actors('Read'),
    ...Objects('Read'),
    ...Redaktor('Read'),
    [`Remove`, `The actor can remove objects from targets (e.g. Collections)`],
    [`Update`, `The actor can update the object`],
    ...Links('Update'),
    ...Actors('Update'),
    ...Objects('Update'),
    ...Redaktor('Update'),
    [`DM`, `The actor can send and receive Direct Messages`],
    [`Push`, `The actor can receive Push Notifications`],
    [`Reply`, `The actor can send objects in reply to other objects`],
    [`Upload`, `The actor can upload files`],
    [`Translate`, `The actor can translate elements of the interface or content to other languages`],
    ...Objects('Translate'),
].map((a) => {
    const B = 'https://redaktor.me/permission/';
    const [name, en] = a;
    const o = {
        id: `${B}${name}`,
        name,
        parentId: `${B}${name.indexOf(':') > 0 ? name.split(':').slice(0, -1).join(':') : '*'}`,
        contentMap: { en }
    };
    ID_PERMISSION.set(name, o);
    return o;
});
exports.ROLES = [
    [
        `Owner`,
        `The unique User assigned the Owner trust can do everything on the site.`,
        [`*`]
    ], [
        `Moderator`,
        `Moderators can restrict the 'Authenticated' trust.`,
        [
            `Accept`, `Add`, `Announce`, `BlockGlobal`, `Block`, `Create`,
            `Delete`, `Flag`, `Follow`, `Ignore`, `Invite`, `Join`, `Like`,
            `Move`, `Offer`, `Question`, `Read`, `Remove`, `Update`,
            `DM`, `Push`, `Reply`, `Upload`
        ]
    ]
].map((a) => {
    const B = 'https://redaktor.me/role/';
    const [name, en, tagArr] = a;
    const o = {
        id: `${B}${name}`,
        name,
        contentMap: { en },
        permissions: tagArr.map((tag) => ID_PERMISSION.get(tag))
    };
    return o;
});
//# sourceMappingURL=permission.seed.js.map