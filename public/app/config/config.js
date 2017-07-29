define([], function() {

	'use strict';

	return {
		routes: [
			{
				route: '',
				title: 'Home',
				moduleId: 'modules/home/home',
				nav: true,
				home: true
			},
			{
				route: 'nightly/:id',
				title: 'Nightly ',
				moduleId: 'modules/nightly/nightly',
				nav: false
			},
			{
				route: 'lastExecution',
				title: 'Last Executions ',
				moduleId: 'modules/lastExecution/lastExecution',
				nav: false
			}
		]
	};
});