import { Request, Response, NextFunction } from 'express';

import XDXFGenerator from '@helpers/generators/xdxf.file.generator';
import I18n from '../interfaces/enums/language.enum';
import FandomParser from '../helpers/parsers/fandom.parser';

export default class DictionaryController {
    public static handleGenerateDictionary = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const { wiki } = req.params;
            let { lang, capacity } = req.query;

            if (!wiki) {
                lang = I18n.en;
            }

            if (!capacity) {
                capacity = '100000';
            }

            const parser = new FandomParser(wiki, lang as I18n);
            const dictionary = await parser.generateDictionary(
                Number(capacity),
            );
            const generator = new XDXFGenerator();
            const dictionaryContents = generator.generate(dictionary);

            res.set({
                'Content-Type': 'text/xml; charset=utf-8',
                'Content-Disposition': `attachment; filename="${dictionary.name}.xdxf"`,
            });

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
            "👋 Welcome to Runik's Dictionary 📚 Generation API - v1.05",
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
