import Dictionary from './dictionary.interface';
import { RunikFile } from './runik.file.interface';

export default interface FileGenerator<
    D extends Dictionary,
    F extends RunikFile,
> {
    generate(dictionary: D): F;
}
