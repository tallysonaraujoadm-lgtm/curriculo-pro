const providers = ["google", "facebook", "linkedin"];

function isConfigured(provider) {
  const prefix = provider.toUpperCase();
  return Boolean(
    process.env[`${prefix}_CLIENT_ID`] &&
    process.env[`${prefix}_CLIENT_SECRET`]
  );
}

export default function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Método não permitido." });
  }

  res.setHeader("Cache-Control", "no-store");
  return res.status(200).json({
    providers: providers.filter(isConfigured)
  });
}
