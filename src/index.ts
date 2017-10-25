import * as Koa from 'koa';
import * as logger from 'koa-logger';
import * as mount from 'koa-mount';
import * as Router from 'koa-router';
import * as bodyparser from 'koa-bodyparser';
import * as serve from 'koa-static';
import { Bridge } from './bridge';
import { slack } from './slack';

const app = new Koa();
const router = new Router();
const debug = require('debug')('cerberus:index');
app.use(bodyparser());

const bridge = new Bridge();

if (process.env.LOG_DESKTOP_HTTP || true) app.use(logger());

router.get('/', async (ctx: Router.IRouterContext, next: () => Promise<any>) => {
  ctx.body = 'Hi 🙋';
});

router.post('/slack-incoming', (ctx, next) => slack.handleSlackIncoming(ctx, next));

app.use(router.routes() as any);
app.use(serve('static'));

app.listen(process.env.PORT || 8082, () => {
  debug(`WeChat Bridge is now live on ${process.env.PORT || 8082}`);
});
