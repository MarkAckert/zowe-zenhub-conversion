import * as https from "https";
import * as http from "http";
import * as fs from "fs";
import { HttpResponse } from "./HttpResponse";
import { isNullOrUndefined } from "util";

export class HttpClient {

    private zenhubPublicApi = "https://api.zenhub.io";
    private zenhubToken = fs.readFileSync("resources/zenhub_token.txt").toString();
    private authHeader: http.OutgoingHttpHeaders = { "X-Authentication-Token": `${this.zenhubToken}` };

    public get(url: string): Promise<HttpResponse> {
        return new Promise<HttpResponse>((resolve, reject) => {
            const httpArgs: http.ClientRequestArgs = {
                ...{ method: "GET", headers: this.authHeader }
            };
            const req = https.request(`${this.zenhubPublicApi}${url}`, httpArgs, (response) => {
                let respBody: string = "";
                response.on("data", (chunk) => {
                    if (!isNullOrUndefined(chunk)) {
                        respBody += chunk.toString();
                    }
                });
                response.on("end", () => {
                    resolve({
                        status: response.statusCode,
                        body: respBody,
                        bodyJSON: this.tryParseJSON(respBody)
                    });
                });
            });

            req.on("error", (error) => {
                reject(error);
            });
            req.end();
        });
    }

    public post(args: http.ClientRequestArgs): Promise<http.IncomingMessage> {
        return new Promise<http.IncomingMessage>((resolve, reject) => {
            const httpArgs: http.ClientRequestArgs = {
                ...args,
                ...{ method: "POST", headers: this.authHeader }
            };
            https.request(httpArgs, (response: http.IncomingMessage) => {

                resolve(response);
            });

        });
    }

    private tryParseJSON(jsonString: string) {
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
