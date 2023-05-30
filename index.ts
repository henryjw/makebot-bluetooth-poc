import noble, { Peripheral } from "@abandonware/noble";

(async () => {
    try {
        console.log('Scanning for MakeBlock devices...');
        await noble.startScanningAsync(undefined, false);
    } catch(err) {
        console.error("Error starting scan", err);
        process.exit(1);
    }

    noble.on("discover", async (device) => {
        const minimalDevice = toMinimalDevice(device);

        const deviceName = minimalDevice.name;


        if (!deviceName) {
            return;
        }

        const isMakeBlockDevice = deviceName.toLowerCase().startsWith("makeblock");

        if (!isMakeBlockDevice) {
            console.log("Found non-MakeBlock device", deviceName);
            return;
        }

        await noble.stopScanningAsync();
        console.log("Found MakeBlock device", deviceName);
        console.log("Connecting to MakeBlock device...");
        await device.connectAsync();
        console.log("Connected to MakeBlock device");

        await wait(10_000);

        console.log("Exiting...");
        await device.disconnectAsync();

        process.exit(0);
    });
})();

function prettyPrint(object: any): void {
    console.log(JSON.stringify(object, null, 2))
}

/**
 * Get the battery level of a device. Returns null if unable to get the battery level.
 * @param device
 */
async function getDeviceBatteryLevel(device: Peripheral): Promise<number | null> {
    if (!device.connectable) {
        console.log("Device is not connectable");
        return null;
    }

    const minimalDevice = toMinimalDevice(device);

    console.debug(`Connecting to device "${minimalDevice.name}" ...`)

    console.debug(`Connected to device "${minimalDevice.name}"`)

    const {characteristics, services} = await device.discoverAllServicesAndCharacteristicsAsync();

    await device.disconnectAsync();

    const batteryLevelCharacteristic = characteristics.find((characteristic: any) => characteristic.uuid.toUpperCase() === '2A19');
    const batteryLevel: Buffer | null = await batteryLevelCharacteristic?.readAsync() ?? null;
    return batteryLevel?.readUInt8(0) ?? null;
}

function toMinimalDevice(device: Peripheral) {
    return {
        name: device.advertisement.localName,
        connectable: device.connectable,
        state: device.state,
    };
}

async function wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
