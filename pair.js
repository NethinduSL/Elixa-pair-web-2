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
    async function Nethindupairweb() {
        const { state, saveCreds } = await useMultiFileAuthState(`./session`);
        try {
            let WhatsappE = makeWASocket({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
                },
                printQRInTerminal: false,
                logger: pino({ level: "fatal" }).child({ level: "fatal" }),
                browser: Browsers.macOS("Safari"),
            });

            if (!WhatsappE.authState.creds.registered) {
                await delay(1500);
                num = num.replace(/[^0-9]/g, '');
                const code = await WhatsappE.requestPairingCode(num);
                if (!res.headersSent) {
                    await res.send({ code });
                }
            }

            WhatsappE.ev.on('creds.update', saveCreds);
            WhatsappE.ev.on("connection.update", async (s) => {
                const { connection, lastDisconnect } = s;
                if (connection === "open") {
                    try {
                        await delay(10000);
                        const sessionElixa = fs.readFileSync('./session/creds.json');

                        const auth_path = './session/';
                        const user_jid = jidNormalizedUser(WhatsappE.user.id);

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
                        const string_session = mega_url.replace('https://mega.nz/file/', '');
                        const sid = string_session;

                        // Sending the first message (sid)
                        const dt = await WhatsappE.sendMessage(user_jid, { 
                            text: `ElixaMD❤️${sid}` 
                        });

                        // Sending the second message after sending the 'sid'
                        const additionalMessage = await WhatsappE.sendMessage(user_jid, { 
                            text: 'Thank you foe chosing ElixaMD!' 
                        });

                    } catch (e) {
                        exec('pm2 restart Elixa');
                    }

                    await delay(100);
                    return await removeFile('./session');
                    process.exit(0);
                } else if (connection === "close" && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode !== 401) {
                    await delay(10000);
                    Nethindupairweb();
                }
            });
        } catch (err) {
            exec('pm2 restart Elixa');
            console.log("service restarted");
            Nethindupairweb();
            await removeFile('./session');
            if (!res.headersSent) {
                await res.send({ code: "Service Unavailable" });
            }
        }
    }
    return await Nethindupairweb();
});

process.on('uncaughtException', function (err) {
    console.log('Caught exception: ' + err);
    exec('pm2 restart Elixa');
});

module.exports = router;
                    process.exit(0);
                } else if (connection === "close" && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode !== 401) {
                    await delay(10000);
                    PrabathPair();
                }
            });
        } catch (err) {
            exec('pm2 restart prabath-md');
            console.log("service restarted");
            PrabathPair();
            await removeFile('./session');
            if (!res.headersSent) {
                await res.send({ code: "Service Unavailable" });
            }
        }
    }
    return await PrabathPair();
});

process.on('uncaughtException', function (err) {
    console.log('Caught exception: ' + err);
    exec('pm2 restart Elixa');
});


module.exports = router;
