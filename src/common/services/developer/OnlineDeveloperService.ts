import { IDeveloperService } from "./DeveloperServiceDescriptor";
import { isExecutingInWorkbench } from "../../Utils";

export class OnlineDeveloperService implements IDeveloperService {
    public async initialize() {
    }

    public registerScripts(scripts: {}): void {
        if (isExecutingInWorkbench()) {
            (window as any).dev = Object.assign((window as any).dev || {}, scripts);
        }
    }
}