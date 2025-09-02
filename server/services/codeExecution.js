
export const executeCode = async (code, testCases) => {
  const results = {
    output: '',
    testResults: [],
    executionTime: 0
  };

  const startTime = Date.now();

  try {
    // Create a simple evaluation context
    const functionMatch = code.match(/function\s+(\w+)/);
    const functionName = functionMatch ? functionMatch[1] : null;

    if (!functionName) {
      throw new Error('No function found in code');
    }

    // Evaluate the code to get the function
    
    const func = eval(`(${code}; ${functionName})`);

    results.testResults = testCases.map((testCase, index) => {
      try {
        // Parse input 
        const args = testCase.input.split(',').map(arg => {
          try {
            return JSON.parse(arg.trim());
          } catch {
            return arg.trim().replace(/['"]/g, '');
          }
        });

        const result = func(...args);
        const expected = JSON.parse(testCase.expectedOutput);
        const passed = JSON.stringify(result) === JSON.stringify(expected);

        return {
          testCase: index + 1,
          passed,
          input: testCase.input,
          expected: testCase.expectedOutput,
          actual: JSON.stringify(result),
          description: testCase.description
        };
      } catch (error) {
        return {
          testCase: index + 1,
          passed: false,
          input: testCase.input,
          expected: testCase.expectedOutput,
          actual: `Error: ${error.message}`,
          description: testCase.description
        };
      }
    });

    const passedTests = results.testResults.filter(r => r.passed).length;
    results.output = ` ${passedTests}/${testCases.length} test cases passed`;

  } catch (error) {
    results.output = ` Error: ${error.message}`;
    results.testResults = testCases.map((_, index) => ({
      testCase: index + 1,
      passed: false,
      error: error.message
    }));
  }

  results.executionTime = Date.now() - startTime;
  return results;
};