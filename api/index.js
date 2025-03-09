import Replicate from "replicate";
import { writeFile } from "node:fs/promises";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { prompt, image, mask } = req.body;
  if (!prompt || !image || !mask) {
    return res.status(400).json({ error: "Prompt, image, and mask are required." });
  }

  try {
    const replicate = new Replicate();

    const input = {
      prompt,
      image,      // Base64 encoded image or URL
      mask,       // Base64 encoded mask or URL
      aspect_ratio: "16:9",
      guidance_scale: 3.5,
      output_quality: 90
    };

    // Run the model with the given inputs
    const output = await replicate.run(
      "justmalhar/flux-thumbnails-v3:f0db143a6467cfb2b6b1408b6454d120061f35102b1f660af23ce4d91f7940db",
      { input }
    );

    console.log("🖼️ Generated Output:", output);

    // Save the output files locally (optional)
    const outputFiles = [];
    for (const [index, item] of Object.entries(output)) {
      const filePath = `output_${index}.webp`;
      await writeFile(filePath, item);
      outputFiles.push(filePath);
    }

    res.status(200).json({ output });
  } catch (error) {
    console.error("❌ Replicate API Error:", error);
    res.status(500).json({ error: "Failed to generate thumbnails." });
  }
}
