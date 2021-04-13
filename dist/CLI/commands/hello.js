"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../Command");
class Hello extends Command_1.Command {
    async run() {
        const { args, flags } = this.parse(Hello);
        const name = flags.name || 'world';
        this.log(`HELLO ${name} from ./src/commands/hello.ts`);
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
    help: Command_1.flags.help({ char: 'h' }),
    name: Command_1.flags.string({ char: 'n', description: 'name to print' }),
    force: Command_1.flags.boolean({ char: 'f' }),
};
Hello.args = [{ name: 'file' }];
//# sourceMappingURL=hello.js.map