import WordDefinition from './word.definition.interface';

export default interface Dictionary {
    deleteDefinition(term: string): boolean;
    addDefinition(definition: WordDefinition): boolean;
}
