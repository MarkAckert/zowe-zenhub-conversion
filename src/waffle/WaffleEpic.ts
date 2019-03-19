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
