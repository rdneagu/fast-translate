import rdl from 'readline';
import fs from 'fs';

import { TranslationServiceClient } from '@google-cloud/translate';
import { LoadingBar } from "./classes/LoadingBar.js";

// Google Cloud API stuff
process.env.GOOGLE_APPLICATION_CREDENTIALS = 'key.json';

const translationClient = new TranslationServiceClient();

const projectId = 'distributed-inn-359610';
const location = 'global';

// Translation init
const translationInput = fs.readFileSync('./translations/input.json', 'utf8');
let translated = {};

const languages = ['da', 'de', 'no', 'pl', 'ro', 'sv']; // Uncomment for admin-web
// const languages = ['cs', 'da', 'de', 'el', 'es', 'fi', 'fr', 'hu', 'is', 'it', 'nl', 'no', 'pl', 'ro', 'sk', 'sv']; // Uncomment for checkout-web

let totalBar;
let translationBar;

let currentProgress = 0;
const totalPhrases = [];

async function start() {
    prepare();

    for (let [index, lang] of languages.entries()) {
        currentProgress = 0;
        translationBar.reset();
        totalBar.updateProgress(`Translating to "${lang}"`, index / languages.length);

        translated[lang] = JSON.parse(translationInput);

        await recursiveTranslate(translated[lang], lang);
        fs.writeFileSync(`translations/${lang}_translated.json`, JSON.stringify(translated[lang], null, 4), 'utf8');
    }

    totalBar.updateProgress(`Finished translating`, 1);
    translationBar.updateProgress(`Finished translating`, 1);
}

function prepare() {
    rdl.cursorTo(process.stdout, 0, 0);
    rdl.clearScreenDown(process.stdout);

    JSON.parse(translationInput, (key, value) => {
        if (typeof value === 'string') {
            totalPhrases.push(value);
        }
        return value;
    });

    totalBar = new LoadingBar();
    translationBar = new LoadingBar();
}

async function recursiveTranslate(obj, lang) {
    for (let k of Object.keys(obj)) {
        if (typeof obj[k] === 'string') {
            currentProgress++;
            translationBar.updateProgress(`Translating "${k}"`, currentProgress / totalPhrases.length);
            obj[k] = await translateText(obj[k], lang);
        } else {
            await recursiveTranslate(obj[k], lang);
        }
    }
}

async function translateText(text, lang) {
    const request = {
        parent: `projects/${projectId}/locations/${location}`,
        contents: [text],
        mimeType: 'text/plain',
        sourceLanguageCode: 'en',
        targetLanguageCode: lang,
    };

    const [response] = await translationClient.translateText(request);
    return response.translations.map((translation) => translation.translatedText).join(' ');
}

start().then();
