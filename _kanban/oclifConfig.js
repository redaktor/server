

/*


get rootDir() { return this._rootDir }
get id() { return this._id }

get configs() {
  return {
    CLI: this._packageJSON.config,
    global: this._globalConfig
  }
}
get status(): Status {
  return {
    name: 'redaktor',
    desc: '',
    root: this.rootDir,
    user: path.basename(os.homedir()||'./'),
    install: Date.now(),
    setup: 0,
    firstLogin: 0
  }
}*/


const Config = { // Config
  options: { root: '/Users/sebi/Desktop/MyGithub/server/bin/run' },
  _base: '@oclif/config@1.13.3',
  debug: 0,
  root: '/Users/sebi/Desktop/MyGithub/server',

  plugins: [
    { // Plugin
      options: [Object],
      _base: '@oclif/config@1.13.3',
      valid: true,
      alreadyLoaded: false,
      children: [],
      _debug: [Function],
      warned: false,
      type: 'core',
      tag: undefined,
      root: '/Users/sebi/Desktop/MyGithub/server',
      pjson: [Object],
      name: 'redaktor-server',
      version: '0.0.1',
      hooks: {},
      manifest: [Object],
      commands: [Array]
    },
    { // Plugin
      options: [Object],
      _base: '@oclif/config@1.13.3',
      valid: true,
      alreadyLoaded: false,
      children: [],
      _debug: [Function],
      warned: false,
      type: 'core',
      tag: undefined,
      root: '/Users/sebi/Desktop/MyGithub/server/node_modules/@oclif/plugin-help',
      pjson: [Object],
      name: '@oclif/plugin-help',
      version: '2.2.3',
      hooks: {},
      manifest: [Object],
      commands: [Array]
    }
  ],
  warned: false,

  pjson: {
    name: 'redaktor-server',
    version: '0.0.1',
    description: 'description',
    config: { ports: [Array] },
    keywords: [ 'ActivityPub', 'redaktor' ],
    author: 'Sebastian Lasse',
    homepage: 'https://redaktor.me',
    license: 'MIT',
    bin: { redaktor: './bin/run' },
    repository: 'redaktor/server',
    scripts: {
      postpack: 'rm -f oclif.manifest.json',
      posttest: 'eslint . --ext .ts --config .eslintrc',
      prepack: 'rm -rf lib && tsc -b && oclif-dev manifest && oclif-dev readme',
      prebuild: 'rimraf dist',
      build: 'nest build',
      format: 'prettier --write "src/**/*.ts" "test/**/*.ts"',
      start: 'node ./dist/',
      'start:dev': 'nest start --watch',
      'start:debug': 'nest start --debug --watch',
      'start:prod': 'node dist/indexs',
      lint: 'tslint -p tsconfig.json -c tslint.json',
      test: 'jest',
      'test:watch': 'jest --watch',
      'test:cov': 'jest --coverage',
      'test:debug': 'node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand',
      'test:e2e': "echo 'No e2e tests implemented yet.'"
    },
    dependencies: {
      '@dojo/cli-upgrade-app': '^6.0.0',
      '@dojo/framework': '^6.0.3',
      '@nestjs/common': '6.10.14',
      '@nestjs/core': '6.10.14',
      '@nestjs/jwt': '6.1.1',
      '@nestjs/passport': '6.1.1',
      '@nestjs/platform-express': '6.10.14',
      '@nestjs/swagger': '^4.1.10',
      '@nestjs/typeorm': '^6.2.0',
      '@nestjs/websockets': '^6.10.14',
      '@oclif/command': '^1.5.19',
      '@oclif/config': '^1.13.3',
      '@oclif/plugin-help': '^2.2.3',
      bcryptjs: '2.4.3',
      'body-parser': '1.19.0',
      'class-transformer': '^0.2.3',
      'class-validator': '^0.9.1',
      'cookie-parser': '1.4.4',
      'crypto-browserify': '^3.12.0',
      csurf: '1.10.0',
      ejs: '^2.6.1',
      'express-rate-limit': '^3.4.0',
      faker: '^4.1.0',
      'google-libphonenumber': '^3.2.2',
      helmet: '^3.21.2',
      kbpgp: '^2.0.82',
      mysql: '^2.16.0',
      'node-fetch': '^2.3.0',
      nodemailer: '~4.7.0',
      passport: '0.4.1',
      'passport-jwt': '4.0.0',
      'passport-local': '1.0.0',
      pg: '^7.7.1',
      puppeteer: '^1.10.0',
      'reflect-metadata': '0.1.13',
      rimraf: '3.0.0',
      rxjs: '6.5.4',
      sharp: '0.23.4',
      snarkdown: '^1.2.2',
      sqlite3: '^4.1.1',
      tslib: '~1.10.0',
      'twitter-text': '3.0.0',
      typeorm: '^0.2.22',
      'uri-templates': '^0.2.0',
      validator: '^10.10.0',
      'whatwg-fetch': '~3.0.0',
      zxcvbn: '^4.4.2'
    },
    devDependencies: {
      '@dojo/cli': '7.0.0-alpha.1',
      '@dojo/cli-build-app': '7.0.0-alpha.1',
      '@dojo/scripts': '4.0.2',
      '@nestjs/cli': '6.13.3',
      '@nestjs/schematics': '6.8.2',
      '@nestjs/testing': '6.10.14',
      '@oclif/dev-cli': '^1.22.2',
      '@types/bcryptjs': '2.4.2',
      '@types/cookie-parser': '1.4.2',
      '@types/csurf': '^1.9.35',
      '@types/ejs': '^2.6.1',
      '@types/express': '4.17.2',
      '@types/faker': '^4.1.5',
      '@types/google-libphonenumber': '^7.4.17',
      '@types/grunt': '^0.4.24',
      '@types/helmet': '0.0.43',
      '@types/inquirer': '0.0.43',
      '@types/jest': '24.0.25',
      '@types/node': '12.12.21',
      '@types/node-fetch': '^2.1.2',
      '@types/nodemailer': '^4.6.5',
      '@types/opn': '^5.1.0',
      '@types/passport-jwt': '^3.0.3',
      '@types/passport-local': '^1.0.33',
      '@types/puppeteer': '^1.9.1',
      '@types/sharp': '^0.21.0',
      '@types/sinon': '^1.16.35',
      '@types/supertest': '2.0.8',
      '@types/twitter-text': '^2.0.0',
      '@types/uri-templates': '^0.1.29',
      '@types/validator': '^10.9.0',
      '@types/zxcvbn': '^4.4.0',
      chalk: '^2.4.1',
      jest: '24.9.0',
      prettier: '1.19.1',
      supertest: '4.0.2',
      'ts-jest': '24.3.0',
      'ts-loader': '6.2.1',
      'ts-node': '8.6.1',
      'tsconfig-paths': '3.9.0',
      tslint: '5.20.1',
      typescript: '3.7.2'
    },
    engines: { node: '>=8.0.0' },
    files: [ '/bin', '/lib', '/npm-shrinkwrap.json', '/oclif.manifest.json' ],
    jest: {
      moduleFileExtensions: [Array],
      rootDir: 'src',
      testRegex: '.spec.ts$',
      transform: [Object],
      coverageDirectory: '../coverage',
      testEnvironment: 'node'
    },
    oclif: {
      commands: './src/CLI/commands',
      bin: 'redaktor',
      plugins: [Array],
      update: [Object]
    }
  },



  name: 'redaktor-server',
  version: '0.0.1',
  channel: 'stable',
  valid: true,
  arch: 'x64',
  platform: 'darwin',
  windows: false,
  bin: 'redaktor',
  dirname: 'redaktor-server',
  userAgent: 'redaktor-server/0.0.1 darwin-x64 node-v12.14.1',
  shell: 'bash',
  home: '/Users/sebi',
  cacheDir: '/Users/sebi/Library/Caches/redaktor-server',
  configDir: '/Users/sebi/.config/redaktor-server',
  dataDir: '/Users/sebi/.local/share/redaktor-server',
  errlog: '/Users/sebi/Library/Caches/redaktor-server/error.log',
  binPath: undefined,
  npmRegistry: undefined
}
