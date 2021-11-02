import helmet from 'helmet';

export const CSPDirectives = {
    directives: {
        defaultSrc: ["'none'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
        imgSrc: ["'self'"],
        objectSrc: ["'none'"],
        fontSrc: ["'self'"],
    },
};

export const CSP: Parameters<typeof helmet>[0] = {
    contentSecurityPolicy: false,
};
