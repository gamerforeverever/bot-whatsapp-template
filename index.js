const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require("@whiskeysockets/baileys")

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("auth")
    const { version } = await fetchLatestBaileysVersion()

    const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: true
    })

    sock.ev.on("creds.update", saveCreds)

    sock.ev.on("connection.update", (update) => {
        const { connection } = update
        if (connection === "open") {
            console.log("✅ Bot verbunden!")
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
                "😂 Warum können Geister so schlecht lügen? Weil man durch sie hindurchsieht!",
                "😂 Ich habe eine Kartoffel gefragt, was sie macht: sie hat nichts gesagt.",
                "😂 Warum hat der Mathebuch geweint? Zu viele Probleme!"
            ]
            const pick = jokes[Math.floor(Math.random() * jokes.length)]
            await sock.sendMessage(jid, { text: pick })
        }

        // 🎮 RPS
        if (cmd === ".rps") {
            const choices = ["Stein 🪨", "Papier 📄", "Schere ✂️"]
            const pick = choices[Math.floor(Math.random() * choices.length)]
            await sock.sendMessage(jid, { text: "🎮 Ich wähle: " + pick })
        }

        // 🎲 DICE
        if (cmd === ".dice") {
            const roll = Math.floor(Math.random() * 6) + 1
            await sock.sendMessage(jid, { text: "🎲 Du hast gewürfelt: " + roll })
        }

        // 🤖 SIMPLE AI (ohne API)
        if (cmd.startsWith(".ai ")) {
            const input = text.slice(4)
            await sock.sendMessage(jid, {
                text: "🤖 Ich denke darüber nach: " + input + "\n\n(Upgrade möglich mit echter AI API)"
            })
        }

        // 👋 HELP
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

startBot()
