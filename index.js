const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require("@whiskeysockets/baileys")

async function start() {
    const { state, saveCreds } = await useMultiFileAuthState("auth")
    const { version } = await fetchLatestBaileysVersion()

    const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false,
        browser: ["Chrome", "Ubuntu", "20.0.0"]
    })

    sock.ev.on("creds.update", saveCreds)

    sock.ev.on("connection.update", (update) => {
        const { connection, qr } = update

        if (qr) {
            console.log("📱 SCAN QR CODE:")
            console.log(qr)
        }

        if (connection === "open") {
            console.log("✅ BOT VERBUNDEN")
        }

        if (connection === "close") {
            console.log("❌ Verbindung getrennt")
        }
    })

    sock.ev.on("messages.upsert", async ({ messages }) => {
        const msg = messages[0]
        if (!msg.message) return

        const jid = msg.key.remoteJid
        const text =
            msg.message.conversation ||
            msg.message.extendedTextMessage?.text

        if (!text) return

        // 😂 joke
        if (text === ".joke") {
            await sock.sendMessage(jid, { text: "😂 Warum können Geister nicht lügen? Weil man durch sie durch sieht!" })
        }

        // 🎮 rps
        if (text === ".rps") {
            const arr = ["Stein 🪨", "Papier 📄", "Schere ✂️"]
            const pick = arr[Math.floor(Math.random() * arr.length)]
            await sock.sendMessage(jid, { text: "🎮 Ich wähle: " + pick })
        }

        // 🎲 dice
        if (text === ".dice") {
            const roll = Math.floor(Math.random() * 6) + 1
            await sock.sendMessage(jid, { text: "🎲 Ergebnis: " + roll })
        }
    })
}

start()
