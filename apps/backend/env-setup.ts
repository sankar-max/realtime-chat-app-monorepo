import path from "path"
import { config } from "dotenv"

// This file exists solely to load the .env variables before anything else
config({ path: path.resolve(__dirname, "../../.env") })
