// import { playwrightLauncher } from '@web/test-runner-playwright';

const filteredLogs = ['Running in dev mode', 'lit-html is in dev mode']

export default /** @type {import("@web/test-runner").TestRunnerConfig} */ ({
  files: 'test/**/*.test.js',
  /* nodeResolve: true, */

  /** Compile JS for older browsers. Requires @web/dev-server-esbuild plugin */
  // esbuildTarget: 'auto',

  /** Confgure bare import resolve plugin */
  nodeResolve: {
    exportConditions: ['browser', 'development']
  },

  filterBrowserLogs (log) {
    for (const arg of log.args) {
      if (typeof arg === 'string' && filteredLogs.some(l => arg.includes(l))) {
        return false
      }
    }
    return true
  }

  /** Amount of browsers to run concurrently */
  // concurrentBrowsers: 2,

  /** Amount of test files per browser to test concurrently */
  // concurrency: 1,

  /** Browsers to run tests on */
  // browsers: [
  //   playwrightLauncher({ product: 'chromium' }),
  //   playwrightLauncher({ product: 'firefox' }),
  //   playwrightLauncher({ product: 'webkit' }),
  // ],

  // See documentation for all available options
})
