import { Router } from 'express';
import APIRoute from './api.route';
import HomeRoute from './home.route';

const Routes: Router[] = [HomeRoute, APIRoute];

export default Routes;
