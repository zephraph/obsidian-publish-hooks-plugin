import { Plugin } from "obsidian";
import { around } from "monkey-around";

const NS = "publish-hooks";
type VALID_EVENT = 'pre-publish' | 'post-publish' | 'intercept-upload'

const event = (name: VALID_EVENT) => `${NS}:${name}`

export default class PublishHooks extends Plugin {
  private whenReady() {
    if (!this.app.internalPlugins.plugins.publish) {
      console.error(`[${NS}] Publish plugin not found`);
      return;
    }

    const workspace = this.app.workspace;
    const publishPlugin = this.app.internalPlugins.plugins.publish.instance;

    const uninstall = around(publishPlugin, {
      apiRequest: (baseApiRequest) =>
        async function publishHooksPatched_apiRequest(this: unknown, ...args) {
          const params = args[0];
          if (params?.url?.endsWith("/api/upload")) {
            const updates = []
            workspace.trigger(event('intercept-upload'), function queueUpdate(doUpdate: (file: string, content: string ) => string) {
              updates.push(doUpdate)
            });
            // sleep
            // decodeData
            // doUpdates
            // encodeData
            // upload
          } else {
            return baseApiRequest.apply(this, args);
          }
        },
      apiUploadFile: (baseApiUploadFile) =>
        async function publishHooksPatched_apiUploadFile(this: unknown, ...args) {
          const path = args[0]?.path;
          if (!path) {
            console.error(
              `[${NS}]: Path wasn't found when calling apiUploadFile, the internal API may have changed.`
            );
            return baseApiUploadFile.apply(this, args);
          }
          workspace.trigger(event('pre-publish'), path);
          const result = await baseApiUploadFile.apply(this, args);
          workspace.trigger(event('post-publish'), path);
          return result;
        },
    });
    this.register(uninstall);
  }

  async onload() {
    this.app.workspace.onLayoutReady(this.whenReady.bind(this));
  }
}
