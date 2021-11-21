import { Router } from 'express';

const path = '/';
const router = Router();

router.get(path, (_req, res) => {
    res.status(200).send(
        "👋 Welcome to Runik's Dictionary 📚 Generation API - v1.05",
    );
});

export default router;
