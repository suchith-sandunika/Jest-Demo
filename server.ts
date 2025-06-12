import app from "./app";
import dotenv from "dotenv";
import colors from "colors";
import { prisma } from "./src/db/db";

dotenv.config();

const port = process.env.PORT || 5000;

prisma.$connect()
    .then(() => {
        console.log(colors.blue.bold("🔥 Database connected successfully ☄️"));
    })
    .catch((error) => {
        console.error(colors.red.bold("❌ Database connection failed 🛑"), error);
        process.exit(1);
    }
);

app.listen(port, () => {
    console.log(colors.yellow.bold('✅  ' + 'Server is running on ' + `http://localhost:${port}` + ' ⭕' ));
});