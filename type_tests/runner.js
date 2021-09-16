const fs = require('fs');
const path = require("path");
const ts = require("typescript");

const compilerOptions = {
    noImplicitAny: true,
    strict: true,
    target: ts.ScriptTarget.ESNext,
    module: ts.ModuleKind.CommonJS
};

const tag = '@ts-error';

function getTagMetadata(fileContent, start) {

    const breakPos = fileContent.indexOf("\n", start);
    const line = breakPos === -1
        ? fileContent.substring(start)
        : fileContent.substring(start, breakPos);

    const tagPos = line.indexOf(tag);

    return tagPos === -1
        ? null
        : {comment: line.substring(tagPos + tag.length).trim()};
}

function getErrors(file) {

    if (!fs.existsSync(file)) throw `${file} does not exist`;

    const program = ts.createProgram([file], compilerOptions);
    const errors = program.getSemanticDiagnostics();

    errors.forEach(error => {

        const tag = getTagMetadata(error.file.text, error.start);

        if (tag == null) throw `${file} contains unexpected errors: ${JSON.stringify(error.messageText)}`;

        if (tag.comment) {
            console.log(file)
            console.log(tag.comment);
        }
    });
}

function getTestFiles() {
    return fs.readdirSync(__dirname)
        .filter(file => /test.ts$/.test(file))
        .map(file => path.join(__dirname, file));
}

function main() {
    getTestFiles().forEach(getErrors);
}

main();
