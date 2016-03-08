module.exports = function(grunt) {

  // Add Grunt Tasks
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-bower-concat');

  grunt.initConfig({
    
    jshint: { // Task: JSHint
    all: ['Gruntfile.js', 'main/**/*.js', 'app.js']
  },


    mochaTest: {
      test: {
        options: {
          reporter: 'spec',
          captureFile: 'results.txt', // Optionally capture the reporter output to a file
          quiet: false, // Optionally suppress output to standard out (defaults to false)
          clearRequireCache: false // Optionally clear the require cache before running tests (defaults to false)
        },
        src: ['test/**/*.js']
      }
    },
  bower_concat: {
    all: {
      dest: 'public/_bower.js',
      cssDest: 'public/_bootstrap.css',
      bowerOptions: {
        relative: false
      },
      mainFiles: {
          bootstrap: ['dist/css/bootstrap.css'],
          tablesorter: ['dist/js/jquery.tablesorter.js', 'dist/js/jquery.tablesorter.widgets.js.'],

        }
    }
  },

  uglify: {
      'public/public.js': ['public/_bower.js', 'public/client.js'],
   }
  });

  grunt.registerTask('default', 'jshint');
  grunt.registerTask('test', ['jshint',  'mochaTest']);
  grunt.registerTask('buildBower', ['bower_concat', 'uglify']);
};