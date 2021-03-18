var request = require('request');
var stdin = process.stdin;
const limit = 10;

// gets current system date/time
getDateTime = () => {
	var today = new Date();
	systemDate = {
		hour: today.getHours(),
		minutes: today.getMinutes(),
		// seconds: today.getSeconds(),
		// year: today.getFullYear(),
		// month: today.getMonth() + 1,
		// date: today.getDate(),
		day: today.getDay(),
	};
};

// The $offset parameter is most often used in conjunction with $limit to page through a dataset - https://dev.socrata.com/docs/queries/offset.html

getFoodTrucks = (offset) => {
	// refresh time for each request
	getDateTime();

	// fix hour and minutes
	// if value is less than or equal to 9 it comes back without the 0
	if (systemDate.hour < 9) {
		systemDate.hour = '0' + systemDate.hour;
	}

	if (systemDate.minutes < 9) {
		systemDate.minutes = '0' + systemDate.minutes;
	}

	var currentTime = systemDate.hour + `:` + systemDate.minutes;

	// get food trucks api request and handlers
	request
		.get(
			`http://data.sfgov.org/resource/bbb8-hzi6.json?&dayorder=${systemDate.day}&$where=start24<='${currentTime}'%20and%20end24>'${currentTime}'&$select=applicant,location,start24,end24&$order=applicant&$limit=${limit}&$offset=${offset}`,
			function (error, response, body) {
				// convert the data from a string to a js object
				var openFoodTrucks = JSON.parse(body);
				var numTrucks = openFoodTrucks.length;

				console.log(`Your request was made at ${currentTime}.`);

				for (var i = 0; i < numTrucks; i++) {
					var truck = openFoodTrucks[i];
					console.log(
						`${i + 1}. ${
							truck.applicant
						} is currently open. They are located at ${
							truck.location
						}. Their hours are ${truck.start24} to ${truck.end24}.\n`
					);
				}
				printMoreTrucks(numTrucks, offset);
			}
		)
		// log the error if necessary
		.on('error', function (e) {
			console.error(e);
		});
};

printMoreTrucks = (numTrucks, offset) => {
	// if previous return had max trucks, display more
	if (numTrucks == limit) {
		console.log('Press enter to see more open food trucks...');

		stdin.addListener('data', function (data) {
			stdin.removeAllListeners('data');
			getFoodTrucks(limit + offset);
		});
	} else {
		console.log('No more open food trucks.');
		process.exit();
	}
};

getFoodTrucks(0);

// to run locally, first install node and npm. then:
// $ npm install request && node FoodTruckFinder.js
