import { Router } from 'express';

export default interface Route {
    path?: string;
    router: Router;
}
