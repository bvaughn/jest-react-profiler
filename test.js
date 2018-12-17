"use strict";

const React = require("react");
const { render } = require("react-dom");

const { withProfiler } = require("./index");
const { Component } = React;

describe("jest-react-profiler", () => {
  describe("withProfiler", () => {
    it("fails if Profiler does not commit at least once", () => {
      const FunctionComponent = () => "Hello!";
      const Example = withProfiler(FunctionComponent);

      expect(() => {
        expect(Example).toMatchNumCommits();
      }).toThrow("Profiler onRender was never called.");
    });

    it("doesn't fail if Profiler doesn't commit as part of an update", () => {
      const FunctionComponent = () => "Hello!";
      const Example = withProfiler(FunctionComponent);

      const container = document.createElement("div");
      render(<Example />, container);
      expect(Example).toMatchNumCommits();
      expect(Example).toMatchNumCommits();
    });

    [true, false].forEach(useSnapshots => {
      it("supports initial mount", () => {
        const FunctionComponent = () => "Hello!";
        const Example = withProfiler(FunctionComponent);

        const container = document.createElement("div");
        render(<Example />, container);

        if (useSnapshots) {
          expect(Example).toMatchNumCommits();
        } else {
          expect(Example).toHaveCommittedTimes(1);
        }
      });

      it("supports cascading renders", () => {
        class ClassComponent extends Component {
          constructor(props) {
            super(props);
            this.state = {
              isMounted: false
            };
          }
          componentDidMount() {
            this.setState({ isMounted: true });
          }
          render() {
            return "Hello!";
          }
        }
        const Example = withProfiler(ClassComponent);

        const container = document.createElement("div");
        render(<Example />, container);

        if (useSnapshots) {
          expect(Example).toMatchNumCommits();
        } else {
          expect(Example).toHaveCommittedTimes(2);
        }
      });

      it("supports multiple calls within a single test case", () => {
        class CascadesOnUpdate extends Component {
          constructor(props) {
            super(props);
            this.state = {
              didCascade: false
            };
          }
          componentDidUpdate(prevProps, prevState) {
            if (!this.state.didCascade) {
              this.setState({ didCascade: true });
            }
          }
          render() {
            return "Hello!";
          }
        }
        const Example = withProfiler(CascadesOnUpdate);

        const container = document.createElement("div");
        render(<Example />, container);

        if (useSnapshots) {
          expect(Example).toMatchNumCommits();
        } else {
          expect(Example).toHaveCommittedTimes(1);
        }

        render(<Example />, container);

        if (useSnapshots) {
          expect(Example).toMatchNumCommits();
        } else {
          expect(Example).toHaveCommittedTimes(2);
        }
      });

      it("tracks updates in nested components", () => {
        let numRootUpdates = 0;
        class RootComponent extends Component {
          render() {
            numRootUpdates++;
            return this.props.children;
          }
        }
        const Root = withProfiler(RootComponent);

        let instance;
        let numNestedUpdates = 0;
        class NestedComponent extends Component {
          constructor(props) {
            super(props);
            this.state = {};
          }
          render() {
            instance = this;
            numNestedUpdates++;
            return null;
          }
        }

        const container = document.createElement("div");
        render(
          <Root>
            <NestedComponent />
          </Root>,
          container
        );

        expect(numRootUpdates).toBe(1);
        expect(numNestedUpdates).toBe(1);

        if (useSnapshots) {
          expect(Root).toMatchNumCommits();
        } else {
          expect(Root).toHaveCommittedTimes(1);
        }

        instance.setState({});

        expect(numRootUpdates).toBe(1);
        expect(numNestedUpdates).toBe(2);

        if (useSnapshots) {
          expect(Root).toMatchNumCommits();
        } else {
          expect(Root).toHaveCommittedTimes(1);
        }
      });

      it("supports nested test profilers", () => {
        let root;
        class RootComponent extends Component {
          render() {
            root = this;
            return this.props.children;
          }
        }
        const Root = withProfiler(RootComponent);

        class NestedComponent extends Component {
          render() {
            return null;
          }
        }
        const Nested = withProfiler(NestedComponent);

        const container = document.createElement("div");
        render(
          <Root>
            <Nested />
          </Root>,
          container
        );

        if (useSnapshots) {
          expect(Root).toMatchNumCommits();
          expect(Nested).toMatchNumCommits();
        } else {
          expect(Root).toHaveCommittedTimes(1);
          expect(Nested).toHaveCommittedTimes(1);
        }

        root.forceUpdate();

        if (useSnapshots) {
          expect(Root).toMatchNumCommits();
          expect(Nested).toMatchNumCommits();
        } else {
          expect(Root).toHaveCommittedTimes(1);
          expect(Nested).toHaveCommittedTimes(0);
        }
      });
    });
  });
});
