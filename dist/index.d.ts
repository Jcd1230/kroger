import { Browser, Page } from 'puppeteer';
import IReceipt, { IReceiptItem } from './models/IReceipt';
import ISearch from './models/ISearch';
import ISearchDetails, { ISearchDetailsProduct } from './models/ISearchDetails';
export default class Kroger {
    endpoint: string;
    browser: Browser;
    page: Page;
    constructor(endpoint?: string);
    setUp(): Promise<void>;
    detectionBypass(): Promise<void>;
    cleanUp(): Promise<void>;
    visit(url: string): Promise<void>;
    get(url: string): Promise<string>;
    getJson(url: string): Promise<string>;
    pageJson(): Promise<string>;
    requestMainPage(): Promise<boolean>;
    delay(milliseconds: number, randomModifier?: number): Promise<void>;
    httpRequest(type: string, url: string, data?: any, additionalHeaders?: {
        [headerName: string]: string;
    }): Promise<any>;
    httpPost(url: string, data: any, additionalHeaders?: {
        [headerName: string]: string;
    }): Promise<any>;
    httpPostWithUrlData(url: string, data: any): Promise<any>;
    httpGet(url: string): Promise<any>;
    authenticate(email: string, password: string, rememberMe?: boolean): Promise<boolean>;
    imageUrlForItem(item: IReceiptItem): string;
    receiptList(): Promise<IReceipt[]>;
    receiptData(receipt: IReceipt): Promise<IReceipt>;
    searchRaw(query: string, startIndex?: number, count?: number): Promise<ISearch>;
    search(query: string, storeId: string, divisionId: string, startIndex?: number, count?: number): Promise<ISearchDetailsProduct[]>;
    productDetails(upcs: string[], storeId: string, divisionId: string): Promise<ISearchDetails>;
}
