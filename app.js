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
			if (test.status == "NONE") {
				return test.status;
			}
			return "<a href='" + test.link +  "'>" + test.status + "</a>";
		},
	}
});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.use('/static', express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false })); 
app.use(require('./controllers'));

app.listen(3000);