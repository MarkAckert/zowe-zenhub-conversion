import * as fs from "fs";
import * as http from "http";
import * as https from "https";
import { isNullOrUndefined } from "util";
import { HttpResponse } from "./HttpResponse";
import * as async from "async";
import { createVerify } from "crypto";
// tslint:disable
export class HttpClient {

    private static zenhubPublicApi = "https://api.zenhub.io";
    private static zenhubToken = fs.readFileSync("resources/zenhub_token.txt").toString();
    private static authHeader: http.OutgoingHttpHeaders = { "X-Authentication-Token": `${HttpClient.zenhubToken}` };

    private apiPostQueue = async.queue(this.apiPostWrapper, 1);
    private apiGetQueue = async.queue(this.apiGetWrapper, 1);

    constructor(){
        this.apiPostQueue.drain = () => {
            console.log("All POST Requests Complete");
        }
        this.apiGetQueue.drain = () => {
            console.log("All GET Requests Complete");
        }
    }

    private apiGetWrapper(args: HttpAsyncArgs, cb: (error: any, val?: any) => void): void {
        const httpArgs: http.ClientRequestArgs = {
            ...{ method: "GET", headers: args.authHeader }
        };
        const req = https.request(`${HttpClient.zenhubPublicApi}${args.url}`, httpArgs, (response) => {
            let respBody: string = "";
            response.on("data", (chunk) => {
                if (!isNullOrUndefined(chunk)) {
                    respBody += chunk.toString();
                }
            });
            response.on("end", () => {
                args.resolve({
                    status: response.statusCode,
                    body: respBody,
                    bodyJSON: HttpClient.tryParseJSON(respBody)
                });
                cb(null, "Done with " + args);

            });
        });

        req.on("error", (error) => {
            args.reject(error);
            cb(error, null);
        });
        req.end();
    }

    private apiPostWrapper(args: HttpAsyncArgs, cb: (error: any, val?: any) => void): void {
        if (isNullOrUndefined(HttpClient.tryParseJSON(args.body))) {
            throw new Error("Incorrectly formatted JSON body string provided.");
        }
        const postHeaders: http.OutgoingHttpHeaders = {
            ...args.authHeader,
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(args.body)
        };
        const httpArgs: http.ClientRequestArgs = {
            method: "POST", headers: postHeaders,
        };
        const req = https.request(`${HttpClient.zenhubPublicApi}${args.url}`, httpArgs, (response) => {
            let respBody: string = "";
            response.on("data", (chunk) => {
                if (!isNullOrUndefined(chunk)) {
                    respBody += chunk.toString();
                }
            });
            response.on("end", () => {
                args.resolve({
                    status: response.statusCode,
                    body: respBody,
                    bodyJSON: HttpClient.tryParseJSON(respBody)
                });
                cb(null, "Done with " + args);
            });
        });
        req.on("error", (error) => {
            args.reject(error);
            cb(error, null);
        });
        req.write(args.body);
        req.end();
    }

    public get(url: string): Promise<HttpResponse> {
        return new Promise<HttpResponse>((resolve, reject) => {
            this.apiGetQueue.push({
                url: url,
                resolve: resolve,
                reject: reject,
                authHeader: HttpClient.authHeader
            }, (error, result) => {
                console.log(error);
            });
        });
    }

    public post(url: string, body: string): Promise<HttpResponse> {
        return new Promise<HttpResponse>((resolve, reject) => {
            this.apiPostQueue.push({
                url: url,
                body: body,
                resolve: resolve,
                reject: reject,
                authHeader: HttpClient.authHeader
            }, (error, result) => {
                console.log(error);
            });
        });
    }

    // From Stackoverflow
    private static tryParseJSON(jsonString: string) {
        try {
            const o = JSON.parse(jsonString);

            // Handle non-exception-throwing cases:
            // Neither JSON.parse(false) or JSON.parse(1234) throw errors, hence the type-checking,
            // but... JSON.parse(null) returns null, and typeof null === "object",
            // so we must check for that, too. Thankfully, null is falsey, so this suffices:
            if (o && typeof o === "object") {
                return o;
            }
        }
        catch (e) { // prevent bubble up
        }
        return null;
    }
}

type HttpAsyncArgs = {
    url: string,
    body?: string,
    resolve: Function,
    reject: Function,
    authHeader: http.OutgoingHttpHeaders
}
