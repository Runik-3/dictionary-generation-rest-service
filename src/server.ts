/* eslint-disable import/first */
// import 'module-alias/register';

// require('module-alias/register');

import App from './app';

import Routes from './api/routes';

const app: App = new App([...Routes]);

app.listen();

export default app.server;
