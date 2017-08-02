// show problems with unhandled rejected promises
process.on('unhandledRejection', r => LOGGER.error('unhandledRejection\n\t', r));

// more Locators types
By.testId = (testid) => by.css(`[data-testid="${testid}"]`);
By.testClass = (testClass) => by.css(`[data-testclass="${testClass}"]`);

