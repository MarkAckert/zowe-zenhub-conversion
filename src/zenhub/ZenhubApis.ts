import { GithubApis } from "../github/GithubApis";
import { HttpClient } from "../util/HttpClient";
import { HttpResponse } from "../util/HttpResponse";
import { WaffleEpic } from "../waffle/WaffleEpic";
import { WaffleIssue } from "../waffle/WaffleIssue";
import { WaffleColumns } from "../waffle/WaffleColumns";
import { isNullOrUndefined } from "util";

// tslint:disable
export class ZenhubApis {

    private api: HttpClient;

    public PIPELINE_NAMES: { [title: string]: string } = {
        "Icebox": undefined,
        "In Progress": undefined,
        "Backlog": undefined,
        "Ready": undefined,
        "New Issues": undefined,
        "Review/QA": undefined,
        "Done": undefined
    };
    private isReady: Promise<any>;

    constructor(repository: string) {
        this.api = new HttpClient();
        this.isReady = this.populateBoardColumns(repository);
    }

    public convertToEpic(epic: WaffleEpic): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this.isReady.then(() => {
                const reqBody: any = {
                    issues: []
                };
                let repoIdPromises: Promise<any>[] = [];
                let epicRepoId: number;
                let epicRepoIdPromise = GithubApis.getZoweRepositoryId(epic.Repository);
                repoIdPromises.push(epicRepoIdPromise);
                epicRepoIdPromise.then((epicId) => {
                    epicRepoId = epicId;
                });
                epic.Children.forEach((child) => {
                    const repoName = child.split("#")[0];
                    const issueNumber = child.split("#")[1];
                    const repoPromise = GithubApis.getZoweRepositoryId(repoName);
                    repoIdPromises.push(repoPromise);
                    repoPromise.then((repoId) => {
                        reqBody.issues.push({ "repo_id": repoId, "issue_number": issueNumber });
                    }).catch((error: any) => {
                        throw new Error(error);
                    });
                });
                Promise.all(repoIdPromises).then((result) => {
                    this.api.post(`/p1/repositories/${epicRepoId}/issues/${epic.IssueNumber}/convert_to_epic`, JSON.stringify(reqBody)).then((result: HttpResponse) => {
                        if (result.status === 200) {
                            resolve(true);
                        }
                        else {
                            console.log("Failed Result:" + JSON.stringify(result));
                            resolve(false);
                        }

                    }).catch((error) => {
                        console.log(error);
                        reject(false);
                    });
                });
            });
        });
    }

    public moveIssuePipeline(issue: WaffleIssue): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this.isReady.then(() => {
                GithubApis.getZoweRepositoryId(issue.Repository).then((repoId) => {
                    let targetPipeline: string = null;
                    //TODO: Convert Zenhub Pipeline to enum
                    switch (issue.WaffleColumn) {
                        case WaffleColumns.BACKLOG: {
                            targetPipeline = "Backlog";
                            break;
                        }
                        case WaffleColumns.IN_PROGRESS: {
                            targetPipeline = "In Progress";
                            break;
                        }
                        case WaffleColumns.READY: {
                            // do nothing
                            break;
                        }
                        case WaffleColumns.REVIEW: {
                            targetPipeline = "Review/QA"
                            break;
                        }
                        case WaffleColumns.CURRENT_PI_EPICS: {
                            // do nothing, create pipeline api does not exist
                            break;
                        }
                        case WaffleColumns.FUTURE_PI_EPICS: {
                            // do nothing, create pipeline api does not exist
                            break;
                        }
                        default: {
                            break;
                        }
                    }
                    // console.log(`Current issue: ${issue.IssueNumber}; target pipeline: ${targetPipeline}`);
                    if (!isNullOrUndefined(targetPipeline)) {
                        const postBody: any = {
                            "pipeline_id": this.PIPELINE_NAMES[targetPipeline],
                            "position": "top"
                        };

                        this.api.post(`/p1/repositories/${repoId}/issues/${issue.IssueNumber}/moves`, JSON.stringify(postBody)).then((result) => {
                          //  console.log(`/p1/repositories/${repoId}/issues/${issue.IssueNumber}/moves`);
                          //  console.log(JSON.stringify(postBody));
                          //  console.log(result.status);
                           // console.log(result.body);
                            resolve(true);
                        });
                    }
                    else {
                        resolve(false);
                    }
                });
            });
        });
    }

    public populateBoardColumns(repository: string) {
        return new Promise<boolean>((resolve) => {
            GithubApis.getZoweRepositoryId(repository).then((repoId) => {
                this.api.get(`/p1/repositories/${repoId}/board`).then((result) => {
                    if (result.status === 200) {
                        const pipelineDefs: any = result.bodyJSON["pipelines"];
                        for (let column of pipelineDefs) {
                            this.PIPELINE_NAMES[column["name"]] = column["id"];
                        }
                        resolve(true);
                    }
                    else {
                        throw new Error("Cannot get board state for repository " + repoId);
                    }
                });
            }).catch((error) => {
                console.log(error);
                throw new Error("cannot get board state for repository " + repository);
            });
        });
    }
}