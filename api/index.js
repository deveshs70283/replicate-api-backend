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

    const output = await replicate.run(
      "justmalhar/flux-thumbnails-v2:be1f9d9a43c18c9c0d8c9024d285aa5fa343914648a7fe35be291ed04a9dfeb0",
      { input }
    );

    if (!output) {
      throw new Error("No response from Replicate API");
    }

    res.status(200).json({ thumbnails: output });
  } catch (error) {
    console.error("Replicate API Error:", error);
    
    if (error.response) {
      return res.status(error.response.status).json({ 
        error: `Replicate API Error: ${error.response.statusText}`
      });
    }

    return res.status(500).json({ error: "Failed to generate thumbnails. Please try again later." });
  }
}
