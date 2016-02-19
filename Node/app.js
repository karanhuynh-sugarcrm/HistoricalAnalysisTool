var express = require("express");
var exphbs = require("express-handlebars");
var bodyParser = require('body-parser');
var app = express();

var hbs = exphbs.create({
	defaultLayout: 'main',
	helpers: {
		'getStatusColour' : function(status) {
	      switch(status) {
		        case 'PASSED' : {
		          return '#CCFFDD';
		        }
		        break;
		        case 'FAILED' : {
		          return '#FF9999';
		        }
		        break;
		        case 'BROKEN' : {
		          return '#FF9999';
		        }
		        break;
		        case 'PENDING' : {
		          return '#CCEEFF'
		        }
		        break;
		        default : {
		          return '#E4E3E8'
		        }
	      }
		},
		'getLink' : function(test) {
			return "<a href='" + test.link +  "'>" + test.status + "</a>";
		}
	}
});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
// Set up the body parser
app.use(bodyParser.urlencoded({ extended: false })); 
app.use(require('./controllers'));


    			/*
      switch(status) {
        case 'PASSED' : {
          return '#66cc33';
        }
        break;
        case 'FAILED' : {
          return '#cc3300';
        }
        break;
        case 'BROKEN' : {
          return '#cc3300';
        }
        break;
        case 'PENDING' : {
          return '#0099ff'
        }
        break;
        default : {
          return '#dee3f2'
        }
      } */
    
    



app.listen(3000);