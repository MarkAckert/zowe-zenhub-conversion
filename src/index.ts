import { GithubApis } from "./github/GithubApis";
import { isNullOrUndefined } from "util";
import { GithubRepository } from "./github/GithubRepository";
import { WaffleIssue } from "./waffle/WaffleIssue";
import { ConversionDriver } from "./zenhub/ConversionDriver";
import * as async from "async";
import { ZenhubApis } from "./zenhub/ZenhubApis";

// tslint:disable
const PARALLEL_CONVERSION_LIMIT: number = 2;
GithubApis.getZoweRepositories().then((repoList: GithubRepository[]) => {
    async.eachLimit(repoList, PARALLEL_CONVERSION_LIMIT, (repo, callback) => {
        console.log(`Converting ${repo.name}`);
        if (repo.name === "zowe-cli") {
            GithubApis.getIssuesInZoweRepository(repo.name).then((issues: WaffleIssue[]) => {
                const convertRepo: ConversionDriver = new ConversionDriver(repo);
                convertRepo.convertWaffleIssues(issues).then((result) => {
                    console.log("Issues done conversion");
                });
                console.log(`Pausing at the end of conversion for ${repo.name}...`)
                sleep(30000).then(() => {
                    console.log("Pause complete for " + repo.name);
                    callback();
                });
            }).catch((error: any) => {
                console.log(error);
                console.log(`Error at the end of conversion for ${repo.name}...`)
                sleep(30000).then(() => {
                    console.log("Error complete for " + repo.name);
                    callback();
                });
                throw new Error(error);
            });
        }
        else {
            callback();
        }
    }, (error) => {
        if (!isNullOrUndefined(error)) {
            console.log(error);
            throw new Error("Issue during conversion.");
        }
    })
});

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
});
GithubApis.getIssuesInZoweRepository("zowe-install-packaging").then((issues: WaffleIssue[]) => {
    const convertRepo: ConversionDriver = new ConversionDriver({ id: undefined, name: "zowe-install-packaging", org: "zowe" });
    convertRepo.convertWaffleIssues(issues).then((result) => {
        console.log("Issues done conversion");
    });
}).catch((error: any) => {
    console.log(error);
    throw new Error(error);
})
*/

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
