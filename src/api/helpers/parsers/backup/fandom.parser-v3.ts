/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-restricted-syntax */
import ora from 'ora';
import pLimit from 'p-limit';
import cheerio from 'cheerio';
import sizeof from 'object-sizeof';
import cliProgress from 'cli-progress';
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
        const runikDictionary = new RunikDictionary(
            this._wiki.name,
            this._lang,
            capacity,
        );
        const spinner = ora().start(
            `🛠️  Creating dictionary for ${this._wiki.name} ...\n`,
        );

        await this.populateDictionary(runikDictionary);
        logger.warn(
            `5️⃣ The script uses approximately ${
                process.memoryUsage().heapUsed / 1024 / 1024
            } MB`,
        );

        gc();

        logger.warn(
            `6️⃣ The script uses approximately ${
                process.memoryUsage().heapUsed / 1024 / 1024
            } MB`,
        );

        spinner.stop();
        logger.warn(
            `✅  Finished creating 📙 dictionary for ${this._wiki.name}: ${runikDictionary.size} entries`,
        );

        console.log(
            `The dictionary is ${sizeof(runikDictionary) / 1024 / 1024}MB`,
        );

        return runikDictionary;
    }

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

    private async populateDictionary(runikDictionary: RunikDictionary) {
        try {
            const apiLimit = Math.ceil(runikDictionary.capacity / 100);
            gc();

            logger.warn(
                `1️⃣ The script uses approximately ${
                    process.memoryUsage().heapUsed / 1024 / 1024
                } MB`,
            );
            logger.warn('Fetching all pages ...');
            const pages = await this.fetchAllPages(apiLimit);
            logger.warn('🏁 Finished fetching initial pages.');

            gc();
            logger.warn(
                `2️⃣ The script uses approximately ${
                    process.memoryUsage().heapUsed / 1024 / 1024
                } MB`,
            );

            gc();

            logger.warn('Parsing page data ...');
            const parsedPages = await this.fetchAllPagesWithParsedData(pages);
            logger.warn('🏁 Finished parsing page data.');

            gc();
            logger.warn(
                `3️⃣ The script uses approximately ${
                    process.memoryUsage().heapUsed / 1024 / 1024
                } MB`,
            );

            gc();

            logger.warn('Adding definitions ...');
            await Promise.all(
                // eslint-disable-next-line array-callback-return
                parsedPages.map(parsedPage => {
                    try {
                        FandomParser.addDefinition(
                            parsedPage?.parse?.pageid || -1,
                            parsedPage?.parse?.title || '',
                            parsedPage?.parse?.text || '',
                            parsedPage?.parse?.headhtml || '',
                            runikDictionary,
                        );
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
                }),
            );
            logger.warn('🏁 Finished adding definitions.');

            gc();

            logger.warn(
                `4️⃣ The script uses approximately ${
                    process.memoryUsage().heapUsed / 1024 / 1024
                } MB`,
            );
        } catch (error) {
            if (!(error instanceof DictionaryCapacityException)) {
                logger.error(error);
                logger.error(`🚨 Unable to populate dictionary fully.`);
            }
        }
    }

    private static addDefinition(
        pageId: number,
        title: string,
        bodyHtml: string,
        headHtml: string,
        dictionary: RunikDictionary,
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

            // if (description.trim()) {
            const wordDefinition: WordDefinition = {
                word: title,
                information: {
                    definition: description.trim(),
                },
            };
            dictionary.addDefinition(wordDefinition);
            // }
        } else {
            logger.data(
                `Description for ${title} page: ${pageId} is empty. 🔁 Skipping ....`,
            );
        }
    }

    private async fetchAllPagesWithParsedData(
        pages: Page[],
        concurrencyLimit = 500,
    ): Promise<ParsedPage[]> {
        try {
            let counter = 0;

            // create a new progress bar instance and use shades_classic theme
            const progressBar = new cliProgress.SingleBar(
                {},
                cliProgress.Presets.shades_classic,
            );

            // start the progress bar with a total value of |pages| and start value of 0
            progressBar.start(pages.length, 0);

            /**
             * Limits how many requests are made concurrently. Defaults to 250.
             */
            const limit = pLimit(concurrencyLimit);
            const pagesPromises = pages.map(async (page: Page, idx) => {
                return limit(async () => {
                    try {
                        const pageWithParsedData =
                            await this.addParsedPageDetails(page);

                        // update the current value in your application..
                        counter += 1;
                        progressBar.update(counter);

                        return pageWithParsedData;
                    } catch (error) {
                        logger.error(error);
                        logger.error(
                            `Unable to add term: ${page.title} to dictionary. 🔁 Skipping ...`,
                        );
                    }
                    return page.page;
                });
            });

            const pagesWithParsedData = (await Promise.all(
                pagesPromises,
            )) as ParsedPage[];
            // stop the progress bar
            progressBar.stop();

            return pagesWithParsedData;
        } catch (error) {
            logger.error(error);
            logger.error(`Unable to fetch batch of pages.`);
        }
        return [];
    }

    private async fetchAllPages(limit = 1): Promise<Page[]> {
        try {
            let pages: Page[] = [];
            const batchedResults: AsyncGenerator<ApiResponse> =
                this.bot.continuedQueryGen(
                    {
                        action: 'query',
                        list: 'allpages',
                        aplimit: 500,
                    },
                    limit,
                );
            for await (let batchedResult of batchedResults) {
                if (batchedResult.query) {
                    pages = pages.concat(batchedResult.query.allpages);
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    batchedResult = null;
                }
            }

            return pages;
        } catch (error) {
            logger.error(error);
            logger.error(`Unable to fetch all pages.`);
        }
        return [];
    }

    private async addParsedPageDetails(page: Page): Promise<ParsedPage> {
        const parsedPage: ParsedPage = await this.fetchParsedPage(page.pageid);

        if (parsedPage) {
            return {
                ...parsedPage,
            };
        }

        return {} as ParsedPage;
    }

    private async fetchParsedPage(pageId: number): Promise<ParsedPage> {
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
