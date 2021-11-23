/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-restricted-syntax */
import axios from 'axios';
import { mwn as Mwn } from 'mwn';
import pLimit from 'p-limit';
import cliProgress from 'cli-progress';

import { logger } from '@utils/logger.util';
import Page from '@interfaces/page.interface';
import Parser from '@interfaces/parser.interface';
import I18n from '@interfaces/enums/language.enum';
import AllPages from '@interfaces/all.pages.interface';
import Dictionary from '@interfaces/dictionary.interface';
import ParsedPage from '@interfaces/parsed.page.interface';
import FandomWiki from '@interfaces/fandom.wiki.interface';
import Continue from '@interfaces/media.wiki.api.continue.interface';
import { WIKI_PASSWORD, WIKI_USERNAME } from '@utils/secrets.util';
import RunikDictionary from '../../dictionary/runik.dictionary';

export default class FandomParser implements Parser {
    private readonly _lang: I18n;

    private readonly _wiki: FandomWiki;

    constructor(wiki: string, lang = I18n.en) {
        this._lang = lang;

        this._wiki = {
            name: wiki,
            baseURL: this.getBaseURL(wiki),
        };

        console.log(WIKI_USERNAME);
        console.log(WIKI_PASSWORD);

        console.log(this._wiki.baseURL.href);
    }

    public get lang(): I18n {
        return this._lang;
    }

    public get wikiName(): string {
        return this._wiki.name;
    }

    /**
     * Builds a dictionary for the terms in the specified Fandom Wiki
     *
     * @param limit - The maximum number of entries allowed in the dictionary
     * @returns A dictionary of terms and their definitions for the given wiki
     */
    public async generateDictionary(limit?: number): Promise<RunikDictionary> {
        const runikDictionary = new RunikDictionary(
            this._wiki.name,
            this._lang,
            limit,
        );
        // await this.populateDictionary(runikDictionary);
        return runikDictionary;
    }

    public async fetchPageBatch(
        fetchAllPagesURL: URL,
        concurrencyLimit = 500,
    ): Promise<Page[]> {
        try {
            const request = await axios.get(fetchAllPagesURL.href);
            const pages = (await request).data as AllPages;

            let counter = 0;
            const pageCount = pages.query.allpages.length;

            // create a new progress bar instance and use shades_classic theme
            const progressBar = new cliProgress.SingleBar(
                {},
                cliProgress.Presets.shades_classic,
            );

            // start the progress bar with a total value of |pages| and start value of 0
            progressBar.start(pageCount, 0);

            /**
             * Limits how many requests are made concurrently. Defaults to 250.
             */
            const limit = pLimit(concurrencyLimit);
            const pagesPromises = pages.query.allpages.map(
                async (page: Page, idx) => {
                    return limit(async () => {
                        const pageWithParsedData =
                            await this.addParsedPageDetails(page);

                        // update the current value in your application..
                        counter += 1;
                        progressBar.update(counter);

                        return pageWithParsedData;
                    });
                },
            );

            const pagesWithParsedData = await Promise.all(pagesPromises);
            // stop the progress bar
            progressBar.stop();

            return pagesWithParsedData;
        } catch (error) {
            logger.error(error);
            logger.error(`Unable to fetch batch of pages.`);
        }
        return [];
    }

    private async addParsedPageDetails(page: Page): Promise<Page> {
        const parsedPage: ParsedPage = await this.fetchParsedPage(page.pageid);

        if (parsedPage.parse) {
            return {
                ...page,
                ...parsedPage.parse,
            };
        }

        return page;
    }

    private async fetchParsedPage(pageId: number): Promise<ParsedPage> {
        try {
            const parsedPageURL = this.getParsedPageURL(pageId);
            const request = await axios.get(parsedPageURL.href);
            const parsedPage = (await request).data as ParsedPage;
            return parsedPage;
        } catch (error) {
            logger.error(error);
            logger.error(`Unable to fetch parse page: ${pageId}`);
        }
        return {};
    }

    private getBaseURL(wikiName: string): URL {
        if (this._lang === I18n.en) {
            return new URL(`https://${wikiName}.fandom.com/api.php`);
        }

        return new URL(`https://${wikiName}.fandom.com/${this._lang}/api.php`);
    }

    private getBatchOfPagesURL(_continue?: Continue): URL {
        if (_continue) {
            return new URL(
                `${this._lang}/api.php?action=query&list=allpages&redirects&format=json&formatversion=2&apcontinue=${_continue.apcontinue}&continue=${_continue.continue}&aplimit=500`,
                this._wiki.baseURL,
            );
        }

        return new URL(
            `${this._lang}/api.php?action=query&list=allpages&redirects&format=json&formatversion=2&aplimit=500`,
            this._wiki.baseURL,
        );
    }

    private getParsedPageURL(pageId: number): URL {
        return new URL(
            `${this._lang}/api.php?action=parse&pageid=${pageId}&prop=text|langlinks|headhtml&format=json&formatversion=2`,
            this._wiki.baseURL,
        );
    }
}
