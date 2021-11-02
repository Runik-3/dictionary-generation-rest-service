import { config } from 'winston';

const loggerConfig: config.AbstractConfigSet = {
    levels: {
        error: 0,
        warn: 1,
        info: 2,
        http: 3,
        verbose: 4,
        debug: 5,
        trace: 6,
        data: 7,
    },
    colors: {
        error: 'bold red',
        warn: 'magenta',
        info: 'green',
        http: 'yellow',
        verbose: 'cyan',
        debug: 'blue',
        trace: 'white',
        data: 'grey',
    },
};

export default loggerConfig;
