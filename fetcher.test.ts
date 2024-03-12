import { FetchCommand } from './fetcher';
import axios from 'axios';

// Mocking fs module
jest.mock('fs', () => ({
    writeFileSync: jest.fn()
}));

jest.mock('axios');

describe('FetchCommand', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should fetch and save HTML content for valid URLs', async () => {
        const mockHtml = '<html><body><h1>Hello, world!</h1></body></html>';
        const mockResponse = {
            status: 200,
            data: mockHtml
        };
        const mockedAxiosGet = axios.get as jest.MockedFunction<typeof axios.get>;
        mockedAxiosGet.mockResolvedValueOnce(mockResponse);

        const links = ['http://example.com'];
        const fetchCommand = new FetchCommand(links, { metadata: true });

        const mockLog = jest.spyOn(console, 'log').mockImplementation();

        await fetchCommand.execute();

        expect(mockedAxiosGet).toHaveBeenCalledWith(links[0]);

        expect(mockLog).toHaveBeenCalled();

        expect(require('fs').writeFileSync).toHaveBeenCalled();

        mockLog.mockRestore();
    });

    it('should handle invalid URLs gracefully', async () => {
        const links = ['invalid-url'];
        const mockLog = jest.spyOn(console, 'error').mockImplementation();
        const fetchCommand = new FetchCommand(links);

        await fetchCommand.execute();

        expect(mockLog).toHaveBeenCalled();

        expect(require('fs').writeFileSync).not.toHaveBeenCalled();

        mockLog.mockRestore();
    });
});
