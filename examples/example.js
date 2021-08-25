const { CrimsonSDK, CMSNDeviceListener } = require('../src/cmsn_sdk');
const { CONNECTIVITY, CONTACT_STATE, ORIENTATION, CMSNLogLevel } = require('../src/cmsn_common');
const utils = require('../src/cmsn_utils');
const debug = require('debug');
const log = debug('example');
const logV = log.extend('verbose');
const logI = log.extend('info');

/// NOTE: example target device name & count
const TARGET_DEVICE_NAME_ARRAY = ["cmsn_OK"];
const TARGET_DEVICE_COUNT = 1;

const RUNNING_DURATION_MS = 100 * (60 * 1000); // Running the app for 100 minute
sleep(RUNNING_DURATION_MS);

const exampleListener = new CMSNDeviceListener({
    onError: error => { //CMSNError
        logI('[ERROR]', error.message);
    },
    onConnectivityChanged: (device, connectivity) => { //Connectivity
        logI({ message: `[${device.name}] Connectivity changed to: ${CONNECTIVITY(connectivity)}` });
        if (connectivity == CONNECTIVITY.enum('connected')) {
            device.pair((success, error) => {
                if (success) {
                    device.startDataStream();
                } else {
                    device.logError(error);
                }
            });
        }
    },
    onDeviceInfoReady: (device, deviceInfo) => { //deviceInfo
        logI(device.name, `Device info is ready:`, deviceInfo);
    },
    onContactStateChanged: (device, contactState) => { //ContactState
        logI(device.name, `Contact state changed to:`, CONTACT_STATE(contactState));
    },
    onOrientationChanged: (device, orientation) => { //Orientation
        logI(device.name, `Orientation changed to:`, ORIENTATION(orientation));
    },
    onIMUData: (device, imu) => { //IMUData
        logV(device.name, `IMU data received:`, imu);
    },
    onEEGData: (device, eeg) => { //EEGData
        logV(device.name, "EEG data received:", eeg);
    },
    onBrainWave: (device, stats) => { //BrainWave
        logV(device.name, "BrainWave data received:", stats);
    },
    onAttention: (device, attention) => { //Float
        logI(device.name, `Attention:`, attention);
    },
    onMeditation: (device, meditation) => { //Float
        logI(device.name, `Meditation:`, meditation);
    },
});

let cmsnSDK;

(async function main() {
    debug.enable('example:info');
    logI('------------- Example Main -------------');
    const useDongle = false;
    const logLevel = CMSNLogLevel.enum('info'); //info/error/warn
    cmsnSDK = await CrimsonSDK.init(useDongle, logLevel);

    cmsnSDK.on('error', e => logI(e));
    cmsnSDK.on('onAdapterAvailable', async () => await startScan());
    if (cmsnSDK.adapter.available) await startScan();
})();

async function startScan() {
    const targetDevices = new Map(); // (uuid: string, device)
    /// NOTE: user prompt, switch to pairing mode when connect crimson first time
    logI("Scanning for BLE devices");
    cmsnSDK.startScan(async device => {
        logI('found device', device.name);
        if (utils.array_contains(TARGET_DEVICE_NAME_ARRAY, device.name)) {
            targetDevices.set(device.id, device);
            logI(`targetDevices.size=${targetDevices.size}`);
        }

        if (targetDevices.size >= TARGET_DEVICE_COUNT) {
            await cmsnSDK.stopScan();
            await utils.sleep(500);
        
            for (let device of targetDevices.values()) {
                device.listener = exampleListener;
                await device.connect();
                // data stream listen, default return attention only
                // attention, meditation, socialEngagement
                // device.setDataSubscription(true, false, false);
            }
        }
    });
}

process.on('SIGINT', async () => {
    logI({ message: `SIGINT signal received.` });
    await CrimsonSDK.dispose();
    logI('End program');
    process.exit(0);
});

async function sleep(ms) {
    await (new Promise(resolve => setTimeout(() => {
        logI('Time out');
        resolve();
    }, ms)));
}