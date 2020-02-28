# jupyterlab-autorun

`jupyterlab-autorun` provides a way to continually reevaluate a cell while you are editing it, allowing for a better experience when writing new or difficult code. This is similar to the autoevaluation mechanisms available in some IDEs like LightTable and Swift, though it is more primitive.

This is a little nicer than reevaluating cells and editting them again, and is especially nice for tuning options on plots or parameters to quick analysis scripts.

![Demo Video](./resource/demo.gif)

## Wishlist

1. Extract locals from cell being editted and include these values as independent output
2. Stacktrace folding

## Prerequisites

- JupyterLab

## Install

```bash
jupyter labextension install jupyterlab-autorun
```

## Development

### Contributing

If you would like to contribute, please feel free to be in contact or open a pull request.

### Dev Install

```bash
git clone https://github.com/chstan/jupyterlab-autorun.git
cd jupyterlab-autorun
jlpm build:dev
```
