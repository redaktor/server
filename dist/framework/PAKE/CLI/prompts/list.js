"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require("./");
var chalk = require('chalk');
var figures = require('figures');
var Base = require('inquirer/lib/prompts/list');
class ListPrompt extends Base {
    constructor(questions, rl, answers) {
        super(questions, rl, answers);
    }
    render() {
        var message = this.getQuestion();
        if (this.firstRender) {
            message += chalk.dim(_1.inquirer.bundle.arrow);
        }
        if (this.status === 'answered') {
            message += chalk.cyan(this.opt.choices.getChoice(this.selected).short);
        }
        else {
            var choicesStr = listRender(this.opt.choices, this.selected);
            var indexPosition = this.opt.choices.indexOf(this.opt.choices.getChoice(this.selected));
            message +=
                '\n' + this.paginator.paginate(choicesStr, indexPosition, this.opt.pageSize);
        }
        this.firstRender = false;
        this.screen.render(message);
    }
}
exports.ListPrompt = ListPrompt;
function listRender(choices, pointer) {
    var output = '';
    var separatorOffset = 0;
    choices.forEach((choice, i) => {
        if (choice.type === 'separator') {
            separatorOffset++;
            output += '  ' + choice + '\n';
            return;
        }
        if (choice.disabled) {
            separatorOffset++;
            output += '  - ' + choice.name;
            output += ' (' + (typeof choice.disabled === 'string' ? choice.disabled : 'Disabled') + ')';
            output += '\n';
            return;
        }
        var isSelected = i - separatorOffset === pointer;
        var line = (isSelected ? figures.pointer + ' ' : '  ') + choice.name;
        if (isSelected) {
            line = chalk.cyan(line);
        }
        output += line + ' \n';
    });
    return output.replace(/\n$/, '');
}
//# sourceMappingURL=list.js.map