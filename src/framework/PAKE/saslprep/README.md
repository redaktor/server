# saslprep

[![Travis](http://img.shields.io/travis/chiefbiiko/saslprep.svg?style=flat)](http://travis-ci.org/chiefbiiko/saslprep) [![AppVeyor](https://ci.appveyor.com/api/projects/status/github/chiefbiiko/saslprep?branch=master&svg=true)](https://ci.appveyor.com/project/chiefbiiko/saslprep)

Stringprep Profile for User Names and Passwords, [rfc4013](https://tools.ietf.org/html/rfc4013).

## Usage

``` ts
import { saslprep } from "https://denopkg.com/chiefbiiko/saslprep/mod.ts";

saslprep('password\u00AD') // password
saslprep('password\u0007') // Error: prohibited character
```

## API

#### `saslprep(input: string, opts: SASLprepOptions): string`

Normalize user name or password. Options as follows:

``` ts
export interface SASLprepOptions {
  allowUnassigned?: boolean;
}
```

Opt-in a special behavior for unassigned code points, see https://tools.ietf.org/html/rfc4013#section-2.5. Disabled by default.

## License

[MIT](./LICENSE)
