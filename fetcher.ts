#! /usr/bin/env node

import { Command } from 'commander';
import * as cheerio from 'cheerio';

import { checkHttpResponse, isValidURL } from './utils/fetch';
import { writeHtmlToFile } from './utils/file';
import { colorizeLog, LogType } from './utils/log';

const programDesc = 'CLI program to fetch web pages and save them for later retrieval and browsing';

interface CommandOptions {
    metadata?: boolean;
    overrideMaxLinks?: boolean;
    setMaxTimeout?: number;
}

const MINUTES_TO_MILIS = 60 * 1000;

const defaultValues = {
    appTimeout: 5,
    maxAppTimeout: 10,
    linksLimited: true,
    maxLinks: 5,
    showMetadata: false
};

export class FetchCommand {
    links: string[];
    appTimeout: number;
    maxLinks: number;
    linksLimited: boolean;
    showMetadata: boolean;

    constructor(links: string[], options?: CommandOptions) {
        this.links = links;
        this.appTimeout = defaultValues.appTimeout;
        this.maxLinks = defaultValues.maxLinks;
        this.linksLimited = defaultValues.linksLimited;
        this.showMetadata = defaultValues.showMetadata;

        if (options?.setMaxTimeout) {
            const maxTimeout = Number(options.setMaxTimeout);
            if (isNaN(maxTimeout) || maxTimeout <= 0 || maxTimeout > defaultValues.maxAppTimeout) {
                const errorMessage = `[ERR] Not allowed app timeout of ${maxTimeout}. Please provide positive number less than or equal to ${defaultValues.maxAppTimeout}`;
                console.error(colorizeLog(errorMessage, LogType.Error));
                process.exit(1);
            }
            this.appTimeout = options.setMaxTimeout;
        }

        if (options?.overrideMaxLinks) {
            if (options.overrideMaxLinks === true) {
                this.linksLimited = false;
            }
        }

        if (links.length > this.maxLinks && this.linksLimited === true) {
            const errorMessage = `[ERR] Links are limited to 5. Use flag --override-max-links if you want to proceeed with unlimited links.`;
            console.error(colorizeLog(errorMessage, LogType.Error));
            process.exit(1);
        }

        if (options?.metadata) {
            this.showMetadata = true;
        }
    }

    public async execute(): Promise<void> {
        const maxTimeout = (this.appTimeout || defaultValues.appTimeout) * MINUTES_TO_MILIS;

        const timeoutId = setTimeout(() => {
            console.error(colorizeLog(`[ERR] Maximum CLI timeout reached. Exiting...`, LogType.Error));
            process.exit(1);
        }, maxTimeout);

        const promises: Promise<void>[] = [];

        for (const link of this.links) {
            if (isValidURL(link)) {
                promises.push(this.showResult(link));
            } else {
                console.error(
                    colorizeLog(
                        `[ERR] Invalid link: '${link}'. Please use the protocol of either 'http' or 'https'`,
                        LogType.Error
                    )
                );
            }
        }

        await Promise.allSettled(promises);

        clearTimeout(timeoutId);
    }

    private async showResult(url: string): Promise<void> {
        try {
            const httpResponseData = await checkHttpResponse(url);
            if (!httpResponseData.valid) {
                console.error(colorizeLog(`[ERR] Failed to fetch content for ${url}`, LogType.Error));
                return;
            }

            const html = httpResponseData.body as unknown as string;
            const outputMessage = this.buildOutputMessage(url, html);

            console.log(colorizeLog(outputMessage));
        } catch (err) {
            console.error(
                colorizeLog(`Error checking HTTP status code for ${url}: ${JSON.stringify(err)}`, LogType.Error)
            );
        }
    }

    private buildOutputMessage(url: string, html: string): string {
        let outputMessage = '';

        if (this.showMetadata) {
            outputMessage = this.buildMetadataMessage(url, html);
        } else {
            outputMessage = `Success for ${url}`;
        }

        const fileName = writeHtmlToFile(url, html);
        outputMessage += ` HTML content stored as ${fileName}`;

        return outputMessage;
    }

    private buildMetadataMessage(url: string, html: string): string {
        const $ = cheerio.load(html);
        const links = $('a');
        let linkCount = 0;

        links.each((_, v) => {
            const linkHref = $(v).attr('href');

            if (linkHref && (linkHref.startsWith('http://') || linkHref.startsWith('https://'))) {
                linkCount++;
            }
        });

        const images = $('img');
        let imageCount = 0;

        images.each((_, v) => {
            const imageUrl = $(v).attr('src');
            if (imageUrl) {
                imageCount++;
            }
        });

        return `Visited page of ${url} at ${new Date().toString()} with num_of_links: ${linkCount}, num_of_images: ${imageCount},`;
    }
}

const program = new Command();

program.version('1.0.0').description(programDesc);

program.configureOutput({
    writeOut: (str) => process.stdout.write(`${str}`),
    writeErr: (str) => process.stdout.write(`[ERR] ${str}`),
    outputError: (str, write) => write(colorizeLog(str, LogType.Error))
});

program
    .argument('<links...>', 'A space-separated links with the protocol (http or https)')
    .option(
        '--metadata',
        'Show additional information about the fetched web pages, such as the date and time of retrieval, number of images, and number of links.'
    )
    .option(
        '--override-max-links',
        'Allow fetching of more than the default maximum of 5 links per command. Use this option to process an unlimited number of links.'
    )
    .option(
        '--set-max-timeout [value]',
        'Specify a custom timeout (in minutes) for fetching and downloading content. The default timeout is 5 minutes, and the maximum allowed timeout is 10 minutes. Value must be a positive number up to 10.'
    )
    .action((links, options) => {
        const fetchCommand = new FetchCommand(links, options);
        fetchCommand.execute();
    });

program.showHelpAfterError();

program.parse(process.argv);

if (!process.argv.slice(2).length) {
    program.outputHelp();
}
