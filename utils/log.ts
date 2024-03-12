export enum LogType {
    Info = 'info',
    Error = 'error'
}

const colors = {
    [LogType.Info]: '\x1b[32m', // Green
    [LogType.Error]: '\x1b[31m' // Red
};

const resetColor = '\x1b[0m';

export function colorizeLog(str: string, logType: LogType = LogType.Info): string {
    return `${colors[logType] || ''}${str}${resetColor}`;
}
