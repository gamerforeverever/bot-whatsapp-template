const {
    default: makeWASocket,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    DisconnectReason
} = require("@whiskeysockets/baileys")

async function start() {
    const { state, saveCreds } = await useMultiFileAuthState("auth")
    const { version } = await fetchLatestBaileysVersion()

    const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false,
        browser: ["Chrome", "Windows", "10"]
    })

    sock.ev.on("creds.update", saveCreds)

    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update

        // 📲 Pairing Code (falls unterstützt)
        if (update.pairingCode) {
            console.log("\n🔑 LOGIN CODE:")
            console.log(update.pairingCode)
            console.log("\n👉 WhatsApp → Verknüpfte Geräte → Mit Nummer verbinden")
        }

        if (connection === "open") {
            console.log("✅ BOT VERBUNDEN")
        }

        if (connection === "close") {
            const reason = lastDisconnect?.error?.output?.statusCode
            console.log("❌ Verbindung getrennt:", reason)
        }
    })

    // 💬 COMMAND SYSTEM
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
                "😂 Mathe ist Stress mit Zahlen"
            ]
            await sock.sendMessage(jid, {
                text: jokes[Math.floor(Math.random() * jokes.length)]
            })
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

        // 🤖 AI FAKE
        if (cmd.startsWith(".ai ")) {
            const input = text.slice(4)
            await sock.sendMessage(jid, {
                text: "🤖 Ich denke über: " + input
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

                process.on("uncaughtException", (err) => {
  console.log("❌ Crash:", err);
});

process.on("unhandledRejection", (err) => {
  console.log("❌ Promise Error:", err);
});
            })
        }
    })
}

start()
