import Replicate from "replicate";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  try {
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    const input = {
      prompt: prompt,
      num_outputs: 1,
      aspect_ratio: "16:9",
      output_format: "png",
      guidance_scale: 3.5,
      output_quality: 100,
      num_inference_steps: 50
    };

    // **1️⃣ Start the prediction**
    const prediction = await replicate.predictions.create({
      version: "be1f9d9a43c18c9c0d8c9024d285aa5fa343914648a7fe35be291ed04a9dfeb0",
      input
    });

    console.log("🔍 Replicate Prediction Response:", prediction);

    // **2️⃣ Wait for completion**
    while (prediction.status !== "succeeded" && prediction.status !== "failed") {
      await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds
      const updatedPrediction = await replicate.predictions.get(prediction.id);
      prediction.status = updatedPrediction.status;
      prediction.output = updatedPrediction.output;
    }

    // **3️⃣ Return the thumbnails**
    if (prediction.status === "succeeded" && prediction.output) {
      res.status(200).json({ thumbnails: prediction.output });
    } else {
      res.status(500).json({ error: "Failed to generate thumbnails. Replicate API Error." });
    }

  } catch (error) {
    console.error("❌ Replicate API Error:", error);
    res.status(500).json({ error: "Failed to generate thumbnails." });
  }
}
