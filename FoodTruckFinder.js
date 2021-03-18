var request = require('request');
var stdin = process.stdin;
const limit = 10;

// Get current system time
getTime = () => {
	var currentTime = new Date();
	sysTime = {
		hour: currentTime.getHours(),
		minutes: currentTime.getMinutes(),
		day: currentTime.getDay(),
	};
};

getFoodTrucks = (offset) => {
	// Refresh time for each request
	getTime();

	// fix hour and minutes
	// if value is less than or equal to 9 it comes back without the 0
	if (sysTime.hour < 9) {
		sysTime.hour = '0' + sysTime.hour;
	}

	if (sysTime.minutes < 9) {
		sysTime.minutes = '0' + sysTime.minutes;
	}

	var currentTime = sysTime.hour + `:` + sysTime.minutes;

  // API options
  var baseURL = `http://data.sfgov.org/resource/bbb8-hzi6.json?`;
  var dayOrder = `&dayorder=${sysTime.day}`; // set the current day
  var openTime = `&$where=start24<='${currentTime}'%20and%20end24>'${currentTime}'`; // set the time range
  var dataSelect = `&$select=applicant,location,start24,end24`; // set what data to return for each truck
  var sort = `&$order=applicant`; // sort in ascending order by name
  var page = `&$limit=${limit}&$offset=${offset}`; // set the max # of trucks to return and offset for pages

	// Get food trucks request
	request
		.get(
			`${baseURL}${dayOrder}${openTime}${dataSelect}${sort}${page}`,
			function (error, response, body) {
        // Print the error if one occurred
        if (error != null) {
          console.error('error:', error);
        }
        // Print the response status code if 200 not received
        if (response.statusCode != 200) {
          console.log('statusCode:', response && response.statusCode);
        }
        // Print the data if no error and status code success
        if (!error && response.statusCode == 200) {
        // Parse data from a string to a JS object
				var openFoodTrucks = JSON.parse(body);
				var numTrucks = openFoodTrucks.length;

				console.log(`Your local time is ${currentTime}.`);

        // Loop to display trucks on page
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
			}
		)
};

printMoreTrucks = (numTrucks, offset) => {
	// If the previous return had max trucks per page, display more
	if (numTrucks == limit) {
    // Increment the offset by the page limit
    offset += limit;

    // Prompt the user to proceed
		console.log('Press enter to see more open food trucks...');

    // Wait for user to press key
		stdin.addListener('data', function (data) {
			stdin.removeAllListeners('data');
			getFoodTrucks(offset);
		});
	} else {
		console.log('No more open food trucks.');
		process.exit();
	}
};

// On load
getFoodTrucks(0);

// to run locally, first install node and npm. then:
// $ npm install request && node FoodTruckFinder.js
// CTRL + C in command line to exit program early