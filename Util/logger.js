const winston = require("winston")

const formatDate = (date) =>{
  return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
     
    })
}

const myformat = winston.format.combine(
 
    winston.format.timestamp(),
    winston.format.align(),
    winston.format.printf(info => `${formatDate(new Date())} ${info.level}: ${info.message}`)
  );
  const logger = winston.createLogger({
   
    format: myformat,
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({ filename: 'error.log', level: 'error' }),
      new winston.transports.File({ filename: 'combined.log' }),
    ],
  });
  
  module.exports = logger;