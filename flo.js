var flo = require('fb-flo'),
    fs = require('fs'),

    server = flo('dist/',
            {
                port: 8888,
                host: 'localhost',
                verbose: false,
                glob: ['**/*.js', '**/*.css', '**/*.html']
            },
            function(filepath, callback) {
                callback({
                    contents: fs.readFileSync('dist/' + filepath),
                    reload: true
                });
            });
