var shellInterval = require("shell-interval");
shellInterval({
    options: {
        command: "zip -r Archive.zip index.js flashcard.js node_modules && mv Archive.zip /Users/admin/Desktop/Archive.zip",
        time: 15,
        reps: 0,
    },
    onExec: function (err, stdout, stderr) {
        if (err) throw err;
        console.log(stdout);
    },
    onFinish: function () {
        console.log("The shell command was called five times. Exiting...");
    },

});
