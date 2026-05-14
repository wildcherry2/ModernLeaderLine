## Simple element-to-element arrow line drawer
* Draws a pointed arrow from one element to another, with the ability to dynamically update as needed
* Uses `IntersectionObserver` to get element geometry in order to prevent reflow during animations or drag-and-drop user interactions.
* Inspired from https://github.com/anseki/leader-line

## Usage
You can declaratively instantiate a `LeaderLine` using a `leader-line` HTML element and specifying the `source-selector` and `target-selector` attributes to indicate the direction the line should be drawn.

You can also programmatically instantiate a `LeaderLine` using `document.createElement('leader-line')` and setting the element's source and target elements.

To facilate reflow-free position updates, call the `position` method of the `LeaderLine` element whenever the source or target elements change position or size. You can use `MutationObservers`, `IntersectionObservers`, or events (for drag-and-drop interactions) to tell when to call `position`.

## Build Instructions

You can use this like any other local NPM package, just `npm install {path/to/this/directory}`.

For development purposes, you can run `npm install` inside this directory, then `npm run build` to build the library files, `npm run build:demo` to build the demo, or `npm run start` to start up a Webpack Dev Server with the demo.