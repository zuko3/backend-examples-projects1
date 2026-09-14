const fs = require('fs');

fs.exists(process.argv[2], function (exists) {
    if (exists) {
        fs.unlink(process.argv[2], function (err) {
            if (null !== err) {
                console.log("Error:", err);
                return;
            }
            console.log(process.argv[2], 'file deleted')
        });
    }
});
