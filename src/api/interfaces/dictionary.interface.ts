import I18n from './enums/language.enum';
import Definition from './definition.interface';

export default interface Dictionary {
    name: string;
    lang: I18n;
    definitions: { [term: string]: Definition };
}
