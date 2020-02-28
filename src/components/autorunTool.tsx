import { PanelLayout } from "@phosphor/widgets";
import { NotebookTools, INotebookTracker } from "@jupyterlab/notebook";
import { Message } from "@phosphor/messaging";
import { ICellModel } from "@jupyterlab/cells";
import { JupyterLab } from "@jupyterlab/application";
import Toggle from "react-toggle";
import "react-toggle/style.css";

import * as React from "react";

import { AutorunWidget } from "./autorunWidget";
import { IRenderMimeRegistry } from "@jupyterlab/rendermime";
import { OutputAreaModel, SimplifiedOutputArea } from "@jupyterlab/outputarea";
import { IClientSession } from "@jupyterlab/apputils";

export interface AutorunToolComponentProps {
  widget: AutorunWidget;
}

export interface AutorunToolComponentState {
  isAutorunning: boolean;
  expletive: string;
}

export class AutorunToolComponent extends React.Component<any, any> {
  private interval: NodeJS.Timeout;
  constructor(props: AutorunToolComponentProps) {
    super(props);
    this.state = {
      isAutorunning: false,
      expletive: "####"
    } as AutorunToolComponentState;
  }

  componentDidMount(): void {
    this.interval = setInterval(this.updateExpletive.bind(this), 1500);
  }

  componentWillUnmount(): void {
    clearInterval(this.interval);
  }

  updateExpletive() {
    const letters = "!@#$%^&*";
    let word = "";

    for (let _ of Array.from(Array(4))) {
      word = word + letters[Math.floor(Math.random() * letters.length)];
    }

    this.setState((s: AutorunToolComponentState) => {
      const newState = Object.assign({}, s);
      newState.expletive = word;
      return newState;
    });
  }

  toggleAutorun() {
    this.props.widget.active = !this.state.isAutorunning;
    this.setState((s: AutorunToolComponentState) => {
      const newState = Object.assign({}, s);
      newState.isAutorunning = !newState.isAutorunning;
      return newState;
    });
  }

  render() {
    return (
      <div style={{ paddingTop: "1 rem" }}>
        <label>
          <Toggle
            defaultChecked={this.state.isAutorunning}
            onChange={this.toggleAutorun.bind(this)}
          />
          <span>{this.state.expletive} it, we'll do it live!</span>
        </label>
      </div>
    );
  }
}

export class AutorunTool extends NotebookTools.Tool {
  private cellContentListener: (c: ICellModel, _: any) => void | null;
  private outputAreaModelA: OutputAreaModel;
  private outputAreaA: SimplifiedOutputArea;
  private outputAreaModelB: OutputAreaModel;
  private outputAreaB: SimplifiedOutputArea;
  constructor(
    notebook_Tracker: INotebookTracker,
    app: JupyterLab,
    rendermime: IRenderMimeRegistry
  ) {
    super();
    this.notebookTracker = notebook_Tracker;
    let layout = (this.layout = new PanelLayout());
    this.widget = new AutorunWidget(null, this.executesCode.bind(this));
    this.outputAreaModelA = new OutputAreaModel();
    this.outputAreaA = new SimplifiedOutputArea({
      model: this.outputAreaModelA,
      rendermime: rendermime
    });
    this.outputAreaModelB = new OutputAreaModel();
    this.outputAreaB = new SimplifiedOutputArea({
      model: this.outputAreaModelB,
      rendermime: rendermime
    });
    layout.addWidget(this.widget);
    layout.addWidget(this.outputAreaA);
    layout.addWidget(this.outputAreaB);
    this.outputAreaB.hide();
  }

  executesCode(code: string, session: IClientSession) {
    SimplifiedOutputArea.execute(code, this.outputAreaB, session)
      .then(() => {
        this.outputAreaA.hide();
        this.outputAreaB.show();
        const swap = this.outputAreaB;
        this.outputAreaB = this.outputAreaA;
        this.outputAreaA = swap;
      })
      .catch(console.error);
  }
  /**
   * Handle a change to the active cell.
   */
  protected onActiveCellChanged(msg: Message): void {
    const lastActiveCell = this.widget.currentActiveCell;

    if (this.cellContentListener) {
      lastActiveCell.model.contentChanged.disconnect(this.cellContentListener);
      this.cellContentListener = null;
    }
    this.widget.currentActiveCell = this.notebookTools.activeCell;
    if (this.widget.currentActiveCell && this.widget.currentActiveCell.model) {
      this.cellContentListener = (c: ICellModel, _: any) =>
        this.widget.onContentChanged.call(this.widget, c);
      this.widget.currentActiveCell.model.contentChanged.connect(
        this.cellContentListener
      );
    }
  }

  protected onActiveNotebookPanelChanged(msg: Message): void {
    this.widget.activePanel = this.notebookTools.activeNotebookPanel;
  }

  private widget: AutorunWidget = null;
  public notebookTracker: INotebookTracker = null;
}
