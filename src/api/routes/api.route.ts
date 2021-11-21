import { Router } from 'express';

import DictionaryController from '@controllers/dictionary.controller';

const router = Router();

// GET
// Example: http://localhost:3000/api/dictionary/home
router.get('/api/dictionary/home', DictionaryController.handleGetHome);

// GET
// Example: http://localhost:3000/api/dictionary/gameofthrones?lang=en&capacity=1000
router.get(
    '/api/dictionary/:wiki',
    DictionaryController.handleGenerateDictionary,
);

// GET
// Example: http://localhost:3000/api/languages/gameofthrones/Game_of_Thrones_Wiki
router.get(
    '/api/languages/:wiki/:page',
    DictionaryController.handleGetSupportedLanguages,
);

export default router;
