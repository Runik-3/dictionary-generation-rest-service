import * as shell from 'shelljs';

shell.cp('-R', 'src/public/js', 'dist/src/public/');
shell.cp('-R', 'src/public/img', 'dist/src/public/');
shell.cp('-R', 'src/public/css', 'dist/src/public/');
shell.cp('-R', 'src/public/fonts', 'dist/src/public/');
