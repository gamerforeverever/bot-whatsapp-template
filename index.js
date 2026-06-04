console.log("BOT STARTET...")

const {
    default: makeWASocket,
    useMultiFileAuthState,
    fetchLatestBaileysVersion
} = require("@whiskeysockets/baileys")

async function start() {
    const { state, saveCreds } = await useMultiFileAuthState("auth")
    const { version } = await fetchLatestBaileysVersion()

    const sock = makeWASocket({
        version,
        auth: state,
        browser: ["Railway", "Chrome", "1.0.0"]
    })

    sock.ev.on("creds.update", saveCreds)

    const phoneNumber = "491515684981"
    let codeRequested = false

    sock.ev.on("connection.update", async (update) => {
        const { connection } = update

        if (
            connection === "connecting" &&
            !sock.authState.creds.registered &&
            !codeRequested
        ) {
            codeRequested = true

            try {
                const code = await sock.requestPairingCode(phoneNumber)

                console.log("")
                console.log("====================")
                console.log("PAIRING CODE:")
                console.log(code)
                console.log("====================")
                console.log("")
            } catch (err) {
                console.log("Pairing Fehler:", err)
            }
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

        if (cmd === ".joke") {
            const jokes = [
                "😂 Warum können Geister nicht lügen?",
                "😂 Ich bin nur ein Bot 😄",
                "😂 Mathe ist auch nur Zahlen mit Stress"
            ]

            const pick = jokes[Math.floor(Math.random() * jokes.length)]

            await sock.sendMessage(jid, {
                text: pick
            })
        }

        if (cmd === ".rps") {
            const arr = ["Stein 🪨", "Papier 📄", "Schere ✂️"]

            const pick = arr[Math.floor(Math.random() * arr.length)]

            await sock.sendMessage(jid, {
                text: "🎮 Ich wähle: " + pick
            })
        }

        if (cmd === ".dice") {
            const roll = Math.floor(Math.random() * 6) + 1

            await sock.sendMessage(jid, {
                text: "🎲 Ergebnis: " + roll
            })
        }

        if (cmd.startsWith(".ai ")) {
            const input = text.slice(4)

            await sock.sendMessage(jid, {
                text: "🤖 Ich denke über nach: " + input
            })
        }

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
