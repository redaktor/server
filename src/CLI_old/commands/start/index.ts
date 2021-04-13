/**
 * ...
 * ...
 */
import Command from '../../Command';
//import bundle from '../nls/CLI';

export default class Start extends Command {
  constructor() { super() }
  async run(system: any) {
    //await this.i18n(bundle);
    const hi = `Hi ${system.userName}.`;
    if (!system.status.setup) {
      // NEW SETUP !

      /*
      this.info(_`G${hi} ${this.msg('welcome')} ${this.msg('name')}\n`[0]);
      await this.setup();
      this.startCLI();
      */
    } else {
      this.success`${hi}`;
      /*
      if (!!(process.env.PW) && this.checkPW(process.env.PW||'')) {
        // check password ENV var
        this.startServer(process.env.PW);
      } else {
        // check password input
        this.startServer();
      }
      */
    }
  }
/*
  private async startServer(PW?: string) {
    if (!PW) { PW = await this.askPW() }
    console.log('START SERVER w.', PW)
    // TODO FIXME start w. process.env.PW = PW
  }
*/
}
