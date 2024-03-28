import { jsS } from '@pnp/common';
import { GraphQueryableInstance, GraphQueryableCollection, GraphQueryable, graph } from '@pnp/graph';

export class NotebookResult {
    public readonly id: string;
    public readonly displayName: string;
}

export class SectionLinksResult {
    public readonly oneNoteClientUrl: { href: string };
    public readonly oneNoteWebUrl: { href: string };
}

export class SectionResult {
    public readonly id: string;
    public readonly displayName: string;
    public readonly links: SectionLinksResult;
}

export class PageResult {
    public readonly id: string;
    public readonly displayName: string;
}


export interface IAddPageResult {
    data: any;
    page: Page;
}

export interface IAddSectionResult {
    data: any;
}

export class GraphApiUtil {
    public static sanitizeGraphAPI(parameter: string): string {
        return parameter.replace("'", "''");
    }
}

export class Page extends GraphQueryableInstance {
    public async delete(): Promise<void> {
        return this.deleteCore();
    }
}

class Pages extends GraphQueryableCollection {
    public getById(id: string): Page {
        return this.clone(Page, id);
    }

    public async findByName(name: string): Promise<Page> {
        const n = GraphApiUtil.sanitizeGraphAPI(name);
        const results = await this.filter(`tolower(displayName) eq tolower('${n}')`).get<PageResult[]>();
        if (results.length > 0)
            return this.getById(results[0].id);
        else
            return null;
    }

    public async add(content: string): Promise<IAddPageResult> {
        const data = await this.postCore({
            body: content,
            headers: {
                "Content-type": "text/html"
            }
        });
        return { data: data, page: this.getById(data.id) };
    }
}

export class Section extends GraphQueryableInstance {
    public get pages(): Pages {
        return this.clone(Pages, 'pages');
    }

    public async delete(): Promise<void> {
        return this.deleteCore();
    }
}

export class Sections extends GraphQueryableCollection {
    public getById(id: string): Section {
        return this.clone(Section, id);
    }

    public async findByName(name: string): Promise<SectionResult> {
        const n = GraphApiUtil.sanitizeGraphAPI(name);
        const results = await this.filter(`tolower(displayName) eq tolower('${n}')`).get<SectionResult[]>();
        if (results.length > 0)
            return results[0];
        else
            return null;
    }

    public async add(name: string): Promise<IAddSectionResult> {
        const body = jsS({ displayName: name });
        const data = await this.postCore({ body: body });
        return { data: data };
    }
}

export class Notebook extends GraphQueryableInstance {
    public get sections(): Sections {
        return this.clone(Sections, 'sections');
    }
}

export class Notebooks extends GraphQueryableCollection {
    public getById(id: string): Notebook {
        return this.clone(Notebook, id);
    }

    public async findByName(name: string): Promise<Notebook> {
        const n = GraphApiUtil.sanitizeGraphAPI(name);
        const results = await this.filter(`tolower(displayName) eq tolower('${n}')`).get<NotebookResult[]>();
        if (results.length > 0)
            return this.getById(results[0].id);
        else
            return null;
    }
}

export class OneNote extends GraphQueryableInstance {
    public get notebooks(): Notebooks {
        return this.clone(Notebooks, 'notebooks');
    }

    public get sections(): Sections {
        return this.clone(Sections, 'sections');
    }

    public get pages(): Pages {
        return this.clone(Pages, 'pages');
    }
}

export class SiteGraph extends GraphQueryableInstance {
    public get onenote(): OneNote {
        return this.clone(OneNote, 'onenote');
    }
}

export class Sites extends GraphQueryableCollection {
    constructor(baseUrl: string | GraphQueryable) {
        super(baseUrl, 'sites');
    }

    public getById(siteId: string): SiteGraph {
        return this.clone(SiteGraph, siteId);
    }
}
