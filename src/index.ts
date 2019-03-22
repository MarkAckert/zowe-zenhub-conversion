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
*/
/*
const PARALLEL_CONVERSION_LIMIT: number = 3;
GithubApis.getZoweRepositories().then((repoList: GithubRepository[]) => {
    repoList.forEach((repo) => {
        console.log(repo.name);
        if (repo.name === "zowe-install-test") {
            GithubApis.getIssuesInZoweRepository(repo.name).then((issues: WaffleIssue[]) => {
                const convertRepo: ConversionDriver = new ConversionDriver(repo);
                convertRepo.convertWaffleIssues(issues).then((result) => {

                });
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
/*
const apis = new ZenhubApis();
apis.populateBoardColumns("zowe/zlc").then((result) => {
    console.log(apis.PIPELINE_NAMES);
});*/
GithubApis.getIssuesInZoweRepository("zowe-install-packaging").then((issues: WaffleIssue[]) => {
    const convertRepo: ConversionDriver = new ConversionDriver({ id: undefined, name: "zowe-install-packaging", org: "zowe" });
    convertRepo.convertWaffleIssues(issues).then((result) => {
        console.log("Issues done conversion");
    });
}).catch((error: any) => {
    console.log(error);
    throw new Error(error);
})