import { CreatePermissionDto } from '../API/permission/permission.entity';
interface CreatePermissionSeed extends CreatePermissionDto {
  parentId?: string;
}

function Actors(Action: string, includePerson = true) {
  const act = Action.toLowerCase();
  const actors = [
    [`${Action}:Actor`,`The actor can ${act} other Actors`],
    [`${Action}:Actor:Application`,`The actor can ${act} Applications`],
    [`${Action}:Actor:Group`,`The actor can ${act} Groups`],
    [`${Action}:Actor:Organization`,`The actor can ${act} Organizations`],
    [`${Action}:Actor:Service`,`The actor can ${act} Services`]
  ]
  if (!!includePerson) {
    actors.push([`${Action}:Actor:Person`,`The actor can ${act} Persons`])
  }
  return actors
}
function Objects(Action: string) {
  const act = Action.toLowerCase();
  return [
    [`${Action}:Object`,`The actor can ${act} Objects`],
    [`${Action}:Object:Article`,`The actor can ${act} Articles`],
    [`${Action}:Object:Audio`,`The actor can ${act} Audio`],
    [`${Action}:Object:Event`,`The actor can ${act} Events`],
    [`${Action}:Object:Image`,`The actor can ${act} Images`],
    [`${Action}:Object:Note`,`The actor can ${act} Notes`],
    [`${Action}:Object:Page`,`The actor can ${act} Pages`],
    [`${Action}:Object:Place`,`The actor can ${act} Places`],
    [`${Action}:Object:Video`,`The actor can ${act} Videos`]
  ]
}
function Links(Action: string) {
  const act = Action.toLowerCase();
  return [
    [`${Action}:Link`,`The actor can ${act} Links`],
    [`${Action}:Link:Mention`,`The actor can ${act} Mentions`]
  ]
}
function Redaktor(Action: string) {
  const act = Action.toLowerCase();
  return [
    [`${Action}:Plugin`,`The actor can ${act} redaktor plugins`],
    [`${Action}:Plugin:Menu`,`The actor can ${act} menu items and edit menus.`],
    [`${Action}:Theme`,`The actor can ${act} redaktor themes`],
    [`${Action}:Bookmark`,`The actor can ${act} redaktor bookmarks`]
  ]
}

/* CLI
export const SYSTEMTRUST = [
  [`Anonymous`, `Visitors to your site who are not logged in.`],
  [`Authenticated`, `Anyone who has an account on your site and logs in is authenticated. `+
                    `The Authenticated trust also serves as the minimum set of permissions.`],
  [`Moderator`, `Users assigned the Moderator trust can restrict the 'Authenticated' trust.`],
  [`Owner`, `The unique User assigned the Owner trust can do everything on the site. `
            + `This includes restricting 'Administrator' and 'Authenticated'.`]
].map((a) => {
  const o: CreatePermissionSeed = {
    id: `https://redaktor.me/trust/${a[0]}`,
    name: a[0],
    contentMap: { en: a[1] }
  }
  return o
});

Owner CLI
Grant SYSTEMTRUST on USER

*/
const ID_PERMISSION = new Map();

export const PERMISSIONS = [
  [`*`, `The unique Owner can do everything on the site.`],
  [`Accept`, `The actor can accept objects (includes Reject)`],
  [`Add`,`The actor can add objects to targets (e.g. Collections)`],
  [`Announce`,`The actor can call the target's attention (e.g. for "Status Messages")`],
  [`Block`,`The actor can block Objects, Actors or redaktor items (see also Ignore)`],
  [`Block:Domain`,`The actor can block a complete domain`],
  [`Block:User`,`The actor can block a complete local user`],
  ...Actors('Block'),
  ...Objects('Block'),
  [`BlockGlobal`,`The actor can block complete domains or Actors instance-wide`],
  [`Create`,`The actor can create objects, actors or redaktor items`],
  ...Links('Create'),
  ...Actors('Create'),
  ...Objects('Create'),
  ...Redaktor('Create'),
  [`Delete`,`The actor can delete objects, actors or redaktor items`],
  ...Links('Delete'),
  ...Actors('Delete'),
  ...Objects('Delete'),
  ...Redaktor('Delete'),
  [`Flag`,`The actor can report content as being inappropriate`],
  [`Flag:Domain`,`The actor can report a complete domain as being inappropriate`],
  [`Flag:User`,`The actor can report a complete local user as being inappropriate`],
  ...Actors('Flag'),
  ...Objects('Flag'),
  [`Follow`,`The actor can manage relationships (this includes Ignore and Block)`],
  ...Actors('Follow'),
  [`Ignore`,`The actor can ignore Objects, Actors or redaktor items (see also Block)`],
  [`Ignore:Domain`,`The actor can ignore a complete domain`],
  [`Ignore:User`,`The actor can ignore a complete local user`],
  ...Actors('Ignore'),
  ...Objects('Ignore'),
  [`Invite`,`The actor can extend an invitation for the object to the target`],
  ...Actors('Invite'),
  ...Objects('Invite'),
  [`Join`,`The actor can join the object (includes Leave)`],
  ...Actors('Join', false),
  ...Objects('Join'),
  [`Like`,`The actor can like or endorse the object (includes Dislike)`],
  ...Objects('Like'),
  [`Move`,`The actor can move objects from origins to targets (e.g. Collections)`],
  [`Offer`,`The actor can offer objects to targets`],
  [`Question`,`The actor can ask or create Polls`],
  [`Read`,`The actor can read objects, actors or redaktor items (includes Listen and View)`],
  ...Links('Read'),
  ...Actors('Read'),
  ...Objects('Read'),
  ...Redaktor('Read'),
  [`Remove`,`The actor can remove objects from targets (e.g. Collections)`],
  [`Update`,`The actor can update the object`],
  ...Links('Update'),
  ...Actors('Update'),
  ...Objects('Update'),
  ...Redaktor('Update'),

  [`DM`,`The actor can send and receive Direct Messages`],
  [`Push`,`The actor can receive Push Notifications`],
  [`Reply`,`The actor can send objects in reply to other objects`],
  [`Upload`,`The actor can upload files`],
  [`Translate`,`The actor can translate elements of the interface or content to other languages`],
  ...Objects('Translate'),

//"inbox:write", "objects:read" ???

].map((a) => {
  const B = 'https://redaktor.me/permission/';
  const [name, en] = a;
  const o: CreatePermissionSeed = {
    id: `${B}${name}`,
    name,
    parentId: `${B}${name.indexOf(':') > 0 ? name.split(':').slice(0, -1).join(':') : '*'}`,
    contentMap: { en }
  }
  ID_PERMISSION.set(name, o);
  return o
});


export const ROLES = [
  // Translator
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
].map((a: [string, string, string[]]) => {
  const B = 'https://redaktor.me/role/';
  const [name, en, tagArr] = a;
  const o = {
    id: `${B}${name}`,
    name,
    contentMap: { en },
    permissions: tagArr.map((tag) => ID_PERMISSION.get(tag))
  }
  return o
});

/*
one user can have many Actors
one Actor can have many instances
one Actor can have many Pages etc.
one Actor has one trustLevel
one Actor has one reputationScore

user
actors   redaktor instances   pages

https://github.com/capabilityio
https://github.com/YMFE/json-schema-editor-visual
https://github.com/Atinux/schema-inspector

IF (before / after ???)
[I || Actor] [action] [* || Object,Actor etc.]
at/in [instance | page|group]
with [trustLevel || reputationScore]

[instancewide | at this location (page)] [trustLevel || reputationScore] CREATE [PHOTO]

A permission saying for Actor Ben
[instancewide | at this location (e.g. Page, Group)]
CREATE [Image]
[trustLevel || reputationScore]

could be the CAP request to user Anna

{
  "@context": "",
  "id": "https://brighton.cable/cap/request/9b2220dc-0e2e-4c95-9a5a-912b0748c082",
  "type": "Request",
  "capability": ["Create:Object:Image"],
  "actor": "https://brighton.cable/user/Ben"
}

POST to capabilityAcquisitionEndpoint signed with HTTP Signatures

Anna gets back

{
  "@context": "",
  "id": "https://social.example/cap/640b0093-ae9a-4155-b295-a500dd65ee11",
  "type": "Capability",
  "capability": ["Create:Object:Image"],
  "scope": "https://brighton.cable/actor/Ben",
  "actor": "https://social.example/actor/Anna"
}

and can include the capability in "create image" objects as
{
  ...
  capability: "https://social.example/cap/640b0093-ae9a-4155-b295-a500dd65ee11"
}
or use it as bearcap URI + Bearer Token :

bearcap:?u=https://social.example/image/9nnmWVszgTY13FduAS&t=640b0093-ae9a-4155-b295-a500dd65ee11
--> URL +
Accept: application/activity+json
Authorization: Bearer 640b0093-ae9a-4155-b295-a500dd65ee11

--- --- ---
  PERMISSIONS
  [TODO, missing: Travel, Arrive]
  + create settings, permissions

  + revisions ???

a local user can have multiple actors, e.g. let's assume
ben has "ed" and "ben"
alyssa has "alyssa"

actor "alyssa"
actor "ben"
actor "ed"
group "owner": [ed]
group "admin": [alyssa, ed]
...

[instancewide | at this location (page)] [trustLevel || reputationScore] CREATE [PHOTO]
[instancewide | at this location (page)] [trustLevel || reputationScore] REPLY [PHOTO]

// Bob makes a post, which he allows liking, and replying, but not announcing :
{
  "@context": [
    "https://www.w3.org/ns/activitystreams",
    "https://litepub.social/litepub/lice-v0.0.1.jsonld"
  ],
  "capabilities": {
    "Create": "https://example.social/caps/d4c4d96a-36d9-4df5-b9da-4b8c74e02567",
    "Like": "https://example.social/caps/21a946fb-1bad-48ae-82c1-e8d1d2ab28c3"
  },
  "id": "https://example.social/objects/d6cb8429-4d26-40fc-90ef-a100503afb73",
  "type": "Note",
  "content": "I'm really excited about the new capabilities feature!",
  "attributedTo": "https://example.social/users/bob"
}

store max x kb per post for user x
store max x char per post for user x
etc.


vote on polls
Permission to submit votes for polls.

Search module
administer search
Permission to configure administrative settings for site search.
search content
Permission to use this basic site search box.
use advanced search
Permission to apply additional filters to site searches.

Statistics module
access statistics
Permission to view all statistics.
view post access counter
Permission to view the number of page hits on each content page.

Taxonomy module
administer taxonomy
Permission to create and configure vocabularies and their taxonomy terms.



As Osada and Hubzilla started to get attention, Mastodon and Pleroma users started
to see weird behavior in their notifications and timelines: messages from people
they didn't necessarily follow which got directly addressed to the user.
These are messages sent to a group of selected friends, but can otherwise be
forwarded (boosted/repeated/announced) to other audiences.
In other words, they do not have the same semantic meaning as a DM.
But due to the way they were addressed, Mastodon and Pleroma saw them as a DM.
Mastodon fixed this issue in 2.6 by adding heuristics: if a message has recipients
in both the to and cc fields, then it's a public message that is addressed to a group
of recipients, and not a DM.  Unfortunately, Mastodon treats it similarly to a
followers-only post and does not infer the correct rights.
Meanwhile, Pleroma and Friendica came up with the idea to add a semantic hint to the
message with the litepub:directMessage field.  If this is set to true, it should be
considered as a direct message.  If the field is set to false, then it should be
considered a group message.  If the field is unset, then heuristics are used to
determine the message type.
Pleroma has a branch in progress which adds both support for the litepub:directMessage
field as well as the heuristics.

Leakage caused by Mastodon's followers-only scope

Software which is directly compatible with the Mastodon followers-only scope have
a few problems, I am grouping them together here:
New followers can see content that was posted before they were authorized to view any
followers-only content
Replies to followers-only posts are addressed to their own followers instead of the
followers collection of the OP at the time the post was created
(which creates metadata leaks about the OP)
Software which does not support the followers-only scope can dereference the OP's
followers collection in any way they wish, including interpreting it as as:Public
(this is explicitly allowed by the ActivityStreams 2.0 specification)
Mitigation of this is actually incredibly easy, which makes me question why Mastodon
didn't do it to begin with: simply expand the followers collection when preparing
to send the message outbound.
An implementation of this will be landing in Pleroma soon to harden the followers-only
scope as well as fix followers-only threads to be more usable.
Implementation of this mitigation also brings the followers-only threads to Friendica
and Hubzilla in a safe and compatible way: all fediverse software will be able to properly
interact with the threads.

https://blog.dereferenced.org/what-is-ocap-and-why-should-i-care
https://blog.dereferenced.org/demystifying-bearer-capability-uris
https://blog.dereferenced.org/what-would-activitypub-look-like-with-capability-based-security-anyway
*/

/* constraints

ActorLimit COUNT
ActorStorageLimit SIZE
ObjectLimit COUNT
ObjectStorageLimit SIZE
DMLimit COUNT
DMStorageLimit SIZE
UploadStorageLimit SIZE
FollowLimit COUNT

CRUDLimit COUNT (sql limit)


*/
