import request from 'supertest';
import { Application } from 'express';

import App from '../../src/app';
import Routes from '../../src/api/routes';

let application: App;
let app: Application;

beforeAll(() => {
    application = new App([...Routes]);
    application.listen();
    app = application.server;
});

afterAll(() => {
    application.close();
});

// Note: These tests expect database to be seeded with data
// TODO: Integrate more robust unit tests
describe('[GET] /', () => {
    it('Should return 200 OK', done => {
        // eslint-disable-next-line prettier/prettier
        request(app)
            .get('/')
            .expect('Content-Type', /text/)
            .expect(200, done);
    });

    it('Should return 404 NOT FOUND', done => {
        // eslint-disable-next-line prettier/prettier
        request(app)
            .get('/random')
            .expect(404, done);
    });
});
