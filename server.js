const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

// Log detalhado de TODAS as requisições
app.use((req, res, next) => {
  console.log('==== REQUEST ====');
  console.log('METHOD:', req.method);
  console.log('ORIGINAL URL:', req.originalUrl);
  console.log('HOST:', req.headers.host);
  console.log('QUERY:', JSON.stringify(req.query));
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('BODY:', JSON.stringify(req.body));
  }
  next();
});

// --- Rotas de usuário e perfil ---
app.get('/apisite/users/v1/users/authenticated', (req, res) => {
  res.json({
    id: 11216,
    name: 'cyprus',
    displayName: 'cyprus',
    isStaff: false
  });
});

app.get('/apisite/users/v1/users/:userId/status', (req, res) => {
  res.json({ status: 'Playing Korone Games!' });
});

app.get('/apisite/accountinformation/v1/description', (req, res) => {
  res.json({ description: 'hello from cyprus' });
});

app.get('/apisite/auth/v1/usernames/validate', (req, res) => {
  const username = (req.query.username || '').trim();
  if (!username) {
    return res.json({ code: 2, message: 'Username is not valid' });
  }
  return res.json({ code: 1, message: 'Success' });
});

// --- Economia ---
app.get('/apisite/economy/v1/users/:userId/currency', (req, res) => {
  res.json({ robux: 2197, tickets: 499 });
});

app.get('/apisite/economy/v2/users/:userId/transactions', (req, res) => {
  res.json({ data: [], nextPageCursor: null });
});

// --- Inventário ---
app.get('/apisite/inventory/v1/users/:userId/items/asset/:assetId/is-owned', (req, res) => {
  res.status(200).send('');
});

app.get('/users/inventory/list-json', (req, res) => {
  res.json({ data: [], nextPageCursor: null });
});

app.get('/users/profile/robloxcollections-json', (req, res) => {
  res.json({ data: [], nextPageCursor: null });
});

// --- Catálogo ---
app.post('/apisite/catalog/v1/catalog/items/details', (req, res) => {
  console.log('>>> POST /apisite/catalog/v1/catalog/items/details');
  console.log('Body:', JSON.stringify(req.body));

  const items = Array.isArray(req.body?.items) ? req.body.items : [];

  const data = items.map((item) => ({
    id: item.id,
    itemType: item.itemType || 'Asset',
    assetType: 8,
    name: `Item ${item.id}`,
    description: '',
    productId: item.id,
    genres: ['All'],
    itemStatus: [],
    itemRestrictions: [],
    creatorHasVerifiedBadge: false,
    creatorType: 'User',
    creatorTargetId: 1,
    creatorName: 'ROBLOX',
    price: 0,
    priceStatus: 'Free',
    favoriteCount: 0,
    offSaleDeadline: null,
    saleLocationType: 'NotApplicable',
    isForSale: true,
    isPurchasable: true,
    owned: false
  }));

  return res.json({ data });
});

// --- Avatar ---
app.post('/apisite/avatar/v1/avatar/set-wearing-assets', (req, res) => {
  res.status(200).send('');
});

app.post('/apisite/avatar/v1/avatar/set-body-colors', (req, res) => {
  res.status(200).send('');
});

app.get('/apisite/avatar/v1/avatar-rules', (req, res) => {
  res.json({ rules: [] });
});

app.get('/apisite/thumbnails/v1/users/avatar', async (req, res) => {
  try {
    const { userIds, size, format } = req.query;
    const response = await axios.get('https://thumbnails.pekora.zip/v1/users/avatar', {
      params: { userIds, size, format },
      timeout: 15000
    });
    res.status(response.status).send(response.data);
  } catch (error) {
    console.error('ERRO /apisite/thumbnails/v1/users/avatar:', error.response?.data || error.message);
    res.status(500).send('Thumbnail bridge failed');
  }
});

// --- Amigos / Social ---
app.get('/apisite/friends/v1/users/:userId/friends', (req, res) => {
  res.json({ data: [] });
});

app.get('/apisite/friends/v1/my/friends/requests', (req, res) => {
  res.json({ data: [], nextPageCursor: null });
});

app.get('/apisite/friends/v1/users/:userId/followers', (req, res) => {
  res.json({ data: [], nextPageCursor: null });
});

app.get('/apisite/friends/v1/users/:userId/followings', (req, res) => {
  res.json({ data: [], nextPageCursor: null });
});

app.get('/apisite/privatemessages/v1/messages', (req, res) => {
  res.json({ data: [], nextPageCursor: null });
});

// --- Jogos ---
app.get('/games/getgameinstancesjson', (req, res) => {
  res.json({
    PlaceId: Number(req.query.placeId || 0),
    ShowShutdownAllButton: false,
    Collection: [],
    TotalCollectionSize: 0
  });
});

app.get('/game/get-join-script', (req, res) => {
  res.json({
    joinScriptUrl: '',
    prefix: 'pekora-player',
    retroArgs: '--authenticationUrl https://www.pekora.zip/Login/Negotiate.ashx'
  });
});

app.get('/game/get-join-script-fromjobid', (req, res) => {
  res.json({
    joinScriptUrl: '',
    prefix: 'pekora-player',
    retroArgs: '--authenticationUrl https://www.pekora.zip/Login/Negotiate.ashx'
  });
});

app.get('/apisite/games/v1/games/:gameId/game-passes', (req, res) => {
  res.json({ data: [] });
});

app.post('/comments/post', (req, res) => {
  res.status(200).send('');
});

// --- Trading ---
app.get('/apisite/trades/v1/trades/inbound/count', (req, res) => {
  res.json({ count: 0 });
});

app.get('/apisite/trades/v1/trades/:type', (req, res) => {
  res.json({ data: [], nextPageCursor: null });
});

// --- Outros ---
app.get('/apisite/forums/v1/sub-category/:categoryId/posts', (req, res) => {
  res.json({ data: [], nextPageCursor: null });
});

app.get('/apisite/groups/v1/users/:userId/groups/roles', (req, res) => {
  res.json({ data: [] });
});

// --- Locale / ClientSettings / ECS ---
app.all('/locale/*', (req, res) => {
  return res.status(200).json({ ok: true });
});

app.all('/clientsettingscdn/*', (req, res) => {
  return res.status(200).json({ ok: true });
});

app.all('/ecsv2/*', (req, res) => {
  return res.status(200).json({ ok: true });
});

// --- Catch-all final ---
app.all('*', (req, res) => {
  console.log('>>> CATCH-ALL:', req.method, req.originalUrl);

  if (req.originalUrl.includes('/config.json')) {
    return res.json({ ok: true });
  }

  if (req.originalUrl.includes('/api/env')) {
    return res.json({ ok: true });
  }

  if (req.originalUrl.includes('/settings.js')) {
    return res.type('application/javascript').send('window.ok = true;');
  }

  if (req.originalUrl.includes('/v2/settings/') || req.originalUrl.includes('/client-settings/')) {
    return res.json({
      data: [],
      message: 'ok'
    });
  }

  if (req.originalUrl.includes('/v1/google/purchase') || req.originalUrl.includes('/v1/google/validate')) {
    return res.json({ ok: true });
  }

  return res.status(200).send('Bridge OK');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Bridge rodando na porta ${PORT}`));