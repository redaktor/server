import * as https from 'https';

// Request as Promise
export default function request(url: string, postData?: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const lib: typeof https = url.startsWith('https') ? require('https') : require('http');

    if (typeof postData !== 'undefined') {
      if (typeof postData === 'object') { postData = JSON.stringify(postData) }
      const U = new URL(url);

      const req = lib.request({
        hostname: U.hostname,
        port: U.port,
        path: U.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      }, (res) => {
        res.setEncoding('utf8');
        res.on('end', () => {
          resolve(res);
        });
        res.on('data', (chunk) => { console.log(`BODY: ${chunk}`) });
      });

      req.on('error', (e: Error) => {
        Object.assign(e, {details: `Could not post to localhost:${U.port} !
          You may have forgotten to start a second server with this demo`});
        reject(e);
      });

      // write data to request body
      req.write(postData);
      req.end();
      return
    }

    const request = lib.get(url, (res: any) => {
      const { statusCode, headers } = res;
      const contentType = res.headers['content-type']; // TODO

      if (statusCode < 200 || statusCode > 299) {
         reject(new Error('Failed to load page, status code: ' + statusCode));
       }
      const body: any[] = [];
      res.setEncoding('utf8');
      res.on('data', (chunk: any) => body.push(chunk));
      res.on('end', () => resolve(body.join('')));
    });
    request.on('error', (err: Error) => reject(err))
    })
};
