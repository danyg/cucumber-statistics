Feature: Last Executions

	Scenario: A user can Mark a scenario as fixed, this will hide the scenario from the view
		Given A user in Last Executions with "one nightly"
		When the user expands the "A user can Mark a scenario as fixed, this will hide the scenario from the view" scenario
		Then the user is presented with the option to "Mark as fixed" the scenario
		When the user "Mark as Fixed" the scenario
		Then the scenario gets hidden
		And the counter of hidden scenarios gets increased

	Scenario: The user can see hidden scenarios
		Given A user in Last Executions with "one nightly"
		And there is "1" scenario that has been "Mark as fixed"
		When the user show the hidden scenarios
		Then the hidden scenarios are displayed in a faded way indicating that were hidden

	Scenario: The user can Mark a scenario as not fixed yet
		Given A user in Last Executions with "one nightly"
		And there is "1" scenario that has been "Mark as fixed"
		When the user show the hidden scenarios
		And expand a scenario that was previously "Mark as fixed"
		Then the user "Mark as Not Fixed Yet" the scenario
		And the scenario is visible again

	Scenario: The user can Mark a scenario as not fixed yet
		Given A user in Last Executions with "one nightly"
		And there is "1" scenario that has been "Locally hidden"
		When the user show the hidden scenarios
		And expand a scenario that was previously "Locally hidden"
		Then the user "Show" the scenario
		And the scenario is visible again
