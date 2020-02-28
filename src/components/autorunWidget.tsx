import { Cell, ICellModel } from "@jupyterlab/cells";

import { NotebookPanel } from "@jupyterlab/notebook";

import { Widget } from "@phosphor/widgets";

import { AutorunToolComponent } from "./autorunTool";

import * as React from "react";
import * as ReactDOM from "react-dom";
import Timeout = NodeJS.Timeout;
import { nbformat } from "@jupyterlab/coreutils";
import MultilineString = nbformat.MultilineString;
import { IClientSession } from "@jupyterlab/apputils";

function debounced<T extends (...parameters: any[]) => any>(
  fn: T,
  after = 100
) {
  let timeout: Timeout;

  return (...args: Parameters<T>): Promise<ReturnType<T>> => {
    return new Promise(resolve => {
      if (timeout) {
        clearTimeout(timeout);
      }

      timeout = setTimeout(() => resolve(fn(...args)), after);
    });
  };
}

function areMultilinesEqual(a: MultilineString, b: MultilineString): boolean {
  if (typeof a !== typeof b) return false;

  if (typeof a === "string") return a === b;

  for (let index = 0; index < a.length; index++) {
    if (a[index] !== b[index]) return false;
  }

  return true;
}

export class AutorunWidget extends Widget {
  activePanel: NotebookPanel | null;
  lastSource: MultilineString | null;
  active: boolean;
  private readonly onExecuteCode: (
    code: string,
    session: IClientSession
  ) => void;
  constructor(
    panel: NotebookPanel | null,
    onExecuteCode: (code: string) => void
  ) {
    super();
    this.lastSource = null;
    this.activePanel = panel;
    this.onExecuteCode = onExecuteCode;
    this.active = false;
    Private.setWidget(this);
    Private.renderInternal();
  }

  currentActiveCell: Cell = null;

  immediatelyStartCellSubmission(cellSource: MultilineString) {
    let flatSource = cellSource;
    if (typeof cellSource !== "string") {
      flatSource = cellSource.join("\n");
    }
    this.onExecuteCode(flatSource as string, this.activePanel.session);
  }

  startCellSubmission = debounced(
    this.immediatelyStartCellSubmission.bind(this),
    500
  );

  onContentChanged(cell: ICellModel) {
    if (!this.active) {
      this.lastSource = null;
      return;
    }

    if (cell.type === "code") {
      const cellSource = cell.toJSON().source;
      if (
        this.lastSource === null ||
        !areMultilinesEqual(this.lastSource, cellSource)
      ) {
        this.lastSource = cellSource;
        this.startCellSubmission(cellSource).then(() => {});
      }
    }
  }
}

namespace Private {
  let widget: AutorunWidget = null;

  export function setWidget(currentWidget: AutorunWidget) {
    widget = currentWidget;
  }

  export function renderInternal() {
    ReactDOM.render(<AutorunToolComponent widget={widget} />, widget.node);
  }
}
