
class ExpansionRule {
    expansions: string[] = [];

    constructor (expansion: string) {
        this.expansions = this.expansions.concat(expansion);
    }

    addExpansion (expansion: string) {
        this.expansions = this.expansions.concat(expansion);
    }

    getExpansion (): string {
        let rule: number = Math.floor(Math.random() * this.expansions.length);


        return this.expansions[rule];
    }
}

export default ExpansionRule;