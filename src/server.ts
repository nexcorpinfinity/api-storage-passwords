import { App } from './app';

const port = Number(process.env.PORT) || 3000;

new App().server(port);
