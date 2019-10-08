// Require grunt and it's dependencies listed in package.json
// > run "npm install" in the game root folder

// Use this file to validate all js and json, 
//   bundle and minify the game js and css, 
//   and create the game electron executables
// > run "grunt" in the game root folder

module.exports = function(grunt) {
  grunt.initConfig({
    'pkg': grunt.file.readJSON('package.json'),
    'jshint': {
      options: {
        esversion: 6,
        reporterOutput: "",
        laxcomma: true
      },
      all: [
        'package.json',
        'Gruntfile.js',
        'server.js',
        'client/json/**/*.json',
        'client/js/**/*.js'
      ]
    },
    'cssmin': { 
      target: {
        files: [{
          expand: true,
          cwd: 'client/css',
          src: ['*.css'],
          dest: 'client/bundle/css',
          ext: '.min.css'
        }]
      }
    },
    'uglify': {
      options: {
        banner: '// <%= pkg.name %> grunt <%= grunt.template.today("yyyy-mm-dd h:MM:ss TT") %> */\n'
      },
      target: {
        files: [{
          src: 'client/js/game.js',
          dest: 'client/bundle/js/game.min.js',
        },{
          src: 'client/js/*/*.js',
          dest: 'client/bundle/js/after.min.js'
        }]
      }
    },
    'concat': {
      css: {
        src: [
          'client/browser_modules/**/*.min.css',
          'client/bundle/css/*.min.css'
        ],
        dest: 'client/bundle/game.min.css'
      },
      js: {
        src: [
          'client/browser_modules/**/*.min.js',
          'client/bundle/js/game.min.js',
          'client/bundle/js/after.min.js'
        ],
        dest: 'client/bundle/game.min.js'
      }
    },
    'clean':  [
      'client/bundle/js',
      'client/bundle/css'
    ],
    'electron': {
      winBuild: {
        options: {
          asar: true,
          overwrite: true,
          dir: 'client',
          out: 'downloads/windows',
          electronVersion: '3.0.10',
          platform: 'win32',
          arch: 'ia32'
        }
      },
      macosBuild: {
        options: {
          asar: true,
          overwrite: true,
          dir: 'client',
          out: 'downloads/mac',
          electronVersion: '3.0.10',
          platform: 'darwin',
          arch: 'x64'
        }
      },
      linuxBuild: {
        options: {
          asar: true,
          overwrite: true,
          dir: 'client',
          out: 'downloads/linux',
          electronVersion: '3.0.10',
          platform: 'linux',
          arch: 'ia32'
        }
      }
    }
  });
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-electron');
  grunt.registerTask('default', ['jshint', 'cssmin', 'uglify', 'concat', 'clean', 'electron']);
};
