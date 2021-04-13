/**
 * `list` type prompt
 */
import { inquirer } from './';
var chalk = require('chalk');
var figures = require('figures');
var Base = require('inquirer/lib/prompts/list');

export class ListPrompt extends Base {
  constructor(questions, rl, answers) {
    super(questions, rl, answers);
  }

  /**
   * Render the prompt to screen
   * @return {ListPrompt} self
   */

  render() {
    // Render question
    var message = this.getQuestion();
    if (this.firstRender) { message += chalk.dim(inquirer.bundle.arrow) }

    // Render choices or answer depending on the state
    if (this.status === 'answered') {
      message += chalk.cyan(this.opt.choices.getChoice(this.selected).short);
    } else {
      var choicesStr = listRender(this.opt.choices, this.selected);
      var indexPosition = this.opt.choices.indexOf(
        this.opt.choices.getChoice(this.selected)
      );
      message +=
        '\n' + this.paginator.paginate(choicesStr, indexPosition, this.opt.pageSize);
    }

    this.firstRender = false;
    this.screen.render(message);
  }
}

/**
 * Function for rendering list choices
 * @param  {Number} pointer Position of the pointer
 * @return {String}         Rendered content
 */
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
