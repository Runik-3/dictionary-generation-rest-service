/* eslint-disable no-restricted-syntax */
/* eslint-disable @typescript-eslint/ban-ts-comment */

import pLimit from 'p-limit';
import cheerio from 'cheerio';
import { mwn as Mwn, ApiResponse } from 'mwn';

import { logger } from '@utils/logger.util';
import Page from '@interfaces/page.interface';
import gc from '@utils/garbage.collector.util';
import Language from '@interfaces/lang.interface';
import Parser from '@interfaces/parser.interface';
import I18n from '@interfaces/enums/language.enum';
import ParsedPage from '@interfaces/parsed.page.interface';
import FandomWiki from '@interfaces/fandom.wiki.interface';
import RunikDictionary from '@helpers/dictionary/runik.dictionary';
import { WIKI_PASSWORD, WIKI_USERNAME } from '@utils/secrets.util';
import WordDefinition from '@interfaces/word.definition.interface';
import DictionaryCapacityException from '@errors/dictionary.capacity.exception';

export default class FandomParser implements Parser {
    private _bot: Mwn;

    private readonly _lang: I18n;

    private _dictionary!: RunikDictionary;

    private readonly _wiki: FandomWiki;

    constructor(wiki: string, lang = I18n.en) {
        this._lang = lang;

        this._wiki = {
            name: wiki,
            baseURL: this.getBaseURL(wiki),
        };

        this._bot = new Mwn({
            apiUrl: this._wiki.baseURL.href,
            username: WIKI_USERNAME,
            password: WIKI_PASSWORD,
            silent: false,
            retryPause: 3000,
            maxRetries: 3,
        });
    }

    public get lang(): I18n {
        return this._lang;
    }

    public get wikiName(): string {
        return this._wiki.name;
    }

    public get bot(): Mwn {
        return this._bot;
    }

    /**
     * Builds a dictionary for the terms in the specified Fandom Wiki
     *
     * @param capacity - The maximum number of entries allowed in the dictionary
     * @returns A dictionary of terms and their definitions for the given wiki
     */
    public async generateDictionary(
        capacity?: number,
    ): Promise<RunikDictionary> {
        this._dictionary = new RunikDictionary(
            this._wiki.name,
            this._lang,
            capacity,
        );
        logger.warn(`🛠️  Creating dictionary for ${this._wiki.name} ...`);

        await this.populateDictionary();

        logger.warn(
            `1️⃣ This request uses approximately ${
                process.memoryUsage().heapUsed / 1024 / 1024
            } MB`,
        );

        logger.warn(
            `✅  Finished creating 📙 dictionary for ${this._wiki.name}: ${this._dictionary.size} entries`,
        );

        return this._dictionary;
    }

    /**
     * Fetches a list of supported languages for the given wiki `page`
     *
     * @param page - The wiki on interest
     * @returns - A list of languages the specified wiki supports
     */
    public async fetchSupportedLanguages(page: string): Promise<Language[]> {
        try {
            const parsedPage = await this._bot.request({
                action: 'parse',
                page,
                prop: 'langlinks',
            });

            return parsedPage.parse.langlinks as Language[];
        } catch (error) {
            logger.error(error);
            logger.error(`Unable to fetch supported languages.`);
        }
        return [];
    }

    /**
     * Populates the dictionary with parsed terms from the wiki
     *
     * @remarks
     * Pages are fetched in batches of 100, then parsed, and then the relevant definitions added
     */
    private async populateDictionary(): Promise<void> {
        try {
            let batchedResults: AsyncGenerator<ApiResponse> =
                this.bot.continuedQueryGen({
                    action: 'query',
                    list: 'allpages',
                    aplimit: 100,
                });

            for await (let batchedResult of batchedResults) {
                if (this._dictionary.isFull()) {
                    break;
                }

                let { query } = batchedResult;
                if (query) {
                    let pages: Page[] = query.allpages;
                    if (pages) {
                        await this.parsePages(pages);
                    }

                    // @ts-ignore
                    pages = null;
                    gc();
                }

                // @ts-ignore
                query = null;

                // @ts-ignore
                batchedResult = null;
                gc();
            }

            // @ts-ignore
            batchedResults = null;
            gc();
        } catch (error) {
            logger.error(error);
            logger.error(`Unable to fetch all pages.`);
        }
    }

    /**
     * Scrapes the given body & head HTML tags to find and add definition to dictionary
     *
     * @param pageId - The id of a given wiki page
     * @param title - The title of given wiki page
     * @param bodyHtml - The body HTML for a given wiki page
     * @param headHtml  - The head HTML for a given wiki page
     */
    private addDefinition(
        pageId: number,
        title: string,
        bodyHtml: string,
        headHtml: string,
    ): void {
        // TODO: Refine this section for parsing
        const $ = cheerio.load(bodyHtml);

        let description = '';
        description = $('p b').first().parent('p').text();

        if (!description) {
            description = $('.quote').first().next('p').text();
        }

        if (!description) {
            description = $(`p:contains("**${title}**")`).first().text();
        }

        if (description.trim() !== '') {
            // TODO: Extract metadata here

            const wordDefinition: WordDefinition = {
                word: title,
                information: {
                    definition: description.trim(),
                },
            };
            this._dictionary.addDefinition(wordDefinition);
        } else {
            logger.data(
                `Description for ${title} page: ${pageId} is empty. 🔁 Skipping ....`,
            );
        }
    }

    /**
     * Parses the given `pages` and adds the corresponding definitions (if found)
     *
     * @param pages - A list of the pages to parse
     */
    private async parsePages(
        pages: Page[],
        concurrencyLimit = 100,
    ): Promise<void> {
        /**
         * Limits how many requests are made concurrently. Defaults to 100.
         */
        const limit = pLimit(concurrencyLimit);

        await Promise.all(
            pages.map(async page => {
                return limit(async () => {
                    try {
                        let parsedPage = await this.fetchParsedPage(page);

                        if (this._dictionary.hasSpace()) {
                            this.addDefinition(
                                parsedPage?.parse?.pageid || -1,
                                parsedPage?.parse?.title || '',
                                parsedPage?.parse?.text || '',
                                parsedPage?.parse?.headhtml || '',
                            );
                        }

                        // @ts-ignore
                        parsedPage = null;
                        gc();
                    } catch (error) {
                        if (error instanceof DictionaryCapacityException) {
                            logger.error(
                                `⛔ Dictionary has reached its capacity.`,
                            );
                            throw error;
                        }
                        logger.error(error);
                        logger.data('Could not parse page. 🔁 Skipping ...');
                    }
                });
            }),
        );
    }

    private async fetchParsedPage(page: Page): Promise<ParsedPage> {
        const parsedPage: ParsedPage = await this.addParsedPageDetails(
            page.pageid,
        );

        if (parsedPage) {
            return {
                ...parsedPage,
            };
        }

        return {} as ParsedPage;
    }

    /**
     *
     * @param pageId - The id of the specific wiki page
     * @returns - A parsed version of the specified page
     */
    private async addParsedPageDetails(pageId: number): Promise<ParsedPage> {
        try {
            const parsedPage = await this._bot.request({
                action: 'parse',
                pageid: pageId,
                prop: ['text', 'langlinks', 'headhtml', 'categories'],
            });

            return parsedPage as ParsedPage;
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
}
