import Page from './page.interface';
import Continue from './media.wiki.api.continue.interface';

export default interface AllPagesBatchResult {
    batchcomplete?: string;
    continue?: Continue;
    query: {
        allpages: Page[];
    };
}
