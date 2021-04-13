import * as os from 'os';
export interface Platform {
  linux: boolean;
  macos: boolean;
  darwin: boolean;
  windows: boolean;
  win32: boolean;
}
export interface Status {
  name: string;
  desc: string;
  root: string;
  user: string;
  install?: number;
  setup?: number;
  firstLogin?: number;
}
interface GlobalConfig {
  [uuid: string]: Status;
}

export const BULLET = (os.platform() === 'win32') ? '*' : '●';
