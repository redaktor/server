import * as https from 'https';
import URL from '../../framework/url';

interface HttpsStatusResult {
  authorized: boolean;
  headers: any;
  code: string;
  reason?: string;
}
export async function checkHTTPS(url: string) {
  return new Promise<HttpsStatusResult>((resolve) => {
    const req = https.get(URL.normalizeUrl(url, false, 'https', true), (res: any) => {
      return resolve({
        authorized: res.socket.authorized,
        headers: res.headers,
        code: '200'
      })
    }).on('error', (e: any) => {
      return resolve({
        authorized: false,
        headers: {},
        ...e
      });
    });
    req.end();
  })
}

async function check3() {
  const a = await checkHTTPS('heise.de');
  const b = await checkHTTPS('http://sebastianlasse.de');
  const c = await checkHTTPS('redaktor.me');
  console.log(a,b,c)
}
//check3()

/*
console.log(URL.normalizeUrl('heise.de', false, 'https', true));
console.log(URL.parse('heise.de'));
console.log(URL.parse('https://heise.de/'));
*/
