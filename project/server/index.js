import express from "express";
import cors from "cors";
import marketsRoute from "./routes/markets.js";
import routeRoute from "./routes/route.js";

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.use("/api/markets", marketsRoute);
app.use("/api/route", routeRoute);

app.get("/", (req, res) => res.send("EcoMarket API running"));

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});