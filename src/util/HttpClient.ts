import * as http from "http";
import * as fs from "fs";

export class HttpClient {

    private zenhubToken = fs.readFileSync("resources/token.txt").toString();

    public httpGet(args: http.ClientRequestArgs): Promise<http.IncomingMessage> {
        return new Promise<http.IncomingMessage>((resolve) => {
            http.request(args, (response) => {
                resolve(response);
            });
        });
    }

    public post(args: http.ClientRequestArgs): Promise<http.IncomingMessage> {
        return new Promise<http.IncomingMessage>((resolve) => {
            const outgoingHeader: http.OutgoingHttpHeaders = { "X-Authentication-Token" : `${this.zenhubToken}` };
            const httpArgs: http.ClientRequestArgs = {
                
                ...args,
                ...{ method: "POST", headers: [] }
            };
            http.request(httpArgs, (response: http.IncomingMessage) => {
                resolve(response);
            })

        }
    }
}
