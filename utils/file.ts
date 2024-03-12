import path from 'path';
import fs from 'fs';

import { getDomainName } from './fetch';
import { LogType, colorizeLog } from './log';

export function writeHtmlToFile(url: string, html: string): string | null {
    try {
        const domainName = getDomainName(url);
        const fileName = `${domainName}.html`;
        const filePath = path.join(process.cwd(), fileName);

        fs.writeFileSync(filePath, html);

        return filePath;
    } catch (err) {
        console.error(colorizeLog(`Error writing HTML content to file: ${JSON.stringify(err)}`, LogType.Error));
        return null;
    }
}
