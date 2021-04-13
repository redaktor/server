"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _pointer = process.platform === 'win32' ? '>' : '❯';
const cliCursor = require('cli-cursor');
const path = require("path");
const fs = require("fs");
const util = require("util");
const chalk = require("chalk");
const inquirer = require("inquirer");
const Base = require('inquirer/lib/prompts/base');
const observe = require('inquirer/lib/utils/events');
const Paginator = require('inquirer/lib/utils/paginator');
const Choices = require('inquirer/lib/objects/choices');
const Separator = require('inquirer/lib/objects/separator');
const CHOOSE = 'Choose this directory';
const MAKE = 'Create a new directory here';
const MAKEPROMPT = 'Enter a name for the directory';
const BACK = '..';
const CURRENT = '.';
function listRender(choices, pointer) {
    var output = '';
    var separatorOffset = 0;
    choices.forEach(function (choice, index) {
        if (choice.type === 'separator') {
            separatorOffset++;
            output += '  ' + choice + '\n';
            return;
        }
        var isSelected = (index - separatorOffset === pointer);
        var line = (isSelected ? _pointer + ' ' : '  ') + choice.name;
        if (isSelected) {
            line = chalk.green(line);
        }
        output += line + ' \n';
    });
    return output.replace(/\n$/, '');
}
function getDirectories(basePath) {
    return fs
        .readdirSync(basePath)
        .filter(function (file) {
        try {
            var stats = fs.lstatSync(path.join(basePath, file));
            if (stats.isSymbolicLink()) {
                return false;
            }
            var isDir = stats.isDirectory();
            var isNotDotFile = path.basename(file).indexOf('.') !== 0;
            return isDir && isNotDotFile;
        }
        catch (error) {
            return false;
        }
    })
        .sort();
}
function Prompt() {
    Base.apply(this, arguments);
    if (!this.opt.basePath) {
        this.opt.basePath = '/';
    }
    this.currentPath = path.isAbsolute(this.opt.basePath) ? path.resolve(this.opt.basePath) : path.resolve(process.cwd(), this.opt.basePath);
    this.root = path.parse(this.currentPath).root;
    this.opt.choices = new Choices(this.createChoices(this.currentPath), this.answers);
    this.selected = 0;
    this.opt.default = null;
    this.searchTerm = '';
    this.paginator = new Paginator();
}
exports.Prompt = Prompt;
util.inherits(Prompt, Base);
Prompt.prototype._run = function (callback) {
    var self = this;
    self.makeMode = false;
    this.done = callback;
    var alphaNumericRegex = /\w|\.|\-/i;
    var events = observe(this.rl);
    var keyUps = events.keypress.filter(function (evt) {
        return evt.key.name === 'up' || (evt.key.name === 'k');
    }).share();
    var keyDowns = events.keypress.filter(function (evt) {
        return evt.key.name === 'down' || (evt.key.name === 'j');
    }).share();
    var keySlash = events.keypress.filter(function (evt) {
        return (!self.makeMode && evt.value === '/');
    }).share();
    var keyMinus = events.keypress.filter(function (evt) {
        return (!self.makeMode && evt.value === '-');
    }).share();
    var alphaNumeric = events.keypress.filter(function (evt) {
        return evt.key.name === 'backspace' || alphaNumericRegex.test(evt.value);
    }).share();
    var outcome = this.handleSubmit(events.line);
    outcome.drill.forEach(this.handleDrill.bind(this));
    outcome.back.forEach(this.handleBack.bind(this));
    keyUps.takeUntil(outcome.done).forEach(this.onUpKey.bind(this));
    keyDowns.takeUntil(outcome.done).forEach(this.onDownKey.bind(this));
    keyMinus.takeUntil(outcome.done).forEach(this.handleBack.bind(this));
    events.keypress.takeUntil(outcome.done).forEach(this.hideKeyPress.bind(this));
    outcome.make.forEach(this.onSubmitMake.bind(this));
    outcome.done.forEach(this.onSubmitChoose.bind(this));
    cliCursor.hide();
    this.render();
    return this;
};
Prompt.prototype.render = function () {
    var message = this.getQuestion();
    if (this.status === 'answered') {
        message += chalk.green(this.currentPath);
    }
    else {
        message += chalk.bold('\n Current directory: ') + chalk.green(path.resolve(this.opt.basePath, this.currentPath));
        message += chalk.bold('\n');
        var choicesStr = listRender(this.opt.choices, this.selected);
        message += '\n' + (this.paginator.paginate(choicesStr, this.selected, this.opt.pageSize) || '');
        message += chalk.dim('\n(use "-" key to navigate to the parent folder');
        message += chalk.dim('\n(use arrow keys)');
    }
    this.screen.render(message);
};
Prompt.prototype.handleSubmit = function (e) {
    var self = this;
    var obx = e.map(function () {
        return self.opt.choices.getChoice(self.selected).value;
    }).share();
    var make = obx.filter(function (choice) {
        return choice === MAKE;
    }).take(1);
    var done = obx.filter(function (choice) {
        return choice === CHOOSE || choice === CURRENT;
    }).take(1);
    var back = obx.filter(function (choice) {
        return choice === BACK;
    }).takeUntil(done);
    var drill = obx.filter(function (choice) {
        return choice !== BACK && choice !== CHOOSE && choice !== MAKE && choice !== CURRENT;
    }).takeUntil(done);
    return {
        make: make,
        done: done,
        back: back,
        drill: drill
    };
};
Prompt.prototype.handleDrill = function () {
    var choice = this.opt.choices.getChoice(this.selected);
    this.currentPath = path.join(this.currentPath, choice.value);
    this.opt.choices = new Choices(this.createChoices(this.currentPath), this.answers);
    this.selected = 0;
    this.render();
};
Prompt.prototype.handleBack = function () {
    this.currentPath = path.dirname(this.currentPath);
    this.opt.choices = new Choices(this.createChoices(this.currentPath), this.answers);
    this.selected = 0;
    this.render();
};
Prompt.prototype.onSubmitChoose = function () {
    this.status = 'answered';
    this.render();
    this.screen.done();
    cliCursor.show();
    this.done(path.resolve(this.opt.basePath, this.currentPath));
};
Prompt.prototype.onSubmitMake = function () {
    this.makeMode = true;
    console.log(' ');
    cliCursor.show();
    inquirer.prompt([{
            type: 'input',
            name: 'dirname',
            message: MAKEPROMPT,
            default: '_IndieAuthSecrets',
            validate: function (dirname) {
                var dir = path.resolve(this.opt.basePath, this.currentPath, dirname);
                if (!fs.existsSync(dir)) {
                    try {
                        if (!!this.makeMode) {
                            fs.mkdirSync(dir);
                        }
                    }
                    catch (e) {
                        this.makeMode = false;
                        return 'Access Denied!';
                    }
                    return true;
                }
                return true;
            }.bind(this)
        }]).then(function (o) {
        this.makeMode = false;
        if (!!o.dirname) {
            var dir = path.resolve(this.opt.basePath, this.currentPath, o.dirname);
            if (!!fs.existsSync(dir)) {
                this.status = 'answered';
                this.render();
                this.screen.done();
                cliCursor.show();
                this.done(dir);
            }
        }
    }.bind(this));
};
Prompt.prototype.hideKeyPress = function () {
    this.render();
};
Prompt.prototype.onUpKey = function () {
    var len = this.opt.choices.realLength;
    this.selected = (this.selected > 0) ? this.selected - 1 : len - 1;
    this.render();
};
Prompt.prototype.onDownKey = function () {
    var len = this.opt.choices.realLength;
    this.selected = (this.selected < len - 1) ? this.selected + 1 : 0;
    this.render();
};
Prompt.prototype.onSlashKey = function () {
    this.render();
};
Prompt.prototype.onKeyPress = function () {
    var item;
    for (var index = 0; index < this.opt.choices.realLength; index++) {
        item = this.opt.choices.realChoices[index].name.toLowerCase();
        if (item.indexOf(this.searchTerm) === 0) {
            this.selected = index;
            break;
        }
    }
    this.render();
};
Prompt.prototype.createChoices = function (basePath) {
    var choices = getDirectories(basePath);
    if (basePath !== this.root) {
        choices.unshift(BACK);
    }
    choices.unshift(CURRENT);
    if (choices.length > 0) {
        choices.push(new Separator());
    }
    choices.push(CHOOSE);
    choices.push(MAKE);
    choices.push(new Separator());
    return choices;
};
//# sourceMappingURL=directoryPrompt.js.map