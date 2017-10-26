import * as Router from 'koa-router';
import * as request from 'request-promise-native';
import { WebClient } from '@slack/client';

import { SLACK_CHANNELS, SLACK_WEBHOOK, SLACK_TOKEN } from './config';
import { weChat } from './wechat';

export class Slack {
  private slackClient: any;

  constructor() {
    this.slackClient = new WebClient(SLACK_TOKEN);
    this.handleSlackIncoming.bind(this);
  }

  public async postToChannel(text: string, author?: string) {
    console.log(`Posting to Slack:`, { text, author });

    const json = {
      text: author ? `Posted in WeChat by ${author}:\n>>>${text}` : text
    };

    await request.post(SLACK_WEBHOOK, { json });
  }

  public async handleSlackIncoming(ctx: Router.IRouterContext, next: () => Promise<any>) {
    const { body } = ctx.request;

    if (!body || !body.type) {
      ctx.status = 400;
      return;
    }

    if (body.type === 'url_verification') return this.handleUrlChallenge(ctx, next);
    if (body.type === 'event_callback') return this.handleEvent(ctx, next);
  }

  private async handleEvent(ctx: Router.IRouterContext, next: () => Promise<any>) {
    const { body } = ctx.request;
    const { event } = body;

    if (!event) {
      ctx.status = 400;
      return;
    }

    if (event.type === 'message') {
      this.handleMessagePosted(ctx, next);
    }
  }

  private async handleUrlChallenge(ctx: Router.IRouterContext, next: () => Promise<any>) {
    const { body } = ctx.request;
    const { token, challenge } = body;

    ctx.body = challenge;
  }

  private async handleMessagePosted(ctx: Router.IRouterContext, next: () => Promise<any>) {
    const { body } = ctx.request;
    const { event } = body;
    const { user, text, ts, channel } = event;

    ctx.status = 200;
    console.log(event);

    // Let's check if we care about the channel. If we don't,
    // let's just stop here.
    if (!SLACK_CHANNELS.find(({ id }) => channel === id)) return;

    const username = await this.getUsername(user);

    weChat.postToGroup(text, username);
  }

  private async getUsername(id: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.slackClient.users.info(id, (err: any, result: any) => {
        console.log(err, result);

        const username: string = result && result.user
          ? result.user.name
          : id;

        resolve(username);
      });
    }) as Promise<string>;
  }
}

export const slack = new Slack();
