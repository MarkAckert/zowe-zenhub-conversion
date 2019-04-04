import * as Octokit from "@octokit/rest";
import { WaffleColumns } from "./WaffleColumns";
// tslint:disable
export class WaffleIssueBuilder {

    private repository: string;
    private url: string;
    private id: number;
    private issueNumber: number;
    private labels: Octokit.IssuesListResponseItemLabelsItem[];
    private issueBody: string;
    private waffleColumn: string;
    private parentIssues: string[];

    constructor(issueRepository: string) {
        this.repository = issueRepository;
        return this;
    }

    get Repository(): string {
        return this.repository;
    }

    get Url(): string {
        return this.url;
    }

    setUrl(issueUrl: string): WaffleIssueBuilder {
        this.url = issueUrl;
        return this;
    }

    get Id(): number {
        return this.id;
    }

    setId(issueId: number) {
        this.id = issueId;
        return this;
    }

    get IssueNumber(): number {
        return this.issueNumber;
    }

    setIssueNumber(issueNum: number) {
        this.issueNumber = issueNum;
        return this;
    }

    get IssueLabels(): any[] {
        return this.labels;
    }

    setIssueLabels(issueLabels: Octokit.IssuesListResponseItemLabelsItem[]) {
        this.labels = issueLabels;
        for (let aLabel of issueLabels) {
            this.waffleColumn = Object.values(WaffleColumns).includes(aLabel.name.trim().toLowerCase()) ? aLabel.name.trim() : null;
        }
        return this;
    }

    get IssueBody(): string {
        return this.issueBody;
    }

    setIssueBody(issueBody: string) {
        this.issueBody = issueBody;
        return this;
    }

    get ParentIssues(): string[] {
        return this.parentIssues;
    }

    setParentIssues(parentIssues: string[]) {
        this.parentIssues = parentIssues;
        return this;
    }

    get WaffleColumn(): string {
        return this.waffleColumn;
    }

    build(): WaffleIssue {
        return new WaffleIssue(this);
    }
}

export class WaffleIssue {

    private state: string = "open";
    private repository: string;
    private url: string;
    private id: number;
    private issueNumber: number;
    private labels: Octokit.IssuesListResponseItemLabelsItem[];
    private waffleColumn: string;
    private commentsUrl: string;
    private issueBody: string;
    private parentIssues: string[];

    constructor(builder: WaffleIssueBuilder) {
        this.repository = builder.Repository;
        this.url = builder.Url;
        this.id = builder.Id;
        this.issueNumber = builder.IssueNumber;
        this.labels = builder.IssueLabels;
        this.issueBody = builder.IssueBody;
        this.waffleColumn = builder.WaffleColumn;
        this.parentIssues = builder.ParentIssues;
    }

    get Repository(): string {
        return this.repository;
    }

    get Url(): string {
        return this.url;
    }

    get Id(): number {
        return this.id;
    }

    get IssueNumber(): number {
        return this.issueNumber;
    }

    get IssueLabels(): any[] {
        return this.labels;
    }

    get IssueBody(): string {
        return this.issueBody;
    }

    get WaffleColumn(): string {
        return this.waffleColumn;
    }

    get ParentIssues(): string[] {
        return this.parentIssues;
    }

    public toString = (): string => {
        return `Waffle Issue: (${this.IssueNumber})`;
    }

}
