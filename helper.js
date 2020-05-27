'use strict';

var axios = require('axios');

// Get JSON of all contact names
function getContacts(token){
	 var url = 'https://api.flock.co/v1/roster.listContacts?token=' + token;

	 return new Promise((resolve, reject) => {
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
			  console.log("Length of ans ", ans.length);
			  resolve(ans);

			})).catch(error => {
			  console.log(error);
			});

	 });
}

export default getContacts;
// getContacts('76e5d594-9b7c-465d-bd19-8d43e675c886');