import { getRepository } from 'typeorm';
import { PERMISSIONS, ROLES } from './permission.seed';

export default async function redaktorSeed() {
  const permissions = getRepository('permission');
  const permissionsData = await permissions.find();
  const roles = getRepository('permission');
  const rolesData = await roles.find();
  console.log('repo',permissions);
  //return data
  if (!permissionsData.length) {
    console.log('no permissionsData', permissionsData);
  }
  if (!rolesData.length) {
    console.log('no rolesData', rolesData);
  }
  //await getRepository('permission').save(PERMISSIONS);
  //await getRepository('roles').save(ROLES);

}
