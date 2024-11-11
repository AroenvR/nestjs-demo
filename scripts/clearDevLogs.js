(() => {
    console.log("Clearing all development logs with the prefix:");

    const fs = require("fs");
    const path = require("path");

    const dir = path.join(__dirname, "..", "logs");
    const exists = fs.existsSync(dir);

    if (exists) {
        fs.readdir(dir, (err, files) => {
            if (err) {
                console.error(err);
                return;
            }

            let filePrefix = "No prefix was found.";

            const configDir = path.join(__dirname, "..", "config", "development");
            const configDirExists = fs.existsSync(configDir);
            if (configDirExists) {
                const configFile = path.join(configDir, "log_config.json");
                const configFileExists = fs.existsSync(configFile);

                if (configFileExists) {
                    const config = fs.readFileSync(configFile, "utf8");
                    const json = JSON.parse(config);
                    filePrefix = json.appName;
                }
            }

            console.log(filePrefix);

            files.forEach((file) => {
                // Check if the file name starts with "NEST"
                if (file.startsWith(filePrefix)) {
                    const filePath = path.join(dir, file);

                    // Delete the file
                    fs.unlink(filePath, (err) => {
                        if (err) {
                            console.error(`Error deleting file ${file}:`, err);
                        } else {
                            console.log(`Deleted file: ${file}`);
                        }
                    });
                }
            });
        });
    }
})();