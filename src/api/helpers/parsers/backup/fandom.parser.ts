// /* eslint-disable import/no-unresolved */
// import axios from 'axios';
// import cheerio from 'cheerio';

// https://gameofthrones.fandom.com/api.php?action=query&format=json&redirects=1&prop=categoryinfo&list=allpages&aplimit=500
// https://gameofthrones.fandom.com/api.php?action=parse&pageid=41609&prop=text|langlinks|headhtml|categories&format=json

// import { logger } from '@utils/logger.util';
// import Category from '@interfaces/category.interface';
// import ParserException from '@errors/parser.exception';
// import Dictionary from '@interfaces/dictionary.interface';
// import Page from '@/api/interfaces/fandom.page.interface';
// import EXCLUDED from '../../constants/category.blacklist.constant';
// import WordDefinition from '@/api/interfaces/word.definition.interface';

// export default class FandomParser {
//     public static async generateDictionary(
//         fandomWikiName: string,
//     ): Promise<Dictionary> {
//         const pages = await FandomParser.extractPages(fandomWikiName);
//         const definitions = await FandomParser.createDefinitions(
//             fandomWikiName,
//             pages,
//         );
//         this.printDefinitions(definitions);
//         return { name: fandomWikiName, definitions };
//     }

//     private static async createDefinitions(
//         fandomWikiName: string,
//         pages: Page[],
//     ): Promise<WordDefinition[]> {
//         const definitions: WordDefinition[] = [];

//         logger.info(
//             `🛠️ Attempting to create dictionary for ${fandomWikiName} ... `,
//         );
//         logger.info(`Number of pages is: ${pages.length}`);
//         try {
//             await Promise.all(
//                 pages.map(async (page, idx) => {
//                     const pageData = await this.fetchPages(page.url);
//                     try {
//                         FandomParser.addDefinition(
//                             pageData,
//                             page,
//                             definitions,
//                             idx,
//                             pages.length,
//                         );
//                     } catch (error) {
//                         logger.error(error);
//                         logger.warn('Could not parse page. 🔁 Skipping ....');
//                     }
//                 }),
//             );
//         } catch (error) {
//             logger.error(error);
//             throw new ParserException(
//                 `💔 Unable to create dictionary for ${fandomWikiName}`,
//             );
//         }
//         logger.info(`🏁 Finished creating dictionary for ${fandomWikiName}`);
//         return definitions;
//     }

//     private static addDefinition(
//         pageData: string,
//         page: Page,
//         definitions: WordDefinition[],
//         idx: number,
//         total: number,
//     ): void {
//         const $ = cheerio.load(pageData);
//         const warning = $('.notice metadata u b').text();
//         const container = $('.mw-parser-output').first();
//         // let
//         let description = $(container).find('p b').first().parent('p').text();

//         if (!description) {
//             description = $(`p:contains("**${page.name}**")`).first().text();
//         }

//         if (!description) {
//             description = $('.quote').first().next('p').text();
//         }

//         if (description) {
//             // TODO: Extract metadata here
//             const wordDefinition: WordDefinition = {
//                 word: page.name,
//                 information: {
//                     definition: description,
//                 },
//             };

//             definitions.push(wordDefinition);
//             logger.info(`Processed: ${idx + 1} / ${total}`);
//         } else {
//             logger.warn(
//                 `Description for ${page.url}  is empty. 🔁 Skipping ....`,
//             );
//         }
//     }

//     private static async extractPages(fandomWikiName: string): Promise<Page[]> {
//         const pages: Page[] = [];
//         const categories = await this.parseCategories(fandomWikiName);

//         logger.info(`🛠️ Attempting to create pages for ${fandomWikiName} ... `);
//         await Promise.all(
//             categories.map(async (category, idx) => {
//                 const newPages = await this.parseCategory(
//                     fandomWikiName,
//                     category,
//                 );
//                 pages.push(...newPages);
//             }),
//         );
//         logger.info(`🏁 Created list of pages for ${fandomWikiName}!`);
//         return pages;
//     }

//     private static async parseCategory(
//         fandomWikiName: string,
//         category: Category,
//     ): Promise<Page[]> {
//         const pages: Page[] = [];
//         try {
//             const pagesData = await this.fetchPages(category.url);
//             const $ = cheerio.load(pagesData);
//             const pagesList = $('.category-page__members ul li a');

//             pagesList.each((idx, a) => {
//                 try {
//                     const name = $(a).text();
//                     const link = $(a).attr('href');

//                     this.addPage(name, link, fandomWikiName, pages);
//                 } catch (error) {
//                     logger.error(error);
//                     logger.warn('Could not parse page. 🔁 Skipping ....');
//                 }
//             });
//         } catch (error) {
//             logger.error(error);
//             throw new ParserException(
//                 `💔 Unable to get pages for ${category.name}`,
//             );
//         }
//         return pages;
//     }

//     private static addPage(
//         name: string,
//         link: string | undefined,
//         fandomWikiName: string,
//         pages: Page[],
//     ): void {
//         if (name && link) {
//             const newPage: Page = FandomParser.createPage(
//                 link,
//                 fandomWikiName,
//                 name,
//             );

//             if (link.toLowerCase().includes('category:')) {
//                 logger.warn(
//                     `Page ${name} references another Category. 🔁 Skipping ....`,
//                 );
//             } else if (link.toLowerCase().includes('template:')) {
//                 logger.warn(`Page is a template. 🔁 Skipping ....`);
//             } else if (name.includes('<img')) {
//                 logger.warn(`Page is an image. 🔁 Skipping ....`);
//             } else {
//                 pages.push(newPage);
//             }
//         } else {
//             logger.warn('Could not add page. 🔁 Skipping ....');
//         }
//     }

//     // TODO: Refactor this and create Category to use the same interface <T>
//     private static createPage(
//         link: string,
//         fandomWikiName: string,
//         name: string,
//     ): Page {
//         const url = new URL(link, this.getFandomBaseURL(fandomWikiName));
//         const newPage: Page = {
//             name,
//             url,
//         };
//         return newPage;
//     }

//     private static async fetchPages(url: URL): Promise<string> {
//         try {
//             const res = await axios.get(url.href);
//             const { data: pagesData } = await res;
//             return pagesData;
//         } catch (error) {
//             logger.error(error);
//             logger.error(`Unable to process url: ${url.href}`);
//         }
//         return '';
//     }

//     /**
//      * Returns a mapping of the each category and it's associated url
//      *
//      * @param fandomWikiName - The name of the fandom wiki/universe
//      * @returns A list of the different categories in `fandomWikiName` and it's corresponding url
//      */
//     private static async parseCategories(
//         fandomWikiName: string,
//     ): Promise<Category[]> {
//         const categories: Category[] = [];
//         try {
//             const categoriesPage = await this.fetchCategories(fandomWikiName);

//             logger.info('🛠️ Attempting to create pages ... ');
//             const $ = cheerio.load(categoriesPage);
//             const categoriesList = $('#content ul li');

//             categoriesList.each((idx, category) => {
//                 try {
//                     const a = $(category).find('a');
//                     const name = $(a).text();
//                     const link = $(a).attr('href');

//                     this.addCategory(name, link, fandomWikiName, categories);
//                 } catch (error) {
//                     logger.error(error);
//                     logger.warn('Could not parse category. 🔁 Skipping ....');
//                 }
//             });
//             logger.info('🏁 Created list of categories!');
//         } catch (error) {
//             logger.error(error);
//             throw new ParserException('💔 Unable to get wiki categories.');
//         }
//         return categories;
//     }

//     private static addCategory(
//         name: string,
//         link: string | undefined,
//         fandomWikiName: string,
//         categories: Category[],
//     ): void {
//         if (name && link) {
//             const newCategory: Category = FandomParser.createCategory(
//                 link,
//                 fandomWikiName,
//                 name,
//             );

//             if (
//                 EXCLUDED.some(category => name.toLowerCase().includes(category))
//             ) {
//                 logger.warn(
//                     `Category '${name}' is blacklisted. 🔁 Skipping ....`,
//                 );
//                 return;
//             }
//             categories.push(newCategory);
//         } else {
//             logger.warn('Could not add category. 🔁 Skipping ....');
//         }
//     }

//     /**
//      *
//      * @remarks
//      * `link` is just the relative path to the given category, for instance: `/wiki/Category:Valyrians`
//      *
//      * @param link - The url
//      * @param fandomWikiName - The name of the fandom wiki/universe
//      * @param name - The name of the category
//      *
//      * @returns A new Category for given `fandomWikiName` based on `name` and `link`
//      */
//     private static createCategory(
//         link: string,
//         fandomWikiName: string,
//         name: string,
//     ): Category {
//         // This creates the full URL: https://gameofthrones.fandom.com/wiki/Category:Valyrians
//         const url = new URL(link, this.getFandomBaseURL(fandomWikiName));
//         const newCategory: Category = {
//             name,
//             url,
//         };
//         return newCategory;
//     }

//     /**
//      * Retrieves the webpage containing the categories contained within a given wiki
//      *
//      * @remarks
//      * This method limits the categories to 2500 by default (no wiki should have more)
//      *
//      * @see {@link https://community.fandom.com/wiki/Help:Category} for more on Categories
//      *
//      *
//      * @param fandomWikiName - The name of the fandom wiki/universe
//      * @returns The html page containing all the categories contained in `fandomWikiName`
//      */
//     private static async fetchCategories(
//         fandomWikiName: string,
//     ): Promise<string> {
//         try {
//             const url: URL = this.getCategoriesURL(fandomWikiName, 80);
//             const res = await axios.get(url.href);
//             const { data: categoriesPage } = await res;
//             return categoriesPage;
//         } catch (error) {
//             logger.error(error);
//             logger.error(`Unable to process fandom: ${fandomWikiName}`);
//         }
//         return '';
//     }

//     private static isCategoryValid(
//         name: string | undefined,
//         link: string | undefined,
//     ): boolean {
//         if (name && link) {
//             return true;
//         }
//         return false;
//     }

//     private static printCategories(categories: Category[]): void {
//         logger.info(`There are ${categories.length} categories`);
//         categories.forEach(category => {
//             logger.info(
//                 `Name:${category.name} ===> URL: ${category.url.href}\n`,
//             );
//         });
//     }

//     private static printPages(pages: Page[]): void {
//         logger.info(`There are ${pages.length} pages`);
//         pages.forEach(page => {
//             logger.info(`Name:${page.name} ===> URL: ${page.url.href}\n`);
//         });
//     }

//     private static printDefinitions(definitions: WordDefinition[]): void {
//         logger.info(`There are ${definitions.length} pages`);
//         definitions.forEach(definition => {
//             logger.info(
//                 `Name:${definition.word} ===> Description: ${definition.information.definition}\n`,
//             );
//         });
//     }

//     private static getCategoriesURL(fandomWikiName: string, limit = 2500): URL {
//         return new URL(
//             `https://${fandomWikiName}.fandom.com/wiki/Special:Categories?limit=${limit}`,
//         );
//     }

//     private static getFandomBaseURL(fandomWikiName: string): string {
//         return `https://${fandomWikiName}.fandom.com`;
//     }
// }
