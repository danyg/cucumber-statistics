Feature: Basic Navegavility

	Scenario: A user can select a nightly to be check
		Given A user is in cucumber statistics
		When the nightly "main" is selected
		Then the "Most unstables scenarios" container is displayed
		And the "Most time consuming scenarios" container is displayed

	Scenario: A user can select the last executions view
		Given A user is in cucumber statistics
		When the last executions are selected
		Then the "All failed scenarios in last execution" container is displayed
		And the user is presented with the Filter Tags component