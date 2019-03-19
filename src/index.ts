import { GithubApis } from "./github/GithubApis";
import { isNullOrUndefined } from "util";
import { GithubRepository } from "./github/GithubRepository";
import { WaffleIssue } from "./waffle/WaffleIssue";
import { ConversionDriver } from "./zenhub/ConversionDriver";
import * as async from "async";
import { ZenhubApis } from "./zenhub/ZenhubApis";

// tslint:disable
/*
let zoweRepos: string[];
*//*
const PARALLEL_CONVERSION_LIMIT: number = 3;
GithubApis.getZoweRepositories().then((repoList: GithubRepository[]) => {
    async.forEachLimit(repoList, PARALLEL_CONVERSION_LIMIT, (repo) => {
        if (repo.name === "zowe-install-packaging") {
            GithubApis.getIssuesInZoweRepository(repo.name).then((issues: WaffleIssue[]) => {
                const convertRepo: ConversionDriver = new ConversionDriver(repo);
                convertRepo.convertWaffleIssues(issues);
            }).catch((error: any) => {
                console.log(error);
                throw new Error(error);
            })
        }
        /*GithubApis.getIssuesInZoweRepository(repo.name).then((issues: WaffleIssue[]) => {
            const convertRepo: ConversionDriver = new ConversionDriver(repo);
            convertRepo.convertWaffleIssues(issues);
        }).catch((error: any) => {
            console.log(error);
            throw new Error(error);
        });
    });
}).catch((error: any) => {
    throw new Error(error);
});
*/

const apis = new ZenhubApis();
apis.getBoardColumns(144592776);
/*
GithubApis.getIssuesInZoweRepository("api-layer").then((result) => {
    console.log(result);
}).catch((error) => {
    console.log("ERROR: " + error);
});
*/
