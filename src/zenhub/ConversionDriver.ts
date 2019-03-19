import { WaffleEpic } from "../waffle/WaffleEpic";
import { WaffleIssue } from "../waffle/WaffleIssue";
import { ZenhubApis } from "./ZenhubApis";
import { GithubRepository } from "../github/GithubRepository";

// tslint:disable
export class ConversionDriver {

    private repoName: string;
    private repoId: number;
    private apis: ZenhubApis;

    constructor(repository: GithubRepository) {
        this.repoName = repository.name;
        this.repoId = repository.id;
        this.apis = new ZenhubApis();
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
            this.convertToEpic(issue as WaffleEpic);
        }
        else {
            this.moveIssuePipeline(issue);
        }
    }

    private convertToEpic(issue: WaffleEpic) {
        // do conversion then
        
        this.moveIssuePipeline(issue);
    }

    private moveIssuePipeline(issue: WaffleIssue) {

    }

}
