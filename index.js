import noble from "@abandonware/noble";

(async () => {
    try {
        await noble.startScanningAsync(undefined, false);
    } catch(err) {
        console.error("Error starting scan", err);
        process.exit(1);
    }

    noble.on("discover", (device) => {
        const minimalDevice = {
            name: device.advertisement.localName,
            connectable: device.connectable,
            state: device.state
        };

        if (!minimalDevice.name) {
            return
        }

        if (minimalDevice.name.toLowerCase().startsWith("makeblock")) {
            console.log("Found MakeBlock device", minimalDevice.name);
        }

        console.log(minimalDevice)
    });
})();


