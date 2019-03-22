import * as Octokit from "@octokit/rest";
import * as async from "async";
import { isNullOrUndefined } from "util";
import { WaffleEpicBuilder } from "../waffle/WaffleEpic";
import { WaffleIssue, WaffleIssueBuilder } from "../waffle/WaffleIssue";
import { GithubRepository } from "./GithubRepository";
import { IGithubFunction } from "./IGithubFunction";
import { IPromiseHandler } from "./IPromiseHandler";
import * as fs from "fs";

export class GithubApis {

    public static getZoweRepositories(): Promise<GithubRepository[]> {
        return new Promise<GithubRepository[]>((resolve, reject) => {
            GithubApis.apiClient.paginate(`/orgs/zowe/repos`).then((response: Octokit.ReposListForOrgResponse) => {
                if (response.length > 0) {
                    const repoList: GithubRepository[] = [];
                    for (const repoData of response) {
                        // tslint:disable-next-line
                        GithubApis.REPO_ID_CACHE[repoData.full_name] = repoData.id;
                        repoList.push({ org: "zowe", name: repoData.name, id: repoData.id });
                    }
                    resolve(repoList);
                }
                else {
                    reject(`Github returned an invalid length: ${response.length}. Response body: ${response}`);
                }
            }).catch((rejected: any) => {
                throw new Error(rejected);
            });
        });
    }

    public static getZoweRepositoryId(repository: string): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            let repoFullName: string;
            if (!repository.includes("zowe/")) {
                repoFullName = "zowe/" + repository;
            }
            else {
                repoFullName = repository;
            }

            if (GithubApis.REPO_ID_CACHE[repoFullName]) {
                resolve(GithubApis.REPO_ID_CACHE[repoFullName]);
            }
            console.log(repoFullName);
            const gitApiHandler: IPromiseHandler<number> = {
                then(rawResponse: Octokit.ReposGetResponse[]) {
                    GithubApis.REPO_ID_CACHE[repoFullName] = rawResponse[0].id;
                    resolve(rawResponse[0].id);
                },
                catch(error: any) {
                    reject(error);
                }
            };
            const gitFunction: IGithubFunction = {
                githubFunction: GithubApis.apiClient.paginate,
                githubArgs: `/repos/${repoFullName}`,
                promiseHandler: gitApiHandler
            };
            GithubApis.apiQueue.push(gitFunction);
        });
    }

    // Default API invocation only picks up "open" issues, which is as desired.
    public static getIssuesInZoweRepository(repository: string): Promise<WaffleIssue[]> {
        return new Promise<WaffleIssue[]>((resolve, reject) => {
            const gitApiHandler: IPromiseHandler<WaffleIssue[]> = {
                then(rawIssues) {
                    GithubApis.loadIssues(rawIssues).then((waffleIssues: WaffleIssue[]) => { resolve(waffleIssues); });
                },
                catch(error) { reject(error); }
            };
            const gitFunction: IGithubFunction = {
                githubFunction: GithubApis.apiClient.paginate,
                githubArgs: `/repos/zowe/${repository}/issues`,
                promiseHandler: gitApiHandler
            };
            GithubApis.apiQueue.push(gitFunction);
        });
    }

    private static REPO_ID_CACHE: { [name: string]: number } = {};
    private static API_TOKEN = fs.readFileSync("resources/github_token.txt").toString();
    private static API_CONCURRENCY = 5;
    private static apiQueue = async.queue(GithubApis.apiWrapper, GithubApis.API_CONCURRENCY);
    private static apiClient: Octokit = new Octokit({
        auth: `token ${GithubApis.API_TOKEN}`
    });

    private static apiWrapper(fn: IGithubFunction, cb: (error: any, val?: any) => void): void {
        fn.githubFunction(fn.githubArgs).then((result: any) => {
            fn.promiseHandler.then(result);
            cb(undefined);
        }).catch((error: any) => {
            fn.promiseHandler.catch(error);
            cb(error);
        });
    }

    private static convertIssue(issue: Octokit.IssuesListResponseItem, cb: (error: string | Error, result?: WaffleIssue) => void): void {
        const gitApiHandler: IPromiseHandler<any> = {
            then(rawComments: Octokit.IssuesListCommentsResponse) {
                const childIssues: string[] = [];
                const parentRegex = new RegExp("(?:parent of )(?:([zowe].*?#[0-9]+)|(#[0-9]+))", "gi");
                let match: RegExpMatchArray = parentRegex.exec(issue.body);
                while (!isNullOrUndefined(match)) {
                    if (!isNullOrUndefined(match[1])) {
                        // format: zowe/repo#issue . No conversion.
                        childIssues.push(match[1]);
                    }
                    else if (!isNullOrUndefined(match[2])) {
                        // format: #issue_num. Covert: zowe/current_repo#issue_num
                        childIssues.push("zowe/" + issue.repository_url.split("repos/zowe/")[1] + match[2]);
                    }
                    match = parentRegex.exec(issue.body);
                }
                for (const comment of rawComments) {
                    parentRegex.lastIndex = 0;
                    match = parentRegex.exec(comment.body);
                    while (!isNullOrUndefined(match)) {
                        if (!isNullOrUndefined(match[1])) {
                            // format: zowe/repo#issue . No conversion.
                            childIssues.push(match[1]);
                        }
                        else if (!isNullOrUndefined(match[2])) {
                            // format: #issue_num. Covert: zowe/current_repo#issue_num
                            childIssues.push("zowe/" + issue.repository_url.split("repos/zowe/")[1] + match[2]);
                        }
                        match = parentRegex.exec(comment.body);
                    }
                }
                if (childIssues.length > 0) {
                    cb(null, new WaffleEpicBuilder(issue.repository_url.split("repos/zowe/")[1]).setChildren(childIssues).
                        setId(issue.id).setIssueBody(issue.body).setIssueLabels(issue.labels).setIssueNumber(issue.number)
                        .setUrl(issue.url).build());
                }
                else {
                    cb(null, new WaffleIssueBuilder(issue.repository_url.split("repos/zowe/")[1]).
                        setId(issue.id).setIssueBody(issue.body).setIssueLabels(issue.labels).setIssueNumber(issue.number)
                        .setUrl(issue.url).build());
                }
            },
            catch(error) { cb(error); }
        };
        const gitFunction: IGithubFunction = {
            githubFunction: GithubApis.apiClient.paginate,
            githubArgs: issue.comments_url,
            promiseHandler: gitApiHandler
        };
        GithubApis.apiQueue.push(gitFunction);
    }

    private static loadIssues(rawIssues: Octokit.IssuesListResponse): Promise<WaffleIssue[]> {
        return new Promise<WaffleIssue[]>((resolve, reject) => {
            async.map(rawIssues, GithubApis.convertIssue, (error, results) => {
                if (!isNullOrUndefined(error)) {
                    reject(error);
                }
                resolve(results);
            });
        });
    }
}
