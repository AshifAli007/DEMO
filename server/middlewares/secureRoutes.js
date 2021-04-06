const jwt = require('jsonwebtoken');
let models = require('../../models')

module.exports = function checkToken(req, res, next) {
	var token = req.headers['token'];
	console.log("New token " + token); 
	if(token) {
		jwt.verify(token, 'my_secret_key',async (err,decode)=>{
			console.log("JWT decode: " + JSON.stringify(decode));
			if(err) {
				console.log("JWT err: " + err);
				res.json({"status":500,
					"message":"INVALID TOKEN",
					"error":err.message
				});
			} else {
				req.payLoad = decode;
				let isvalidToken = await models.users.findOne({attributes:['id'],where:{id:decode.id,sessionKey:token}});
				if(isvalidToken){
					next();
				}
				else{
					res.json({
						"success":false,
						"status":500,
						"data":"TOKEN EXPIRED LOGIN AGAIN",
						"error":"TOKEN EXPIRED LOGIN AGAIN"
					});	
				}
			}
		});
	} else {
		res.json({"success":false,
		"status":500,
			"data":"NO TOKEN PROVIDED",
			"error":"token must be provide in header for endpoint access"
		});
	}

};