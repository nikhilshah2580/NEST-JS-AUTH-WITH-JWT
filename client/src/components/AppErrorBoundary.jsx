import { Component } from "react";

export default class AppErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="mx-auto grid min-h-screen max-w-xl place-content-center px-6 text-center">
          <h1 className="font-['Manrope'] text-3xl font-bold text-[#202820]">
            Something went wrong
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#737a70]">
            The page could not be displayed. Reload to try again.
          </p>
          <button
            className="mx-auto mt-6 rounded-lg bg-[#416e50] px-5 py-3 font-semibold text-white hover:bg-[#355d43] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#416e50]"
            onClick={() => window.location.reload()}
            type="button"
          >
            Reload page
          </button>
        </main>
      );
    }

    return this.props.children;
  }
}
