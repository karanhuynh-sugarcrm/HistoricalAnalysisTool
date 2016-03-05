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
  });

  grunt.registerTask('default', 'jshint');
  grunt.registerTask('test', ['jshint',  'mochaTest']);
};
