import express from "express";
import cors from "cors";
import { products, categories, testimonials } from "./data.js";
import { sendWhatsAppOrder } from "../functions/lib/whatsapp-order.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/products", (req, res) => {
  res.json(products);
});

app.get("/api/products/:id", (req, res) => {
  const product = products.find((p) => p.id === req.params.id);
  if (!product) return res.status(404).json({ message: "Not found" });
  res.json(product);
});

app.get("/api/categories", (req, res) => {
  res.json(categories);
});

app.get("/api/testimonials", (req, res) => {
  res.json(testimonials);
});

app.post("/api/checkout", async (req, res) => {
  const result = await sendWhatsAppOrder(req.body, process.env);
  res.status(result.status).json(result.body);
});

app.get("/", (req, res) => {
  res.send("GreenCart backend is running.");
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Backend API listening on http://localhost:${port}`);
});
