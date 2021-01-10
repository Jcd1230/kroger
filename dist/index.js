'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer_1 = require("puppeteer");
const useragents_1 = require("./useragents");
const querystring = require("querystring");
class Kroger {
    constructor(endpoint) {
        this.endpoint = "https://www.kroger.com/";
        this.endpoint = endpoint;
    }
    setUp() {
        return __awaiter(this, void 0, void 0, function* () {
            this.browser = yield puppeteer_1.launch({ headless: false, args: ["--disable-web-security"] });
            this.page = yield this.browser.newPage();
            yield this.detectionBypass();
        });
    }
    detectionBypass() {
        return __awaiter(this, void 0, void 0, function* () {
            var userAgent = useragents_1.default();
            this.page.setUserAgent(userAgent);
            console.log("Using user agent: " + userAgent);
            var width = 1024 + Math.floor(Math.random() * 100);
            var height = 768 + Math.floor(Math.random() * 100);
            yield this.page.setViewport({
                width: width,
                height: height
            });
            console.log(`Using viewport ${width}x${height}`);
            yield this.page.evaluateOnNewDocument(() => {
                Object.defineProperty(navigator, 'webdriver', {
                    get: () => false,
                });
            });
            yield this.page.setRequestInterception(true);
            // Disabling "bd-1-30" breaks login
            var disallowedUrlTest = RegExp(`adobe|mbox|ruxitagentjs|akam|sstats.kroger.com|
				rb_[A-Za-z0-9]{8}-[A-Za-z0-9]{4}-[A-Za-z0-9]{4}-[A-Za-z0-9]{4}-[A-Za-z0-9]{12}`);
            this.page.on('request', (request) => {
                const url = request.url();
                // Check request if it is for the file
                // that we want to block, and if it is, abort it
                // otherwise just let it run
                if (disallowedUrlTest.test(url)) {
                    request.abort();
                }
                else {
                    request.continue();
                }
            });
        });
    }
    cleanUp() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.browser.close();
        });
    }
    visit(url) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`Visiting ${url}`);
            yield this.page.goto(url);
        });
    }
    get(url) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.visit(url);
            return yield this.page.content();
        });
    }
    getJson(url) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.visit(url);
            return yield this.pageJson();
        });
    }
    pageJson() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.page.evaluate(() => {
                return document.body.innerText;
            });
        });
    }
    requestMainPage() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.get(this.endpoint);
            return false;
        });
    }
    delay(milliseconds, randomModifier = 1000) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.page.waitFor(milliseconds + Math.random() * randomModifier);
        });
    }
    httpRequest(type, url, data, additionalHeaders = null) {
        return __awaiter(this, void 0, void 0, function* () {
            var expression = function (type, url, data, additionalHeaders) {
                return new Promise((resolve, reject) => {
                    var dataStr = JSON.stringify(data);
                    var xhr = new XMLHttpRequest();
                    xhr.open(type, url);
                    if (dataStr !== "") {
                        xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
                        if (additionalHeaders !== null) {
                            for (var headerName in additionalHeaders) {
                                var value = additionalHeaders[headerName];
                                xhr.setRequestHeader(headerName, value);
                            }
                        }
                    }
                    xhr.onload = function () {
                        if (this.status >= 200 && this.status < 300) {
                            resolve(xhr.response);
                        }
                        else {
                            reject({
                                status: this.status,
                                statusText: xhr.statusText
                            });
                        }
                    };
                    xhr.onerror = function (ev) {
                        reject({
                            status: this.status,
                            statusText: xhr.statusText
                        });
                    };
                    if (dataStr !== "") {
                        xhr.send(dataStr);
                    }
                    else {
                        xhr.send();
                    }
                });
            };
            return yield this.page.evaluate(expression, type, url, data, additionalHeaders);
        });
    }
    httpPost(url, data, additionalHeaders) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("POST: " + url);
            return yield this.httpRequest("POST", url, data, additionalHeaders);
        });
    }
    httpPostWithUrlData(url, data) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("POST: " + url + querystring.stringify(data));
            return yield this.httpRequest("POST", url + querystring.stringify(data));
        });
    }
    httpGet(url) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("GET: " + url);
            return yield this.httpRequest("GET", url);
        });
    }
    authenticate(email, password, rememberMe = true) {
        return __awaiter(this, void 0, void 0, function* () {
            var data = {
                "email": email,
                "password": password,
                "rememberMe": rememberMe
            };
            yield this.page.goto(this.endpoint + "signin?redirectUrl=/", {
                waitUntil: 'networkidle0'
            });
            yield this.page.waitFor(500 + Math.random() * 100);
            yield this.page.type("#SignIn-emailInput", email);
            yield this.page.waitFor(500 + Math.random() * 100);
            yield this.page.type("#SignIn-passwordInput", password);
            if (!rememberMe) {
                yield this.page.waitFor(300 + Math.random() * 100);
                yield this.page.click("#SignIn-rememberMe");
            }
            yield this.page.waitFor(500 + Math.random() * 100);
            yield this.page.click("#SignIn-submitButton");
            yield this.page.waitForNavigation();
            if (this.page.url() === this.endpoint) {
                return true;
            }
            return false;
        });
    }
    imageUrlForItem(item) {
        return `https://www.kroger.com/product/images/medium/front/${item.baseUpc}`;
    }
    receiptList() {
        return __awaiter(this, void 0, void 0, function* () {
            var resultString = yield this.httpGet(this.endpoint + "mypurchases/api/v1/receipt/summary/by-user-id");
            var resultJson;
            try {
                resultJson = JSON.parse(resultString);
            }
            catch (error) {
                return [];
            }
            if (resultJson === null || resultJson["error"] !== undefined) {
                return [];
            }
            return resultJson;
        });
    }
    receiptData(receipt) {
        return __awaiter(this, void 0, void 0, function* () {
            var data = {
                divisionNumber: receipt.receiptId.divisionNumber,
                storeNumber: receipt.receiptId.storeNumber,
                terminalNumber: receipt.receiptId.terminalNumber,
                transactionDate: receipt.receiptId.transactionDate,
                transactionId: receipt.receiptId.transactionId,
                shoppingContextDivision: receipt.receiptId.divisionNumber,
                shoppingContextStore: receipt.receiptId.storeNumber
            };
            var resultString = yield this.httpPost(this.endpoint + "mypurchases/api/v1/receipt/detail", data);
            var resultJson;
            try {
                resultJson = JSON.parse(resultString);
            }
            catch (error) {
                return null;
            }
            if (resultJson === null || resultJson["error"] !== undefined) {
                return null;
            }
            return resultJson;
        });
    }
    searchRaw(query, startIndex = 0, count = 24) {
        return __awaiter(this, void 0, void 0, function* () {
            var data = {
                start: startIndex,
                count: count,
                query: query,
                tab: 0,
                monet: true
            };
            var resultString = yield this.httpPostWithUrlData(this.endpoint + "search/api/searchAll?", data);
            var resultJson;
            try {
                resultJson = JSON.parse(resultString);
            }
            catch (error) {
                return null;
            }
            if (resultJson === null || resultJson["error"] !== undefined) {
                return null;
            }
            return resultJson;
        });
    }
    search(query, storeId, divisionId, startIndex = 0, count = 24) {
        return __awaiter(this, void 0, void 0, function* () {
            var searchResults = yield this.searchRaw(query, startIndex, count);
            console.log("Retrieved search results");
            var upcs = searchResults.upcs;
            var products = (yield this.productDetails(upcs, storeId, divisionId)).products;
            console.log("Retrived item details");
            return products;
        });
    }
    productDetails(upcs, storeId, divisionId) {
        return __awaiter(this, void 0, void 0, function* () {
            var data = {
                upcs: upcs,
                filterBadProducts: true
            };
            var headers = {
                "store-id": storeId,
                "division-id": divisionId
            };
            var resultString = yield this.httpPost(this.endpoint + "products/api/products/details", data, headers);
            var resultJson;
            try {
                resultJson = JSON.parse(resultString);
            }
            catch (error) {
                return null;
            }
            if (resultJson === null || resultJson["error"] !== undefined) {
                return null;
            }
            return resultJson;
        });
    }
}
exports.default = Kroger;
//# sourceMappingURL=index.js.map