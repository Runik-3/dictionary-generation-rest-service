import ParsedPage from './parsed.page.interface';

export default interface Page {
    pageid: number;
    ns?: number;
    title: string;
    page?: ParsedPage;
}
