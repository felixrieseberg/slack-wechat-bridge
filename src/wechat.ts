import { slack } from './slack';
import { WECHAT_ROOMS } from './config';
import * as QrcodeTerminal from 'qrcode-terminal';

const { Wechaty, Room } = require('wechaty');

export class WeChat {
  private bot: any;
  private ready: boolean = false;

  constructor() {
    console.log(`WeChat rooms:`, WECHAT_ROOMS);

    this.bot = Wechaty.instance();
    this.bot
      .on('login', (user: any) => {
        console.log('Bot', `${user.name()} online`);
        this.ready = true;
      })
      .on('logout', (user: any) => {
        slack.postToChannel(`Warning: WeChat user on Heroku logged out. Messages will not be sent to WeChat.`);
      })
      .on('error', (e: Error) => {
        slack.postToChannel(`Warning: Error encountered. ${e}`);
      })
      .on('scan', (url: string, code: number) => {
        if (!/201|200/.test(String(code)) && !process.env.HEROKU) {
          const loginUrl = url.replace(/\/qrcode\//, '/l/');
          QrcodeTerminal.generate(loginUrl);
        }
        console.log(`Login scan event: ${code} ${url}`);
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

        const isSelf = message.self();
        const isMatchingRoom = !!WECHAT_ROOMS.find(({ name }) => {
          return name.trim() === roomName.trim();
        });

        if (!isSelf && isMatchingRoom) {
          slack.postToChannel(content, senderName);
        } else {
          console.log(`Not posting message.`, { isSelf, isMatchingRoom });
        }
      })
      .start();
  }

  public async postToGroup(text: string, author: string) {
    if (!this.ready) {
      console.log(`Tried to post message, but WeChat instance not ready`);
      console.log(text);
    }

    const room = await Room.find({ topic: 'Electron China' });

    if (!room) {
      console.log(room);
      return;
    }

    room.say(`Posted in Slack by ${author}:\n${text}`);
  }
}

export const weChat = new WeChat();
