const express = require('express');
const fs = require('fs');
const { exec } = require("child_process");
const pino = require("pino");
const {
    default: makeWASocket,
    useMultiFileAuthState,
    delay,
    makeCacheableSignalKeyStore,
    Browsers,
    jidNormalizedUser
} = require("@whiskeysockets/baileys");
const { upload } = require('./mega');

const router = express.Router();

function removeFile(filePath) {
    if (fs.existsSync(filePath)) {
        fs.rmSync(filePath, { recursive: true, force: true });
    }
}

async function restartService() {
    console.log("Restarting service...");
    exec('node index.js'); // Adjust this based on your server start script
}

router.get('/', async (req, res) => {
    const num = req.query.number?.replace(/[^0-9]/g, '');

    async function PrabathPair() {
        const { state, saveCreds } = await useMultiFileAuthState(`./session`);
        try {
            const PrabathPairWeb = makeWASocket({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
                },
                printQRInTerminal: false,
                logger: pino({ level: "fatal" }).child({ level: "fatal" }),
                browser: Browsers.macOS("Safari"),
            });

            if (!PrabathPairWeb.authState.creds.registered && num) {
                const code = await PrabathPairWeb.requestPairingCode(num);
                if (!res.headersSent) {
                    res.send({ code });
                }
            }

            let timeout = setTimeout(() => {
                console.log("Pairing not completed within 5 minutes. Restarting...");
                restartService();
            }, 300000); // 5 minutes timeout

            PrabathPairWeb.ev.on('creds.update', saveCreds);
            PrabathPairWeb.ev.on("connection.update", async (s) => {
                const { connection, lastDisconnect } = s;

                if (connection === "open") {
                    clearTimeout(timeout);
                    try {
                        await delay(10000);
                        const authPath = './session/';
                        const userJid = jidNormalizedUser(PrabathPairWeb.user.id);

                        function randomMegaId(length = 6, numberLength = 4) {
                            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                            let result = '';
                            for (let i = 0; i < length; i++) {
                                result += characters.charAt(Math.floor(Math.random() * characters.length));
                            }
                            const number = Math.floor(Math.random() * Math.pow(10, numberLength));
                            return `${result}${number}`;
                        }

                        const megaUrl = await upload(fs.createReadStream(authPath + 'creds.json'), `${randomMegaId()}.json`);
                        const stringSession = megaUrl.replace('https://mega.nz/file/', '');

                        await PrabathPairWeb.sendMessage(userJid, {
                            text: `ELIXAMD❤️${stringSession}`
                        });

                    } catch (e) {
                        console.error("Error during connection.open:", e);
                        restartService();
                    }

                    removeFile('./session');
                    process.exit(0);
                } else if (connection === "close" && lastDisconnect?.error?.output?.statusCode !== 401) {
                    console.log("Reconnecting...");
                    PrabathPair();
                }
            });
        } catch (err) {
            console.error("Error during pairing:", err);
            restartService();
            if (!res.headersSent) {
                res.send({ code: "Service Unavailable" });
            }
            removeFile('./session');
        }
    }

    PrabathPair();
});

process.on('uncaughtException', (err) => {
    console.error('Caught exception:', err);
    restartService();
});

module.exports = router;
