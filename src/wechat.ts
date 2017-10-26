import { slack } from './slack';
import { WECHAT_ROOMS } from './config';
import * as QrcodeTerminal from 'qrcode-terminal';

const { Wechaty, Room } = require('wechaty');

export class WeChat {
  private bot: any;

  constructor() {
    this.bot = Wechaty.instance();
    this.bot
      .on('login', (user: any) => console.log('Bot', `${user.name()} logined`))
      .on('logout', (user: any) => console.log('Bot', `${user.name()} logouted`))
      .on('error', (e: Error) => console.log('Bot', 'error: %s', e))
      .on('scan', (url: string, code: number) => {
        if (!/201|200/.test(String(code))) {
          const loginUrl = url.replace(/\/qrcode\//, '/l/');
          QrcodeTerminal.generate(loginUrl);
        }
        console.log(`${url}\n[${code}] Scan QR Code in above url to login: `);
      })
      .on('message', async (message: any) => {
        const room    = message.room();
        const sender  = message.from();
        const content = message.content();

        // Don't do anything for our own messages or messages
        // from other sources
        if (!room) return;
        const roomName = room.topic();
        const senderName = sender.name();

        console.log(`Received WeChat message:`);
        console.log(roomName, senderName, content);

        if (!WECHAT_ROOMS.find(({ name }) => name === roomName)) return;

        if (!message.self()) {
          slack.postToChannel(content, senderName);
        }
      })
      .start();
  }

  public async postToGroup(text: string, author: string) {
    const room = await Room.find({ topic: 'Electron China' });

    if (!room) {
      console.log(room);
      return;
    }

    room.say(`Posted in Slack by ${author}:\n${text}`);
  }
}

export const weChat = new WeChat();
