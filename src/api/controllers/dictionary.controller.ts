/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Request, Response, NextFunction } from 'express';

import XDXFGenerator from '@helpers/generators/xdxf.file.generator';
import { logger } from '@utils/logger.util';
import FandomParser from '@helpers/parsers/fandom.parser';
// import FandomParser from '@helpers/parsers/backup/fandom.parser-v3';
import gc from '@utils/garbage.collector.util';
import I18n from '../interfaces/enums/language.enum';

export default class DictionaryController {
    public static handleGenerateDictionary = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            req.setTimeout(10 * 60 * 1000);
            const { wiki } = req.params;
            let { lang, capacity } = req.query;

            if (!wiki) {
                lang = I18n.en;
            }

            if (!capacity) {
                capacity = '100000';
            }

            let parser = new FandomParser(wiki, lang as I18n);
            let dictionary = await parser.generateDictionary(Number(capacity));
            let generator = new XDXFGenerator();

            logger.warn('Generating xdxf ...');
            const dictionaryContents = generator.generate(dictionary);
            logger.warn('🏁 Finished generating xdxf.');

            logger.warn(
                `2️⃣ This request uses approximately ${
                    process.memoryUsage().heapUsed / 1024 / 1024
                } MB`,
            );

            res.set({
                'Content-Type': 'text/xml; charset=utf-8',
                'Content-Disposition': `attachment; filename="${dictionary.name}.xdxf"`,
            });

            // @ts-ignore
            parser = null;

            // @ts-ignore
            generator = null;

            // @ts-ignore
            dictionary = null;
            gc();

            logger.warn(
                `3️⃣ This request uses approximately ${
                    process.memoryUsage().heapUsed / 1024 / 1024
                } MB`,
            );

            logger.warn('🛠️ Attempting to send file ...');
            res.send(dictionaryContents);
        } catch (error) {
            next(error);
        }
    };

    public static handleGetHome = (
        req: Request,
        res: Response,
        next: NextFunction,
    ): void => {
        res.status(200).send(
            "👋 Welcome to Runik's Dictionary 📚 Generation API - v1.06",
        );
    };

    public static handleGetSupportedLanguages = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const { wiki, page } = req.params;
            const parser = new FandomParser(wiki, I18n.en);

            const languages = await parser.fetchSupportedLanguages(page);
            res.json(languages);
        } catch (error) {
            next(error);
        }
    };
}
