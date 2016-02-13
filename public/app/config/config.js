define([], function() {

	'use strict';

	return {
		routes: [
			{
				route: '',
				title: 'Home',
				moduleId: 'home/home',
				nav: true,
				home: true
			},
			{
				route: 'nightly/:id',
				title: 'Nightly ',
				moduleId: 'nightly/nightly',
				nav: false
			},
			{
				route: 'lastExecution',
				title: 'Last Executions ',
				moduleId: 'lastExecution/lastExecution',
				nav: false
			}
		]
	};
});