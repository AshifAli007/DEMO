const jwt = require('jsonwebtoken');

module.exports = function checkToken(req, res, next) {
	var token = req.headers['token'];
	console.log("New token " + token); 
	if(req.originalUrl.includes('/login')||req.originalUrl.includes('/socket/deviceRemotePanel')){
		console.log("no token passed");
		next();
	}
	else{
		if(token) {
			jwt.verify(token, 'my_secret_key',(err,decode)=>{
				console.log("JWT err: " + err);
				console.log("JWT decode: " + JSON.stringify(decode));
				if(err) {
					res.json({"status":500,
						"message":"INVALID TOKEN",
						"error":err.message
					});
				} else {
					req.payLoad = decode;
					next();
				}
			});
		} else {
			res.json({"success":false,
		  "status":500,
				"data":"NO TOKEN PROVIDED",
				"error":"token must be provide in header for endpoint access"
			});
		}
	}
};