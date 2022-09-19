import multer from "multer";
import express, { Express } from "express";
import { Request, Response } from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import { join } from "path";
import {
  createReadStream,
  createWriteStream,
  ReadStream,
  WriteStream,
} from "fs";
import { pipeline } from "stream";
import { promisify } from "util";
import Config from "./config";
import fs from "fs";

const config: Config = new Config();
const pipelineAsync = promisify(pipeline);
const app: Express = express();
const server = createServer(app);
const uploadDir: string = join(__dirname, config.uploadDir);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const upload = multer({
  dest: "./" + config.uploadDir,
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir);
      }

      cb(null, uploadDir);
    },
  }),
  limits: {
    fileSize: config.uploadMaxSize,
  },
});

app.post(
  "/upload",
  upload.single("file"),
  async (req: Request, res: Response) => {
    const { file } = req;
    const { filename, path }: any = file;
    const uuid: string = uuidv4();
    const filePath: string = join(__dirname, config.uploadDir, filename);
    const readStream: ReadStream = createReadStream(path);
    const writeStream: WriteStream = createWriteStream(filePath);
    await pipelineAsync(readStream, writeStream);
    res.send(uuid);
  }
);

app.get("/download/:uuid", async (req: Request, res: Response) => {
  const { uuid } = req.params;
  const filePath: string = join(__dirname, config.uploadDir, uuid);
  const readStream: ReadStream = createReadStream(filePath);
  const writeStream: WriteStream = createWriteStream(filePath);
  await pipelineAsync(readStream, writeStream);
  res.download(filePath);
});

app.get("/read/:uuid", async (req: Request, res: Response) => {
  const { uuid } = req.params;
  const filePath: string = join(__dirname, config.uploadDir, uuid);
  const readStream: ReadStream = createReadStream(filePath);
  const writeStream: WriteStream = createWriteStream(filePath);
  await pipelineAsync(readStream, writeStream);
  res.send(readStream);
});

io.on("connection", (socket: Socket) => {
  console.log("connected");
  socket.on("message", (message: string) => {
    console.log(message);
  });
  socket.on("disconnect", () => {
    console.log("disconnected");
  });
});

server.listen(config.port, () => {
  console.log("listening on *:" + config.port);
});
