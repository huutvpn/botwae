import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason
} from "@whiskeysockets/baileys";
import qrcode from "qrcode-terminal";
import { Boom } from "@hapi/boom";

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("./session");

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    browser: ["BOTWAE", "Chrome", "1.0"]
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      qrcode.generate(qr, { small: true });
      console.log("📱 Scan QR WhatsApp");
    }

    if (connection === "close") {
      const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
      if (reason !== DisconnectReason.loggedOut) {
        startBot();
      } else {
        console.log("❌ Logout, hapus folder session");
      }
    }

    if (connection === "open") {
      console.log("✅ BOTWAE ONLINE 24 JAM");
    }
  });

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const from = msg.key.remoteJid;
    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      "";

    if (text === "menu") {
      await sock.sendMessage(from, {
        text: `🤖 *BOTWAE*
━━━━━━━━━━━━
• menu
• halo
• info
• owner
━━━━━━━━━━━━`
      });
    } 
    else if (text === "halo") {
      await sock.sendMessage(from, { text: "Halo 👋 Selamat datang di BOTWAE" });
    } 
    else if (text === "info") {
      await sock.sendMessage(from, {
        text: "Bot WhatsApp Termux\nOnline 24 Jam\nPowered by huutvpn 🚀"
      });
    }
    else if (text === "owner") {
      await sock.sendMessage(from, {
        text: "👑 Owner: huutvpn\n📦 Repo: botwae"
      });
    }
  });
}

startBot();