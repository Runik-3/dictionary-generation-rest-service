import I18n from '@interfaces/enums/language.enum';
import Dictionary from '@interfaces/dictionary.interface';
import { Definitions } from '@interfaces/definitions.interface';
import WordDefinition from '@interfaces/word.definition.interface';
import DictionaryCapacityException from '@errors/dictionary.capacity.exception';

export default class RunikDictionary implements Dictionary {
    private _size: number;

    private readonly _lang: I18n;

    public readonly _name: string;

    private readonly _capacity: number;

    private readonly _definitions: Definitions;

    constructor(name: string, lang: I18n, capacity = 250000) {
        this._size = 0;
        this._lang = lang;
        this._name = name;
        this._capacity = capacity;
        this._definitions = {};
    }

    // GETTERS
    public get size(): number {
        return this._size;
    }

    public get name(): string {
        return this._name;
    }

    public get lang(): I18n {
        return this._lang;
    }

    public get capacity(): number {
        return this._capacity;
    }

    public get definitions(): Definitions {
        return this._definitions;
    }

    /**
     * Attempts to add a given definition to the dictionary
     *
     * @param definition - The term and its associated definition to be added to dictionary
     * @returns `true` is the operation is successful; otherwise `false`
     *
     * @throws {@link DictionaryCapacityException}
     * Thrown if the dictionary has reached its max capacity
     */
    public addDefinition(definition: WordDefinition): boolean {
        if (!this.isTermAlreadyDefined(definition.word) && this.hasSpace()) {
            // TODO: refactor this for readability
            if (!(definition.information.definition || definition.word)) {
                return false;
            }

            this._definitions[definition.word] = definition.information;
            this._size += 1;
            return true;
        }

        // return false;
        throw new DictionaryCapacityException();
    }

    /**
     * Attempts to delete the specified term from the dictionary
     *
     * @param term - The word or phrase to be checked
     * @returns `true` if deletion is successful; otherwise `false`
     */
    public deleteDefinition(term: string): boolean {
        if (this.isTermAlreadyDefined(term)) {
            delete this._definitions[term];
            this._size -= 1;
            return true;
        }
        return false;
    }

    /**
     * Checks if dictionary has space
     *
     * @returns `true` if dictionary has space; otherwise `false`
     */
    public hasSpace(): boolean {
        return this._size < this._capacity;
    }

    /**
     * Checks if dictionary is full
     *
     * @returns `false` if dictionary has space; otherwise `true`
     */
    public isFull(): boolean {
        return !this.hasSpace();
    }

    /**
     * Checks to see if a given term already exists in the dictionary
     *
     * @param term - The word or phrase to be checked
     * @returns `true` if `term` already exists in the dictionary; otherwise `false`
     */
    private isTermAlreadyDefined(term: string): boolean {
        if (term in this._definitions) {
            return true;
        }
        return false;
    }
}
