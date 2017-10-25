import * as Koa from 'koa';
import * as logger from 'koa-logger';
import * as mount from 'koa-mount';
import * as Router from 'koa-router';
import * as serve from 'koa-static';
import { Bridge } from './bridge';

const app = new Koa();
const router = new Router();
const debug = require('debug')('cerberus:index');

const bridge = new Bridge();

if (process.env.LOG_DESKTOP_HTTP || true) app.use(logger());

router.get('/', async (ctx: Router.IRouterContext, next: () => Promise<any>) => {
  (ctx as any).body = 'Hi 🙋';
});

router.post('/slack-incoming', async (ctx: Router.IRouterContext, next: () => Promise<any>) => {
  // tslint:disable-next-line:no-console
  const { params, request } = ctx;
  const { query } = request;

  // tslint:disable-next-line:no-console
  console.log(params);
  // tslint:disable-next-line:no-console
  console.log(query)
});

app.use(router.routes() as any);

app.use(serve('static'));

app.listen(process.env.PORT || 8080, () => {
  debug(`WeChat Bridge is now live on ${process.env.PORT || 8080}`);
});
