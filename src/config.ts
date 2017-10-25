export const SLACK_CHANNELS: Array<{ name: string, id: string }> =
  process.env.SLACK_CHANNELS
    ? JSON.parse(process.env.SLACK_CHANNELS!)
    : [];
export const SLACK_WEBHOOK = process.env.SLACK_WEBHOOK || '';
export const SLACK_TOKEN = process.env.SLACK_TOKEN || '';
export const WECHAT_ROOMS: Array<{ name: string }> =
  process.env.WECHAT_ROOMS
    ? JSON.parse(process.env.WECHAT_ROOMS!)
    : [];
