const express = require('express');
const axios = require('axios');
const app = express();

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
  try {
    const pekoraResponse = await axios.post(
      `${PEKORA_API_BASE}/v1/catalog/items/details`,
      req.body
    );

    const translatedData = pekoraResponse.data.data.map(item => mapPekoraToRoblox2020(item));

    res.json({ data: translatedData });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ errors: [{ code: 0, message: "Bridge translation failed" }] });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Bridge rodando na porta ${PORT}`));
