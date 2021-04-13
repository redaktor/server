"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@oclif/command");
class Hello extends command_1.Command {
    async run() {
        const { args, flags } = this.parse(Hello);
        const name = flags.name || 'world';
        this.error(`HELLO ${name} from ./src/commands/hello.ts`);
        if (args.file && flags.force) {
            this.log(`you input --force and --file: ${args.file}`);
        }
    }
}
exports.default = Hello;
Hello.description = 'describe the command here';
Hello.examples = [
    `$ redaktor hello
hello world from ./src/hello.ts!
`,
];
Hello.flags = {
    help: command_1.flags.help({ char: 'h' }),
    name: command_1.flags.string({ char: 'n', description: 'name to print' }),
    force: command_1.flags.boolean({ char: 'f' }),
};
Hello.args = [{ name: 'file' }];
//# sourceMappingURL=hello.js.map