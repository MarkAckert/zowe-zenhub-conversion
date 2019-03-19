import { url } from "inspector";
// tslint:disable
export class WaffleIssueBuilder {

    private repository: string;
    private url: string;
    private id: number;
    private issueNumber: number;
    private labels: any[];
    private issueBody: string;

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

    setIssueLabels(issueLabels: any[]) {
        this.labels = issueLabels;
        return this;
    }

    get IssueBody(): string {
        return this.issueBody;
    }

    setIssueBody(issueBody: string) {
        this.issueBody = issueBody;
        return this;
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
    private labels: any[];
    private commentsUrl: string;
    private issueBody: string;

    constructor(builder: WaffleIssueBuilder) {
        this.repository = builder.Repository;
        this.url = builder.Url;
        this.id = builder.Id;
        this.issueNumber = builder.IssueNumber;
        this.labels = builder.IssueLabels;
        this.issueBody = builder.IssueBody;
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

    public toString = (): string => {
        return `Waffle Issue: (${this.IssueNumber})`;
    }

}
