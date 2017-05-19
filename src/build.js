let Fs = require("fs");
let Fse = require("fs-extra");
let Path = require("path");
let Babel = require("babel-core");
let Csso = require("csso");
let Glob = require("glob")
let childProcess = require("child_process");

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

let readFile = (filePath) => {
    return Fs.readFileSync(filePath, "utf8");
};

let writeFile = (filePath, fileContent) => {
    createDir(Path.dirname(filePath));
    Fs.writeFileSync(filePath, fileContent, "utf8");
};

let fileExists = (filePath) => {
    return Fs.existsSync(filePath);
};

let createDir = (dirPath) => {
    Fse.ensureDirSync(dirPath);
};

let removeDir = (dirPath) => {
    if (fileExists(dirPath)) {
        Fse.removeSync(dirPath);
    }
};

let isEmptyDir = (dirPath) => {
    let paths = Fs.readdirSync(dirPath).filter(path => path !== ".DS_Store");
    return paths.length === 0;
};

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

let build = () => {
    var re = /node_modules\//g;

    let xelHTML = readFile(`${__dirname}/xel/xel.html`);
    xelHTML = xelHTML.replace(re, '');

    let parts = xelHTML.split("<script").filter($0 => $0.includes("</script>"));
    parts = parts.map($0 => "<script" + $0.substring(0, $0.lastIndexOf("</script>") + "</script>".length));
    let paths = parts.map($0 => $0.substring($0.indexOf("src=") + 5, $0.lastIndexOf(`"`)));

    let xelMinJS = "";

    for (let path of paths) {
        xelMinJS += readFile(__dirname + "/" + path);
    }


    xelMinJS = xelMinJS.replace(re, '');
    xelMinJS = vulcanizeScript(xelMinJS);

    writeFile(`${__dirname}/../build/dist/js/xel.js`, `${xelMinJS}`);

    // xelMinJS = minifyScript(xelMinJS);

    // writeFile(`${__dirname}/../build/dist/js/xel.min.js`, `${xelMinJS}`);

    Fse.ensureDirSync(`${__dirname}/prismjs/themes`);
    Fse.copySync(`${__dirname}/../node_modules/prismjs/themes/prism-coy.css`, `${__dirname}/prismjs/themes/prism-coy.css`);
    Fse.copySync(`${__dirname}/../node_modules/prismjs/prism.js`, `${__dirname}/../build/dist/js/prism.js`);

    Fse.copySync(`${__dirname}/xel/images`, `${__dirname}/../build/dist/images`);
    createDir(`${__dirname}/../build/dist/stylesheets`);
    Fse.copySync(`${__dirname}/xel/stylesheets/macos.theme.css`, `${__dirname}/../build/dist/stylesheets/macos.theme.css`);
    Fse.copySync(`${__dirname}/xel/stylesheets/material.theme.css`, `${__dirname}/../build/dist/stylesheets/material.theme.css`);
    Fse.copySync(`${__dirname}/xel/views`, `${__dirname}/../build/dist/views`);
    Fse.copySync(`${__dirname}/appviews`, `${__dirname}/../build/dist/appviews`);
    Fse.copySync(`${__dirname}/../data`, `${__dirname}/../build/dist/data`);

};

let minifyScript = (scriptJS) => {
    let phase1 = Babel.transform(scriptJS, {
        presets: ["es2015"],
        plugins: ["transform-custom-element-classes"]
    });

    let phase2 = Babel.transform(phase1.code, {
        presets: ["babili"],
        minified: true,
        comments: false,
        compact: true
    });

    return `(function() {` + phase2.code + `})()`;
};


let vulcanizeScript = (scriptJS) => {
    let result = "";
    let parts = [""];

    for (let i = 0; i < scriptJS.length; i += 1) {
        let char = scriptJS[i];

        if (char === "<" && scriptJS.substr(i, 6) === "<link ") {
            parts.push(char);
        } else if (char === ">" && parts[parts.length - 1].startsWith("<link")) {
            parts[parts.length - 1] += char;
            parts.push("");
        } else {
            parts[parts.length - 1] += char;
        }
    }

    parts = parts.filter($0 => $0 !== "");

    for (let part of parts) {
        if (part.startsWith("<link ") && part.includes("data-vulcanize")) {
            let hrefStartIndex = part.indexOf('href="') + 'href="'.length;
            let hrefEndIndex = part.indexOf('"', hrefStartIndex);
            let href = part.substring(hrefStartIndex, hrefEndIndex);
            let styleCSS = readFile(`${__dirname}/${href}`);
            let minifiedCSS = Csso.minify(styleCSS).css;

            result += "<style>" + minifiedCSS + "</style>";
        } else {
            result += part;
        }
    }

    return result;
}




build();
