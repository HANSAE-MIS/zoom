//include required modules
const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const config = require('./config');
const rp = require('request-promise');
const merge = require('deepmerge');
const request = require('request');
const router = require('./router/main')(app);
const bodyParser = require('body-parser');
const utf8 = require('utf8');
const axios = require('axios');

const querystring = require("querystring");

 
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

const port = 8082;

//Use the ApiKey and APISecret from config.js
const payload = {
    iss: config.APIKey,
    exp: ((new Date()).getTime() + 5000)
};

let token = "";
// const token = jwt.sign(payload, config.APISecret);

const asyncWrapper = asyncFn => {
	return (async (req, res, next) => {
		try {
			return await asyncFn(req, res, next);
		} catch (error) {
			return next(error); }
	});
};

function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}


function getPendingUsers(nextPageToken = "") {
	var options;
	if (nextPageToken == "") {
		options = {
			//You can use a different uri if you're making an API call to a different Zoom endpoint.
			uri: "https://api.zoom.us/v2/users/",
			qs: {
				page_size : 300,
				status : 'pending'
			},
			// auth: {
			// 	'bearer': token
			// },
			headers: {
				authorization: `Bearer ${token}`, // Do not publish or share your token publicly.
			},
			// headers: {
			// 	'User-Agent': 'Zoom-api-Jwt-Request',
			// 	'content-type': 'application/json'
			// },
			json: true //Parse the JSON string in the response
		};
	} else {
		options = {
			//You can use a different uri if you're making an API call to a different Zoom endpoint.
			uri: "https://api.zoom.us/v2/users/",
			qs: {
				page_size : 300,
				status : 'pending',
				next_page_token : nextPageToken
			},
			// auth: {
			// 	'bearer': token
			// },
			// headers: {
			// 	'User-Agent': 'Zoom-api-Jwt-Request',
			// 	'content-type': 'application/json'
			// },
			headers: {
				authorization: `Bearer ${token}`, // Do not publish or share your token publicly.
			},
			json: true //Parse the JSON string in the response
		};
	}
	return new Promise(function (resolve, reject) {
		request(options, function (err, res, body) {
			if (!err && res.statusCode == 200) {
				resolve(body);
			} else {
				reject(err);
			}
		});
	});
}


function getUsers(nextPageToken = "") {
	var options;
	if (nextPageToken == "") {
		options = {
			//You can use a different uri if you're making an API call to a different Zoom endpoint.
			uri: "https://api.zoom.us/v2/users/",
			qs: {
				page_size : 300
			},
			// auth: {
			// 	'bearer': token
			// },
			// headers: {
			// 	'User-Agent': 'Zoom-api-Jwt-Request',
			// 	'content-type': 'application/json'
			// },
			headers: {
				authorization: `Bearer ${token}`, // Do not publish or share your token publicly.
			},
			json: true //Parse the JSON string in the response
		};
	} else {
		options = {
			//You can use a different uri if you're making an API call to a different Zoom endpoint.
			uri: "https://api.zoom.us/v2/users/",
			qs: {
				page_size : 300,
				next_page_token : nextPageToken
			},
			// auth: {
			// 	'bearer': token
			// },
			// headers: {
			// 	'User-Agent': 'Zoom-api-Jwt-Request',
			// 	'content-type': 'application/json'
			// },
			headers: {
				authorization: `Bearer ${token}`, // Do not publish or share your token publicly.
			},
			json: true //Parse the JSON string in the response
		};
	}
	return new Promise(function (resolve, reject) {
		request(options, function (err, res, body) {
			if (!err && res.statusCode == 200) {
				resolve(body);
			} else {
				reject(err);
			}
		});
	});
}

function getLiveMeetings(nextPageToken = "") {
	var options;
	var vDate = new Date();
	var fromDate = vDate.getDate() - 14;
	var toDate = vDate.getDate() + 14;

	if (nextPageToken == "") {
		options = {
			//You can use a different uri if you're making an API call to a different Zoom endpoint.
			uri: "https://api.zoom.us/v2/metrics/meetings",
			qs: {
				type : 'live',
				page_size : 300,
				from : fromDate,
				to : toDate
			},
			// auth: {
			// 	'bearer': token
			// },
			// headers: {
			// 	'User-Agent': 'Zoom-api-Jwt-Request',
			// 	'content-type': 'application/json'
			// },
			headers: {
				authorization: `Bearer ${token}`, // Do not publish or share your token publicly.
			},
			json: true //Parse the JSON string in the response
		};
	} else {
		options = {
			//You can use a different uri if you're making an API call to a different Zoom endpoint.
			uri: "https://api.zoom.us/v2/metrics/meetings",
			qs: {
				type : 'live',
				page_size : 300,
				next_page_token : nextPageToken,
				from : fromDate,
				to : toDate
			},
			// auth: {
			// 	'bearer': token
			// },
			// headers: {
			// 	'User-Agent': 'Zoom-api-Jwt-Request',
			// 	'content-type': 'application/json'
			// },
			headers: {
				authorization: `Bearer ${token}`, // Do not publish or share your token publicly.
			},
			json: true //Parse the JSON string in the response
		};
	}

	return new Promise(function (resolve, reject) {
		request(options, function (err, res, body) {
			if (!err && res.statusCode == 200) {
				resolve(body);
			} else {
				reject(err);
			}
		});
	});
}

async function getAllPendingUsers() {
	var userList;
	let result = await getPendingUsers(nextPageToken = "");
	userList = merge(userList, result["users"]);
	while (result["page_number"] != result["page_count"] && result["next_page_token"] != '') {
		let temp = await getPendingUsers(result["next_page_token"]);
		result = temp;
		userList = merge(userList, temp["users"]);
	}
	return userList;
}


/* async function getAllPendingUsers() {
	var userList;
	let result = await getUsers(nextPageToken = "");
	userList = merge(userList, result["users"]);
	while (result["page_number"] != result["page_count"] && result["next_page_token"] != '') {
		let temp = await getUsers(result["next_page_token"]);
		result = temp;
		userList = merge(userList, temp["users"]);
	}
	userList = userList.filter(function(el) {
        return (
			el["first_name"] == "" &&
			el["last_name"] == ""
		);
    });
	//console.log(userList);
	return userList;
} */

async function getAllUsers() {
	var userList;
	let result = await getUsers(nextPageToken = "");
	userList = merge(userList, result["users"]);
	while (result["page_number"] != result["page_count"] && result["next_page_token"] != '') {
		let temp = await getUsers(result["next_page_token"]);
		result = temp;
		userList = merge(userList, temp["users"]);
	}
	//console.log(userList);
	return userList;
}

async function getAllLiveMeetings() {
	var meetingList;
	let result = await getLiveMeetings(nextPageToken = "");
	meetingList = merge(meetingList, result["meetings"]);
	while (result["page_number"] != result["page_count"] && result["next_page_token"] != '') {
		let temp = await getLiveMeetings(result["next_page_token"]);
		result = temp;
		meetingList = merge(meetingList, temp["meetings"]);
	}
	return meetingList;
}

function getType2Users(userList) {
	userList = userList.filter(function(el) {
        return (
			el["type"] == "2" &&
			el["email"] != "mis@hansae.com" &&
			el["email"] != "jennycho@hansae.com" &&
			el["email"] != "khgo@hansae.com"
		);
    });

	//sort by last login time
	userList.sort((a, b) => (
		new Date(a.last_login_time) > new Date(b.last_login_time) ? 1 : -1
	));
	return userList
}

function createUser(user) {
	var options;
	if (user != null) {
		options = {
			//You can use a different uri if you're making an API call to a different Zoom endpoint.
			uri: "https://api.zoom.us/v2/users/",
			method: 'POST',
			body: {
				action : 'create',
				user_info : user
			},
			// auth: {
			// 	'bearer': token
			// },
			// headers: {
			// 	'User-Agent': 'Zoom-api-Jwt-Request',
			// 	'content-type': 'application/json'
			// },
			headers: {
				authorization: `Bearer ${token}`, // Do not publish or share your token publicly.
			},
			json: true //Parse the JSON string in the response
		};
		console.log(options);
	}
	return new Promise(function (resolve, reject) {
		request(options, function (err, res, body) {
			if (!err) {
				resolve(body);
			} else {
				console.log(res);
				//console.log(err);
				reject(err);
			}
		});
	});
}


function deleteUser(user) {
	var options;
	if (user != null) {
		options = {
			//You can use a different uri if you're making an API call to a different Zoom endpoint.
			uri: "https://api.zoom.us/v2/users/" + user['userId'],
			method: 'DELETE',
			body: {
				action : 'delete'
			},
			// auth: {
			// 	'bearer': token
			// },
			// headers: {
			// 	'User-Agent': 'Zoom-api-Jwt-Request',
			// 	'content-type': 'application/json'
			// },
			headers: {
				authorization: `Bearer ${token}`, // Do not publish or share your token publicly.
			},
			json: true //Parse the JSON string in the response
		};
	}
	return new Promise(function (resolve, reject) {
		request(options, function (err, res, body) {
			if (!err) {
				resolve(body);
			} else {
				console.log(body);
				reject(body);
			}
		});
	});
}

function updateUser(user) {
	var options;
	if (user != null) {
		options = {
			//You can use a different uri if you're making an API call to a different Zoom endpoint.
			uri: "https://api.zoom.us/v2/users/" + user['userId'],
			method: 'PATCH',
			body: {
				type : user['type']
			},
			// auth: {
			// 	'bearer': token
			// },
			// headers: {
			// 	'User-Agent': 'Zoom-api-Jwt-Request',
			// 	'content-type': 'application/json'
			// },
			headers: {
				authorization: `Bearer ${token}`, // Do not publish or share your token publicly.
			},
			json: true //Parse the JSON string in the response
		};
	}
	return new Promise(function (resolve, reject) {
		request(options, function (err, res, body) {
			if (!err) {
				resolve(body);
			} else {
				console.log(body);
				reject(body);
			}
		});
	});
}

function getUserObject(userList, email) {
	user = userList.filter(function(el) {
        return (
			el["email"] == email
		);
    });
	return user[0];
}

async function removeLicense(email) {
	var userList = await getAllUsers();
	var type2Users = getType2Users(userList)

	//Free up a license
	if (!isEmpty(type2Users)) {
		var options;
		options = {
			//You can use a different uri if you're making an API call to a different Zoom endpoint.
			uri: "https://api.zoom.us/v2/users/" + type2Users[0]["id"],
			method: 'PATCH',
			body: {
				type : 1
			},
			// auth: {
			// 	'bearer': token
			// },
			// headers: {
			// 	'User-Agent': 'Zoom-api-Jwt-Request',
			// 	'content-type': 'application/json'
			// },
			headers: {
				authorization: `Bearer ${token}`, // Do not publish or share your token publicly.
			},
			json: true //Parse the JSON string in the response
		};

		return new Promise(function (resolve, reject) {
			request(options, function (err, res, body) {
				if (!err) {
					resolve(body);
				} else {
					reject(err);
				}
			});
		});
	}
}

async function addLicense(email) {
	var userList = await getAllUsers();
	//Give license to user with email
	var user = getUserObject(userList, email);
	console.log(user);
	if (user != null) {
		var options;
		options = {
			//You can use a different uri if you're making an API call to a different Zoom endpoint.
			uri: "https://api.zoom.us/v2/users/" + user["id"],
			method: 'PATCH',
			body: {
				type : 2
			},
			// auth: {
			// 	'bearer': token
			// },
			// headers: {
			// 	'User-Agent': 'Zoom-api-Jwt-Request',
			// 	'content-type': 'application/json'
			// },
			headers: {
				authorization: `Bearer ${token}`, // Do not publish or share your token publicly.
			},
			json: true //Parse the JSON string in the response
		};

		return new Promise(function (resolve, reject) {
			request(options, function (err, res, body) {
				if (!err) {
					resolve(body);
				} else {
					reject(err);
				}
			});
		});
	}
}


/*
    사용중인 목록 조회
 */
app.post('/api/getMeetingList', asyncWrapper(async (req, res, next) => {
	try {
		var meetingList = await getAllLiveMeetings();
		//throw new Error('Async 사용자 정의 에러 발생');
		res.send({
			result: JSON.stringify(meetingList)
		});
		//res.json();
	} catch (error) {
		console.log("error", error)
		next(error);
	}
}));


/*
    User List 조회
    Paging 처리 되도록 API 변경되어 재귀 함수 사용.
    page_size max 300
 */


app.post('/api/getUserList', asyncWrapper(async (req, res, next) => {
	// const { authorization } = req.headers;
	// token = authorization;
	try {
		var userList = await getAllUsers();
		//throw new Error('Async 사용자 정의 에러 발생');
		res.send({
			result: JSON.stringify(userList)
		});
		//res.json();
	} catch (error) {
		next(error);
	}
}));



app.post('/api/getPendingUserList', asyncWrapper(async (req, res, next) => {
	try {
		var userList = await getAllPendingUsers();
		//throw new Error('Async 사용자 정의 에러 발생');
		console.log(userList);
		res.send({
			result: JSON.stringify(userList)
		});
		//res.json();
	} catch (error) {
		next(error);
	}
}));

app.post('/api/createUser', asyncWrapper(async (req, res, next) => {
	var user =  {
		email : req.body.email,
		type : 2
	}

	try {
		// res.send({
			// result: "hereasdf"
		// });

		var result = await createUser(user);
		console.log("created");
		//throw new Error('Async 사용자 정의 에러 발생');
		res.send({
			result: JSON.stringify(result)
		});
		//res.json();
	} catch (error) {
		next(error);
	}
}));

app.post('/api/updateUser', asyncWrapper(async (req, res, next) => {
	var user =  {
		userId : req.body.userId,
		type: req.body.type
	}

	try {

		var result = await updateUser(user);
		console.log("updated user");
		//throw new Error('Async 사용자 정의 에러 발생');
		res.send({
			result: JSON.stringify(result)
		});
		//res.json();
	} catch (error) {
		next(error);
	}
}));

app.post('/api/deleteUser', asyncWrapper(async (req, res, next) => {
	var user =  {
		userId : req.body.userId,
	}
	try {
		var result = await deleteUser(user);
		console.log("deleted user");
		//throw new Error('Async 사용자 정의 에러 발생');
		res.send({
			result: JSON.stringify(result)
		});
		//res.json();
	} catch (error) {
		next(error);
	}
}));

/*
app.post('/api/createUser', function (req, res) {

    var user = {
        email: req.body.email,
        type: 2
    };

    Zoom.user.create(user, function (zoom_res) {

        res.send({
            result: zoom_res
        });
    });
});


app.post('/api/updateUser', function (req, res) {

    var user = {
        id: req.body.userId,
        type: req.body.type
    };

    Zoom.user.update(user, function (zoom_res) {

        res.send({
            result: zoom_res
        });
    });
});
*/




function getUserTokenFunc() {
	var options;

	options = {
		//You can use a different uri if you're making an API call to a different Zoom endpoint.
		uri: `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${config.ZOOM_ACCOUNT_ID}`,
		method: 'POST',
		body: {
		},
		headers: {
			Authorization: `Basic ${Buffer.from(`${config.ZOOM_CLIENT_ID}:${config.ZOOM_CLIENT_SECRET}`).toString('base64')}`
		},
		json: true //Parse the JSON string in the response
	};
	
	return new Promise(function (resolve, reject) {
		request(options, function (err, res, body) {
			if (!err) {
				resolve(body);
			} else {
				console.log(body);
				reject(body);
			}
		});
	});
}


// 백은지 추가 getUserToken
app.post('/api/getUserToken', asyncWrapper(async(req, res) => {
	try {
		// const reponse = await axios.post(
		// 	"https://zoom.us/oauth/token",
		// 	querystring.stringify({ grant_type: 'account_credentials', account_id: config.ZOOM_ACCOUNT_ID}),
		// 	{
		// 		headers: {
		// 			Authorization: `Basic ${Buffer.from(`${config.ZOOM_CLIENT_ID}:${config.ZOOM_CLIENT_SECRET}`).toString('base64')}`
		// 		},
		// 	},
		// );
		const reponse = await getUserTokenFunc();
		token = reponse.access_token;
		res.send(reponse.access_token);
	} catch(error) {
		console.log(error);
		return res.sendStatus(400).send({message: "sth wrong"})
	}
}));



app.listen(port, () => {
	console.log(`Example app listening on port ${port}!`)
});