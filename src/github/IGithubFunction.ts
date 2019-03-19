import { IPromiseHandler } from "./IPromiseHandler";

export interface IGithubFunction {
    githubFunction: Function; // tslint:disable-line
    githubArgs: string;
    promiseHandler: IPromiseHandler<any>;
}
