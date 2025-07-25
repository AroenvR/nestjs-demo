const TEST_NAME = "PQTaskManager.Integration";
describe(TEST_NAME, () => {
	process.env.TEST_NAME = TEST_NAME; // Creates a log file named with this test's name.

	beforeEach(() => {});

	afterEach(() => {});

	// --------------------------------------------------

	it("Should be defined", () => {
		expect(true).toEqual(true);
	});
});
