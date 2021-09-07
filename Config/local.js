
var config = {};
config.mongoURI =  "mongodb+srv://fido2auth:nitesh12@cluster0.p3ddb.mongodb.net/fido2auth?retryWrites=true&w=majority"
//config.mongoURI = "mongodb://user2:asdf1209!%40)(@demo.valydate4u.com:2482/fido2auth?retryWrites=true&w=majority"
config.origin = "https://demov1.rif4u.com::3115"
config.httpPort = "3005" 
config.hostname = "demov1.rif4u.com"
config.httpsPort = "3115"
config.secret="fido2authentication_service_token"
config.rpName = "BlueBricks"

module.exports = config;
