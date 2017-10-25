import { Wechaty, Room } from 'wechaty';
import { slack } from './slack';
import { WECHAT_ROOMS } from './config';
import * as QrcodeTerminal from 'qrcode-terminal';

export class WeChat {
  private bot: Wechaty;

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
        if (!WECHAT_ROOMS.find(({ name }) => name === room.topic())) return;

        console.log(`Received WeChat message:`);
        console.log(room.topic(), sender.name, content);

        if (!message.self()) {
          slack.postToChannel(content, sender.name());
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
