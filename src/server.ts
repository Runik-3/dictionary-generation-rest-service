import App from './app';

import Routes from './api/routes';

const app: App = new App([...Routes]);

app.listen();

export default app.server;
