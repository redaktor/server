import * as inquirer from 'inquirer';
import { RedaktorConfig } from '../Command';
export default function getDBprompts(config: RedaktorConfig, preferences?: any): {
    [key: string]: inquirer.Question[];
};
