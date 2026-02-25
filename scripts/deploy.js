import FtpDeploy from "ftp-deploy";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ftpDeploy = new FtpDeploy();

const config = {
    user: process.env.FTP_USER,
    password: process.env.FTP_PASSWORD,
    host: process.env.FTP_HOST,
    port: parseInt(process.env.FTP_PORT || "21"),
    localRoot: path.join(__dirname, "../dist"),
    remoteRoot: process.env.FTP_REMOTE_PATH || "/",
    include: ["*", "**/*"],
    exclude: [],
    deleteRemote: false,
    forcePasv: true,
    sftp: false
};

console.log("🚀 Starting deployment to FTP...");
console.log(`📡 Host: ${config.host}`);
console.log(`📂 Remote Path: ${config.remoteRoot}`);

ftpDeploy
    .deploy(config)
    .then((res) => console.log("✅ Deployment finished!"))
    .catch((err) => {
        console.error("❌ Deployment error:", err.message);
        process.exit(1);
    });

ftpDeploy.on("uploading", (data) => {
    console.log(`⬆️ Uploading: [${data.transferredFileCount}/${data.totalFilesCount}] ${data.filename}`);
});

ftpDeploy.on("uploaded", (data) => {
    // console.log("Uploaded file: ", data.filename);
});

ftpDeploy.on("log", (data) => {
    // console.log(data);
});

ftpDeploy.on("upload-error", (data) => {
    console.error(`⚠️ Error uploading ${data.filename}:`, data.err.message);
});
