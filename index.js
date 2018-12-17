"use strict";

const React = require("react");

const createElement = React.createElement;
const Profiler = React.Profiler || React.unstable_Profiler;

function withProfiler(Component) {
  if (Profiler == null) {
    throw Error(
      "The current version of React does not support the Profiler API."
    );
  }

  const onRender = () => {
    SnapshotProfiler.__numCommits++;
  };

  const SnapshotProfiler = props =>
    createElement(
      Profiler,
      { id: "withProfiler", onRender: onRender },
      createElement(Component, props)
    );

  SnapshotProfiler.__hasVerifiedInitialCommit = false;
  SnapshotProfiler.__numCommits = 0;

  return SnapshotProfiler;
}

function toMatchNumCommits(SnapshotProfiler) {
  // Warn about renderers (e.g. react-test-renderer) that do not have Profiling enabled.
  // This seems preferable to giving a potential false positive by always matching 0.
  if (!SnapshotProfiler.__hasVerifiedInitialCommit) {
    if (SnapshotProfiler.__numCommits === 0) {
      return {
        message: () =>
          "Profiler onRender was never called.\n\n" +
          "This may indicate that you are using a version of React that does not support profiling.",
        pass: false
      };
    }

    SnapshotProfiler.__hasVerifiedInitialCommit = true;
  }

  expect(SnapshotProfiler.__numCommits).toMatchSnapshot();

  // Clear between runs so that subsequent calls yield more meaningful values.
  SnapshotProfiler.__numCommits = 0;

  return { pass: true };
}

function toHaveCommittedTimes(SnapshotProfiler, expectedNumCommits) {
  expect(SnapshotProfiler.__numCommits).toBe(expectedNumCommits);

  // Clear between runs so that subsequent calls yield more meaningful values.
  SnapshotProfiler.__numCommits = 0;

  return { pass: true };
}

// Auto-install
expect.extend({
  toHaveCommittedTimes,
  toMatchNumCommits
});

module.exports = {
  withProfiler
};
