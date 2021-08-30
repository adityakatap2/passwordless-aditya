
var config = {};
config.mongoURI =  "mongodb+srv://fido2auth:nitesh12@cluster0.p3ddb.mongodb.net/fido2auth?retryWrites=true&w=majority"
config.origin = "http://localhost:3005"
config.httpPort = "80" 
config.hostname = "demov1.rif4u.com"
config.httpsPort = "4443"
config.secret="fido2authentication_service_token"
config.rpName = "BlueBricks"

module.exports = config;
