export default interface ParsedPage {
    parse?: {
        title?: string;
        pageid?: number;
        text?: string;
        langlinks?: [
            {
                lang: string;
                url: string;
                langname: string;
                autonym: string;
                '*': string;
            },
        ];
        headhtml?: string;
        categories?: [];
    };
}
