'use strict';

var axios = require('axios');

// Get JSON of all contact names
exports.getContacts = (token) => {
	 var url = 'https://api.flock.co/v1/roster.listContacts?token=' + token;
	 axios.all([
	  axios.get(url)
	]).then(axios.spread((response1) => {
	  // console.log(response1.data);
	  let rawData = response1.data;
	  let ans = rawData.map(x => {
	  	return {
	  		name : x.firstName + ' ' + x.lastName,
	  		id : x.id,
	  		profileImage: x.profileImage
	  	};
	  });
	  return [{status : 'yippee'}];
	  console.log("Length of ans ", ans.length);

	})).catch(error => {
	  console.log(error);
	});
}


// getContacts('76e5d594-9b7c-465d-bd19-8d43e675c886');