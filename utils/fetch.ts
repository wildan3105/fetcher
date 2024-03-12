import axios, { AxiosResponse } from 'axios';
import { LogType, colorizeLog } from './log';

export interface HttpResponseData {
    valid: boolean;
    body: AxiosResponse | null;
}

export async function checkHttpResponse(url: string, retryCount: number = 5): Promise<HttpResponseData> {
    try {
        let currentRetry = 0;

        const retryWithExponentialBackoff = async (): Promise<HttpResponseData> => {
            try {
                const response = await axios.get(url);
                const statusCode = response.status;
                return {
                    valid: statusCode < 400,
                    body: response.data
                };
            } catch (err) {
                if (currentRetry < retryCount) {
                    const backoffDelay = Math.pow(2, currentRetry) * 1000;
                    console.error(
                        `Error checking HTTP status code for ${url}. Retrying in ${
                            backoffDelay / 1000
                        } second(s). Retry count: ${currentRetry + 1}`
                    );
                    await new Promise((resolve) => setTimeout(resolve, backoffDelay));
                    currentRetry++;
                    return retryWithExponentialBackoff();
                } else {
                    console.error(
                        colorizeLog(
                            `Error checking HTTP status code for ${url} after ${retryCount} retries. Last error: ${JSON.stringify(
                                err
                            )}`,
                            LogType.Info
                        )
                    );
                    return {
                        valid: false,
                        body: null
                    };
                }
            }
        };

        return retryWithExponentialBackoff();
    } catch (err) {
        console.error(colorizeLog(`Unexpected error in _checkHttpResponse: ${JSON.stringify(err)}`, LogType.Error));
        return {
            valid: false,
            body: null
        };
    }
}

export function isValidURL(url: string) {
    try {
        const validURL = new URL(url);
        if (validURL) return true;
    } catch (err) {
        return false;
    }
}

export function getDomainName(urlString: string): string {
    try {
        const urlObject = new URL(urlString);
        const domainName = urlObject.hostname || '';
        return domainName.replace(/^www\./, '');
    } catch (err) {
        console.error(colorizeLog(`Error parsing URL: ${JSON.stringify(err)}`, LogType.Error));
        return '';
    }
}
