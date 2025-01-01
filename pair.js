const express = require('express');
const fs = require('fs');
const { exec } = require("child_process");
let router = express.Router();
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

function removeFile(FilePath) {
    if (!fs.existsSync(FilePath)) return false;
    fs.rmSync(FilePath, { recursive: true, force: true });
}

router.get('/', async (req, res) => {
    let num = req.query.number;
    async function NethinduPair() {
        const { state, saveCreds } = await useMultiFileAuthState(`./session`);
        try {
            if (fs.existsSync('./season')) fs.unlinkSync('./season');

            let NethinduPairWeb = makeWASocket({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
                },
                printQRInTerminal: false,
                logger: pino({ level: "fatal" }).child({ level: "fatal" }),
                browser: Browsers.macOS("Safari"),
            });

            if (!NethinduPairWeb.authState.creds.registered) {
                await delay(1500);
                num = num.replace(/[^0-9]/g, '');
                const code = await NethinduPairWeb.requestPairingCode(num);
                if (!res.headersSent) {
                    await res.send({ code });
                }
            }

            NethinduPairWeb.ev.on('creds.update', saveCreds);
            NethinduPairWeb.ev.on("connection.update", async (s) => {
                const { connection, lastDisconnect } = s;
                if (connection === "open") {
                    try {
                        await delay(10000);
                        const auth_path = './session/';
                        const user_jid = jidNormalizedUser(NethinduPairWeb.user.id);

                        function randomMegaId(length = 6, numberLength = 4) {
                            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                            let result = '';
                            for (let i = 0; i < length; i++) {
                                result += characters.charAt(Math.floor(Math.random() * characters.length));
                            }
                            const number = Math.floor(Math.random() * Math.pow(10, numberLength));
                            return `${result}${number}`;
                        }

                        const mega_url = await upload(fs.createReadStream(auth_path + 'creds.json'), `${randomMegaId()}.json`);
                        const sid = mega_url.replace('https://mega.nz/file/', '');

                        await NethinduPairWeb.sendMessage(user_jid, { 
                            text: `ELIXAMD❤️${sid}` 
                        });

                        await NethinduPairWeb.sendMessage(user_jid, { 
                            text: "Thank you for choosing Elixa! ❤️\n> By BIT X🇱🇰\n> 𝗚𝗲𝟆𝗮𝗿𝗮𝐭𝗲𝙙 𝝗𝞤 𝗘ꟾ𝖎✘𝗮 ‐𝝡𝗗༺\n> By Nethindu Thaminda \n> By Jithula Bashitha" 
                        });

                        removeFile('./session');
                    } catch (e) {
                        console.error("Error during pairing:", e);
                    }
                } else if (connection === "close" && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode !== 401) {
                    await delay(10000);
                    NethinduPair();
                }
            });
        } catch (err) {
            console.error("Error initializing pairing:", err);
            NethinduPair();
            await removeFile('./session');
            if (!res.headersSent) {
                await res.send({ code: "Service Unavailable" });
            }
        }
    }
    return await NethinduPair();
});



process.on('uncaughtException', function (err) {
    console.error("Uncaught exception:", err);
});

module.exports = router;
