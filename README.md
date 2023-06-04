# nodecode

Low-code development platform for flow-based visual programming.

![Example Screenshot](README_images/Screenshot%202023-06-04.png)

# Getting Started

This is a monorepo that consists of the following packages:

- nodecode-ui (frontend)
- nodecode-runtime (backend)
- nodecode-docs (documentation)

# Installation

To start, you need to have [Node](https://nodejs.dev/), npm (usually comes with Node) and [Python](https://www.python.org/) installed.

Clone the project and run:

```
npm install
```

After installing the npm packages, it will try to install the python packages. If you only want to run the frontend, you can ignore this step.

# Usage

To run the frontend, execute:

```
npm start
```

In order to run programs in nodecode, a runtime needs to be connected. You can start it by opening a separate terminal and running:

```
npm run runtime
```

# Documentation

The documentation of front- and backend is contained in a separate packages that can be started using:

```
npm run docs
```