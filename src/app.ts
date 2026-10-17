import { NODE_ENV, API_PORT, API_VERSION } from '@config';
import path from 'path';
import cors from 'cors';
import express from 'express';
import session from 'express-session';
import { Routes } from '@interfaces/routes.interface';
import { IncomingMessage, Server, ServerResponse } from 'http';
import http from 'http';
import * as socketIO from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { AppSocket } from './socket';
import { DEFAULT_ENVIRONMENT } from './helper/common.helper';
export default class App {
  readonly app: express.Application;
  readonly env: string;
  readonly API_PORT: string | number;
  http: Server<typeof IncomingMessage, typeof ServerResponse>;
  server: Server<typeof IncomingMessage, typeof ServerResponse>;
  static io: socketIO.Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;
  constructor(data: { apiRoutes: Routes[]; generalRoutes: Routes[] }) {
    this.app = express();

    this.env = NODE_ENV || DEFAULT_ENVIRONMENT;
    this.API_PORT = API_PORT || 3000;

    this.initializeMiddlewares();
    this.initializeRoutes(data.apiRoutes);
    this.initializeRoutes(data.generalRoutes, false);
  }

  private readonly initializeMiddlewares = () => {
    this.app.use('/public/images', express.static(path.join(__dirname, '../public/images')));
    this.app.use('/public/sheets', express.static(path.join(__dirname, '../public/sheets')));
    this.app.use('/public/pdf', express.static(path.join(__dirname, '../public/pdf')));

    this.app.set('trust proxy', 1);
    this.app.set('view engine', 'ejs');
    this.app.set('views', path.join(__dirname, './templates'));
    this.app.use(cors());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(express.json());
    if (NODE_ENV === DEFAULT_ENVIRONMENT) {
      this.app.use(
        session({
          cookie: {
            secure: true,
            maxAge: 60000,
          },
          secret: 's-s-secret',
          resave: false,
          saveUninitialized: true,
        }),
      );
    }
    this.http = http.createServer(this.app);

    this.app.use('/assets', express.static(path.join(process.cwd(), '/public/assets')));
    this.app.use(`${API_VERSION}/images/`, express.static(path.join(process.cwd(), '/public/images')));
  };

  private readonly initializeRoutes = (routes: Routes[], setVersion = true) => {
    const prefix = setVersion ? `${API_VERSION}/` : '';
    routes.forEach((route) => {
      this.app.use(`${prefix}`, route.router);
    });
  };

  public listen = async () => {
    this.server = this.http.listen(this.API_PORT, () => {
      console.log('=================================');
      console.log(`======= ENV: ${this.env} ========`);
      console.log(`🚀 App listening on the port ${this.API_PORT}`);
      console.log('=================================');
    });
    App.io = new socketIO.Server(this.server, { cors: { credentials: true, origin: '*' } });
    AppSocket();
  };
}
