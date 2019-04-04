import { WaffleIssueBuilder, WaffleIssue } from "./WaffleIssue";
// tslint:disable
export class WaffleEpicBuilder extends WaffleIssueBuilder {

    public children: string[];

    get Children(): string[] {
        return this.children;
    }

    public setChildren(epicChildren: string[]): WaffleEpicBuilder {
        this.children = epicChildren;
        return this;
    }

    public build(): WaffleEpic {
        return new WaffleEpic(this);
    }

    static from(otherIssue: WaffleIssue): WaffleEpicBuilder {
        const builder: WaffleEpicBuilder = new WaffleEpicBuilder(otherIssue.Repository);
        builder.setUrl(otherIssue.Url).
            setId(otherIssue.Id).setIssueNumber(otherIssue.IssueNumber).setIssueLabels(otherIssue.IssueLabels).
            setIssueBody(otherIssue.IssueBody);
        return builder;
    }
}

export class WaffleEpic extends WaffleIssue {

    public children: string[];

    constructor(builder: WaffleEpicBuilder) {
        super(builder);
        this.children = builder.Children;
    }

    get Children(): string[] {
        return this.children;
    }

    public toString = (): string => {
        return `Waffle Epic: (${this.IssueNumber})`;
    }
}
