/* eslint-disable prettier/prettier */
import { XDXF } from '@interfaces/xdxf.interface';
import FileGenerator from '@interfaces/file.generator.interface';
import RunikDictionary from '@helpers/dictionary/runik.dictionary';
import Definition from '@interfaces/definition.interface';

export default class XDXFGenerator
    implements FileGenerator<RunikDictionary, XDXF>
{
    // eslint-disable-next-line class-methods-use-this
    public generate(dictionary: RunikDictionary): XDXF {
        let fileBody: XDXF = '';

        Object.entries(dictionary.definitions).forEach(([term, definition]) => {
            fileBody = XDXFGenerator.addDefinition(fileBody, term, definition);
        });

        const file = `
            <?xml version="1.0" encoding="UTF-8" ?>
            <!DOCTYPE xdxf SYSTEM "https://raw.github.com/soshial/xdxf_makedict/master/format_standard/xdxf_strict.dtd">
            <xdxf lang_from="${dictionary.lang}" lang_to="${dictionary.lang}" format="logical" revision="001">
                <meta_info>
                    <title>${dictionary.name}</title>
                    <full_title>${dictionary.name}</full_title>
                    <description></description>
                    <file_ver>001</file_ver>
                    <creation_date>
                        ${new Date().toISOString().slice(0, 10)}
                    </creation_date>
                </meta_info>
                <lexicon>
                    ${fileBody}
                </lexicon>
            </xdxf>
        `;

        return file;
    }

    private static addDefinition(
        file: XDXF,
        term: string,
        definition: Definition,
    ): XDXF {
        const definitionTag = `
            <ar>
                <k id="${term}">${term}</k>
                <def>
                    <def>${definition.definition}</def>
                </def>
            </ar>
        `;

        return file + definitionTag;
    }
}
