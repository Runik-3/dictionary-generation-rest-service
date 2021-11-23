import { logger } from '@utils/logger.util';
import App from './app';

import Routes from './api/routes';

const app: App = new App([...Routes]);

app.listen();

logger.warn(`Node version is: ${process.version}`);

export default app.server;
