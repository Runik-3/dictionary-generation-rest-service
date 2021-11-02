import Dictionary from './dictionary.interface';

export default interface Parser {
    generateDictionary(capacity?: number): Promise<Dictionary>;
}
