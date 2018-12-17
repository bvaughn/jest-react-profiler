# jest-react-profiler

Jest helpers for working with the React Profiler API.

## Installation

```
yarn add jest-react-profiler -D
```

## Example usage

```js
// Requiring this package will automatically register its custom matchers.
const { withProfiler } = require("jest-react-profiler");

function Greeting({ name }) {
  return <div>Hello, {name}</div>;
}

// Decorate a React component with a test Profiler:
const GreetingWithProfiler = withProfiler(Greeting);

// Next render it like normal:
render(
  <GreetingWithProfiler name="Brian" />,
  document.createElement("div")
);

// Now you can specify an expected number of commits:
expect(Example).toHaveCommittedTimes(1);

// Or use a Jest snapshot to track the value:
expect(Example).toMatchNumCommits();
```

## API

### `toHaveCommittedTimes(number)`

Verifies that the test profiler component committed a specific number of times since the last time the matcher was called.

This matcher resets the commit count between calls to simplify large test cases.

### `toMatchNumCommits()`

Uses Jest snapshots to verify that a test profiler component committed the same number of times as when it was last run.

This matcher verifies that at least once commit has occurred in order to avoid false positives when used with a renderer that does not have profiling enabled.

This matcher resets the commit count between calls to simplify large test cases.