import * as obsidian from "obsidian";

// Empty declaration to allow for css imports
declare module "*.css" {}

declare module "obsidian" {
  interface UploadArgs {
    method: "GET" | "POST" | "PUT";
    url: string;
    headers: { [header: string]: string };
    data: any;
  }
  export interface App {
    /**
     * @private Do not use this unless you know what you're doing
     * */
    internalPlugins: {
      plugins: {
        publish: {
          instance: {
            apiRequest(options: UploadArgs): Promise<any>;
            apiUploadFile(file: obsidian.TAbstractFile): Promise<any>;
          };
        };
      };
    };
  }
}
