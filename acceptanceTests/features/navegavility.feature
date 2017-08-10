Feature: Basic Navegavility

	Scenario: A user will be adviced of empty DB
		Given the database is empty
		And A user is in cucumber statistics
		Then the user is presented with an error message "Not nightlies founded" in the main menu

	Scenario: A user can select a nightly to be checked
		Given the database is populated with "one nightly"
		And A user is in cucumber statistics
		When the nightly "test-nightly" is selected
		Then the "Most unstables scenarios" container is displayed
		And the "Most time consuming scenarios" container is displayed

	Scenario: A user can select the last executions view
		Given A user is in cucumber statistics
		And the database is populated with "a few nightlies"
		When the last executions are selected
		Then the "All failed scenarios in last execution" container is displayed
		And the user is presented with the Filter Tags component
