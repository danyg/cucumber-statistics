Feature: Last Executions

	Scenario: A user can Mark a scenario as fixed, this will hide the scenario from the view
		Given A user in Last Executions with "one nightly"
		When the user expands the "A user can Mark a scenario as fixed, this will hide the scenario from the view" scenario
		Then the user is presented with the option to "Mark as fixed" the scenario
		When the user "Mark as Fixed" the scenario
		Then the scenario gets hidden
		And the counter of hidden scenarios gets increased

	@ToDo
	Scenario: The user can see hidden scenarios
		Given A user in Last Executions with "one nightly"
		And there are "2" hidden scenarios
		When the user interact with the functionality to show the hidden scenarios
		Then the hidden scenarios are displayed in a faded way indicating that were hidden

	@ToDo
	Scenario: The user can Mark a scenario as not fixed yet
		Given A user in Last Executions with "one nightly"
		And there are "2" hidden scenarios
		When the user interact with the functionality to show the hidden scenarios
		And expand a scenario that was previously "Mark as fixed"
		Then the user "Mark as Not Fixed Yet" the scenario
		And the scenario stop being hidden

	@ToDo
	Scenario: The user can Mark a scenario as not fixed yet
		Given A user in Last Executions with "one nightly"
		And there are "2" hidden scenarios
		When the user interact with the functionality to show the hidden scenarios
		And expand a scenario that was previously "Locally hidden"
		Then the user Shows the scenario
		And the scenario stop being hidden
