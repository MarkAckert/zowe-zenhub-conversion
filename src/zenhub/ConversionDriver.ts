import { WaffleEpic } from "../waffle/WaffleEpic";
import { WaffleIssue } from "../waffle/WaffleIssue";
import { ZenhubApis } from "./ZenhubApis";
import { GithubRepository } from "../github/GithubRepository";

// tslint:disable
export class ConversionDriver {

    private repoOrg: string;
    private repoName: string;
    private repoId: number;
    private apis: ZenhubApis;

    constructor(repository: GithubRepository) {
        this.repoName = repository.name;
        this.repoId = repository.id;
        this.repoOrg = repository.org;
        this.apis = new ZenhubApis(this.repoName);
    }

    /**
     * issues: convertWaffleIssues
     */
    public convertWaffleIssues(issues: WaffleIssue[]): Promise<string> {

        return new Promise<string>((resolve, reject) => {
            issues.forEach((issue: WaffleIssue) => {
                this.convert(issue);
            });
        });
    }

    private convert(issue: WaffleIssue) {
        if (issue instanceof WaffleEpic) {
            this.apis.convertToEpic(issue as WaffleEpic).then((result) => {
                console.log(issue.IssueNumber + ":" + result);
                this.moveIssuePipeline(issue);
            });
        }
        else {
            this.moveIssuePipeline(issue);
        }
    }

    private moveIssuePipeline(issue: WaffleIssue) {
        this.apis.moveIssuePipeline(issue).then((result) => {
            console.log(`Moved Issue #${issue.IssueNumber}? : ${result}`);
        });
    }

}
