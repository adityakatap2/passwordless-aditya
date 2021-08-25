const mongoose = require("mongoose")
const Schema = mongoose.Schema;



const UserSchema = new Schema({
  
   username : {type:String,required:true},
   email:{type:String,required:false},
   dob:{type:String,required:false},
   fullName:{type:String,required:false},
   registered:  {type:Boolean,"default":false},
   appId: {type:String,required:true},
   orgId : {type:String,required:true},
   suspended : {type:Boolean,"default":false},
   userId : {type:String,required:true},
   
   devices: { type : Array , "default" : [] }  
},{
   timestamps:true
});
const appSchema = new Schema({

   orgId:{type:String,required:true},
  appId : {type:String,required:true},
  name: {type:String,required:true},
  rpID : {type:String,required:true},
  origin : {type:String,required:true},
  apkHashKey:{type:String,default:""}
},{
   timestamps : true
});

const orgSchema = new Schema({

   username : {type:String,required:true},
   uniqueId : {type:String,required:true},
   devices: { type : Array , "default" : [] } ,
   registered:{type:Boolean,"default":false} 

},{
   timestamps:true
});

const AuditSchema = new Schema({
  
  username : {type:String,required:true},
  appId: 
  {
    type: Schema.Types.ObjectID,
    ref: "Organization",
    required:true
  },
  Data:{type:Array,default: []},

 },{
    timestamps : true
 });

const Users = mongoose.model("Users",UserSchema);
const Application = mongoose.model("Applications",appSchema);
const Organization = mongoose.model("Organizations",orgSchema);
const Audit = mongoose.model("Audits",AuditSchema);
module.exports = {
   Users,
   Application,
   Audit,
   Organization
}

