export default class DictionaryCapacityException extends Error {
    constructor() {
        super(
            'Dictionary has reached its capacity, cannot add more definitions',
        );
    }
}
