const express = require('express');
const axios = require('axios');
const app = express();

// Log em TODAS as requisições
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  console.log('Headers:', JSON.stringify(req.headers));
  if (req.method !== 'GET' && req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', JSON.stringify(req.body));
  }
  next();
});

app.use(express.json());

const PEKORA_API_BASE = 'https://catalog.pekora.zip';

function mapPekoraToRoblox2020(pekoraItem) {
  return {
    id: pekoraItem.id,
    itemType: "Asset",
    assetType: pekoraItem.assetType,
    name: pekoraItem.name,
    description: pekoraItem.description || "",
    productId: pekoraItem.productId || pekoraItem.id,
    genres: ["All"],
    itemStatus: [],
    itemRestrictions: [],
    creatorHasVerifiedBadge: false,
    creatorType: pekoraItem.creatorType || "User",
    creatorTargetId: pekoraItem.creatorTargetId || 1,
    creatorName: pekoraItem.creatorName || "ROBLOX",
    price: pekoraItem.price !== undefined ? pekoraItem.price : 0,
    priceStatus: pekoraItem.priceStatus || (pekoraItem.price === 0 ? "Free" : null),
    favoriteCount: pekoraItem.favoriteCount || 0,
    offSaleDeadline: null,
    saleLocationType: "NotApplicable",
    isForSale: pekoraItem.isForSale !== undefined ? pekoraItem.isForSale : true,
    isPurchasable: pekoraItem.isForSale !== undefined ? pekoraItem.isForSale : true,
    owned: false
  };
}

app.get('/', (req, res) => {
  res.send('Pekora Bridge tá rodando!');
});

app.post('/v1/catalog/items/details', async (req, res) => {
  console.log('>>> POST /v1/catalog/items/details');
  try {
    const pekoraResponse = await axios.post(
      `${PEKORA_API_BASE}/v1/catalog/items/details`,
      req.body,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    );

    const translatedData = pekoraResponse.data.data.map(item => mapPekoraToRoblox2020(item));
    res.json({ data: translatedData });
  } catch (error) {
    console.error('ERRO /v1/catalog/items/details:', error.response?.data || error.message);
    res.status(500).json({ errors: [{ code: 0, message: "Bridge translation failed" }] });
  }
});

app.get('/v1/assets', async (req, res) => {
  console.log('>>> GET /v1/assets');
  console.log('Query params:', req.query);
  try {
    const { assetIds, size, format } = req.query;

    const pekoraResponse = await axios.get(
      `https://thumbnails.pekora.zip/v1/assets`,
      {
        params: { assetIds, size, format },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
          'Accept': 'application/json'
        }
      }
    );

    const imageUrl = pekoraResponse.data.data[0]?.imageUrl;

    if (imageUrl) {
      console.log('Redirecting to:', imageUrl);
      res.redirect(302, imageUrl);
    } else {
      console.log('Image not found');
      res.status(404).send('Image not found');
    }
  } catch (error) {
    console.error('ERRO THUMBNAIL:', error.response?.data || error.message);
    res.status(500).send('Thumbnail bridge failed');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Bridge rodando na porta ${PORT}`));

// Catch-all: repassa qualquer outra rota direto pro Pekora real
app.all('*', async (req, res) => {
  console.log('>>> CATCH-ALL:', req.method, req.originalUrl);
  try {
    const targetUrl = `https://www.pekora.zip${req.originalUrl}`;
    const response = await axios({
      method: req.method,
      url: targetUrl,
      data: req.body,
      headers: {
        ...req.headers,
        host: 'www.pekora.zip',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
      },
      validateStatus: () => true,
      responseType: 'arraybuffer'
    });
    console.log('CATCH-ALL response:', response.status);
    res.status(response.status).send(response.data);
  } catch (error) {
    console.error('PROXY ERROR:', error.message);
    res.status(502).send('Proxy failed');
  }
});