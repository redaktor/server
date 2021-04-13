Preview
===

- Do not use it, just a memo what is left from the old ActivityPub server

CLI
===

The Command Line Interface to set the Codes and Codices for your redaktor

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/CLI.svg)](https://npmjs.org/package/CLI)
[![Downloads/week](https://img.shields.io/npm/dw/CLI.svg)](https://npmjs.org/package/CLI)
[![License](https://img.shields.io/npm/l/CLI.svg)](https://github.com/redaktor/CLI/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g CLI
$ redaktor COMMAND
running command...
$ redaktor (-v|--version|version)
CLI/0.0.0 darwin-x64 node-v12.14.1
$ redaktor --help [COMMAND]
USAGE
  $ redaktor COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`redaktor hello [FILE]`](#redaktor-hello-file)
* [`redaktor help [COMMAND]`](#redaktor-help-command)

## `redaktor hello [FILE]`

describe the command here

```
USAGE
  $ redaktor hello [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print

EXAMPLE
  $ redaktor hello
  hello world from ./src/hello.ts!
```

_See code: [src/commands/hello.ts](https://github.com/redaktor/CLI/blob/v0.0.0/src/commands/hello.ts)_

## `redaktor help [COMMAND]`

display help for redaktor

```
USAGE
  $ redaktor help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.2.3/src/commands/help.ts)_
<!-- commandsstop -->
