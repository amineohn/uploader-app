import sqlite3 from "sqlite3";
class Config {
  public readonly port: number = 3000;
  public readonly database = {
    client: "sqlite3",
    connection: {
      filename: "./db.sqlite",
    },
    useNullAsDefault: true,
  };
  public readonly db = new sqlite3.Database(this.database.connection.filename);
  public readonly uploadDir: string = "uploads";
  public readonly uploadMaxSize: number = 5242880;
  public readonly env = process.env;
  constructor() {
    this.port = Number(this.env.PORT) || this.port;
    this.database.connection.filename =
      this.env.DB_FILENAME || this.database.connection.filename;
    this.uploadDir = this.env.UPLOAD_DIR || this.uploadDir;
    this.db = new sqlite3.Database(this.database.connection.filename);
    this.uploadMaxSize = Number(this.env.UPLOAD_MAX_SIZE) || this.uploadMaxSize;
  }

  public get isDev(): boolean {
    return process.env.NODE_ENV === "development";
  }

  public get isProd(): boolean {
    return process.env.NODE_ENV === "production";
  }
}

export default Config;
