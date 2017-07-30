Feature: Ingest

@ToDo
Scenario: the application will ignore images in passed scenarios to save server space
	Given a CI application
	When send a json cucumber report with "a passed scenario with images"
	Then the application skips to store given images

@ToDo
Scenario: the application will keep images for failed scenarios in gz format
	Given a CI application
	When send a json cucumber report with "a failed scenario with images"
	Then the application stores the given images

@ToDo
Scenario: the application will reject transaction without compression
	Given a CI application
	When send a json cucumber report without compression
	Then the application detects the headers of the transfered file
	And returns a "Bad Request" with the error "Please send data in gzip format"
