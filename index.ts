import noble from "@abandonware/noble";

(async () => {
    try {
        console.log('Scanning for MakeBlock devices...');
        await noble.startScanningAsync(undefined, false);
    } catch(err) {
        console.error("Error starting scan", err);
        process.exit(1);
    }

    noble.on("discover", async (device) => {
        const minimalDevice = {
            name: device.advertisement.localName,
            connectable: device.connectable,
            state: device.state
        };


        if (!minimalDevice.name) {
            return
        }

        const isMakeBlockDevice = minimalDevice.name.toLowerCase().startsWith("makeblock");

        if (!isMakeBlockDevice) {
            console.log("Found non-MakeBlock device", minimalDevice.name);
            return;
        }

        await noble.stopScanningAsync();
        console.log("Found MakeBlock device", minimalDevice.name);
        console.log("Connecting to MakeBlock device...");
        await device.connectAsync();
        console.log("Connected to MakeBlock device");

        // const {characteristics} = await device.discoverSomeServicesAndCharacteristicsAsync(['180f'], ['2a19']);
        // const batteryLevel = (await characteristics[0].readAsync())[0];
        const { characteristics, services } = await device.discoverAllServicesAndCharacteristicsAsync();

        // console.log("Services", prettyPrint(services));
        // console.log(`${device.address} (${device.advertisement.localName}): ${batteryLevel}%`);

        console.log("Sending message to each characteristic...");
        for (const characteristic of characteristics) {
            try {
                await characteristic.writeAsync(Buffer.from('test'), false);
                console.log(`Sent message to characteristic with ID ${characteristic.uuid}`);
            } catch(err) {
                console.error(`Error sending message to characteristic with ID ${characteristic.uuid}`, err);
            }
        }

        console.log("Sent message to all characteristics. Exiting...");
        process.exit(0);
    });
})();

function prettyPrint(object: any): void {
    console.log(JSON.stringify(object, null, 2))
}
