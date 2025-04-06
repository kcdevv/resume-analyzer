import express from "express";
import { readFile, unlink } from "fs/promises";
import mammoth from "mammoth";
import multer from "multer";
import path from "path";
import pdfParse from "pdf-parse";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

const app = express();
app.use(cors());
app.use(express.json());

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "files/");
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

async function analyzeText(text: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        {
          role: "model",
          text: "You are an advanced Applicant Tracking System (ATS). Analyze the uploaded resume and extract relevant keywords (such as skills, technologies, and job-related terms). Then, compare the extracted keywords against an ideal job description and provide an ATS score (0-100) based on keyword match, readability, and relevance. Summarize the resume in two lines. Also give the improvements that can be made. Return the analysis in JSON format with the following keys: 'score', 'summary', 'improvements', and 'keywords'.",
        },
        {
          role: "user",
          text: `Analyze the following resume:\n\n${text}`,
        },
      ],
    });

    //@ts-ignore
    const resultText = response.candidates[0].content?.parts[0].text as string;
    const jsonData = JSON.parse(resultText.replace(/```json|```/g, "").trim());

    return jsonData;

  } catch (error) {
    console.error("Error analyzing resume:", error);
    return null;
  }
}


app.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ message: "No file uploaded." });
    return;
  }

  const filePath = req.file.path;
  const fileExt = path.extname(req.file.originalname).toLowerCase();

  try {
    let text = "";

    if (fileExt === ".pdf") {
      const data = await pdfParse(await readFile(filePath));
      text = data.text.trim();
    } else if (fileExt === ".docx") {
      const data = await readFile(filePath);
      const result = await mammoth.extractRawText({ buffer: data });
      text = result.value.trim();
    }

    await unlink(filePath);

    if (!text) {
      res.status(400).json({ message: "No readable text found in the file." });
      return;
    }

    const analysis = await analyzeText(text);

    res.json({
      extractedText: text,
      analysis: analysis,
      message: "File processed successfully.",
    });
    return;
  } catch (error) {
    console.error("Error processing file:", error);
    res.status(500).json({ message: "Error processing file." });
  }
});

app.listen(3000, () =>
  console.log("Server running on http://localhost:3000")
);
