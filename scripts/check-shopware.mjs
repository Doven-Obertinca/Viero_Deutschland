const url = process.env.SHOPWARE_STORE_API_URL;
const key = process.env.SHOPWARE_STORE_API_ACCESS_KEY;
if (!url || !key) {
  console.error(
    "Missing SHOPWARE_STORE_API_URL or SHOPWARE_STORE_API_ACCESS_KEY. Copy .env.example to .env.local and configure the Sales Channel Store API key.",
  );
  process.exitCode = 1;
} else {
  try {
    const response = await fetch(`${url.replace(/\/$/, "")}/context`, {
      headers: { "sw-access-key": key },
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (!data.salesChannel?.id) throw new Error("Unexpected context response");
    console.log(
      JSON.stringify({
        connected: true,
        salesChannelId: data.salesChannel.id,
        currency: data.currency?.isoCode,
      }),
    );
  } catch (error) {
    console.error("Store API check failed:", error.message);
    process.exitCode = 1;
  }
}
