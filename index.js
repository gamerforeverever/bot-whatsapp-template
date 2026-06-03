const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require("@whiskeysockets/baileys")
const qrcode = require("qrcode-terminal")

async function start() {
    const { state, saveCreds } = await useMultiFileAuthState("auth")
    const { version } = await fetchLatestBaileysVersion()

    const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false,
        browser: ["Railway", "Chrome", "1.0.0"]
    })

    sock.ev.on("creds.update", saveCreds)

    sock.ev.on("connection.update", (update) => {
        const { connection, qr } = update

        // 📱 QR CODE FIX
        if (qr) {
            console.log("\n======================")
            console.log("📱 SCAN QR CODE")
            console.log("======================\n")

            qrcode.generate(qr, { small: true })
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

        const cmd = text.toLowerCase()

        // 😂 JOKE
        if (cmd === ".joke") {
            const jokes = [
                "😂 Warum können Geister nicht lügen?",
                "😂 Ich bin nur ein Bot 😄",
                "😂 Mathe ist auch nur Zahlen mit Stress"
            ]
            const pick = jokes[Math.floor(Math.random() * jokes.length)]
            await sock.sendMessage(jid, { text: pick })
        }

        // 🎮 RPS
        if (cmd === ".rps") {
            const arr = ["Stein 🪨", "Papier 📄", "Schere ✂️"]
            const pick = arr[Math.floor(Math.random() * arr.length)]
            await sock.sendMessage(jid, { text: "🎮 Ich wähle: " + pick })
        }

        // 🎲 DICE
        if (cmd === ".dice") {
            const roll = Math.floor(Math.random() * 6) + 1
            await sock.sendMessage(jid, { text: "🎲 Ergebnis: " + roll })
        }

        // 🤖 AI (fake simple)
        if (cmd.startsWith(".ai ")) {
            const input = text.slice(4)
            await sock.sendMessage(jid, {
                text: "🤖 Ich denke über nach: " + input
            })
        }

        // 📜 HELP
        if (cmd === ".help") {
            await sock.sendMessage(jid, {
                text:
                    "🤖 BOT COMMANDS:\n\n" +
                    ".joke 😂\n" +
                    ".rps 🎮\n" +
                    ".dice 🎲\n" +
                    ".ai text 🤖\n" +
                    ".help 📜"
            })
        }
    })
}

start()
