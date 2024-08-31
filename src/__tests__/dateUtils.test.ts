import { isValidISODateTime } from "../utils/dateUtils";

describe('API tests', () => {

    it('Should test all dates', async () => {
        expect(isValidISODateTime("2024-08-29T18:24:35.521Z")).toBe(true)
        expect(isValidISODateTime(new Date().toISOString())).toBe(true)
    });
});