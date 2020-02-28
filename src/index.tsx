import { JupyterLab, JupyterFrontEndPlugin } from "@jupyterlab/application";

import { INotebookTools, INotebookTracker } from "@jupyterlab/notebook";

import { AutorunTool } from "./components";

import { IRenderMimeRegistry } from "@jupyterlab/rendermime";

/**
 * Initialization data for the jupyterlab-autorun extension.
 */
function activate(
  app: JupyterLab,
  cellTools: INotebookTools,
  rendermime: IRenderMimeRegistry,
  notebook_Tracker: INotebookTracker
) {
  const autorunTool = new AutorunTool(notebook_Tracker, app, rendermime);
  cellTools.addItem({ tool: autorunTool, rank: 1.7 });
}

const extension: JupyterFrontEndPlugin<void> = {
  id: "jupyterlab-autorun",
  autoStart: true,
  requires: [INotebookTools, IRenderMimeRegistry, INotebookTracker],
  activate: activate
};

export default extension;
