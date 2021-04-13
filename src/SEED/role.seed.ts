import { PERMISSIONS } from './permission.seed';
const ID_PERMISSION = new Map();
PERMISSIONS.map((o) => ID_PERMISSION.set(o.name, o))

export const ROLES = [
  // Designer, Contributor, Translator, User, Anonymous
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
