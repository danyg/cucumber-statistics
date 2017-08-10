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
		Then the hidden scenarios are displayed in a faded way indicating it is hidden

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

	Scenario: A hidden scenario remains hidden when tags filter is activated
		Given A user in Last Executions with "a sample nightly"

		When the user expands the "Nullam quis lectus vel dolor dapibus feugiat." scenario
		And the user adds "@Pellentesque" tag to "excluded" tags
		Then the scenario gets hidden

		When the user expands the "Duis sagittis quam a dolor sollicitudin, ac convallis enim lacinia." scenario
		And the user "Mark as Fixed" the scenario
		Then the scenario gets hidden
		When the user show the hidden scenarios
		Then the scenario is shown in a faded way indicating it is hidden
		When the user hide the hidden scenarios
		Then the scenario gets hidden

	Scenario: A hidden scenario is shown even if contains a tag excluded in the filters
		Given A user in Last Executions with "a sample nightly"
		When the user expands the "Praesent eget magna vitae nibh ultrices suscipit eu ac lorem." scenario
		And the user "Hide" the scenario
		Then the scenario gets hidden
		When the user adds "@Pellentesque" tag to "excluded" tags
		Then the scenario remains hidden
		When the user show the hidden scenarios
		Then the scenario is shown in a faded way indicating it is hidden
