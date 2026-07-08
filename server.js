const express = require('express');
const axios = require('axios');
const app = express();

// Aumentar o limite do corpo da requisição para lidar com uploads se necessário
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Configurações de Domínio
const BRIDGE_DOMAIN = 'pekorabridge.duckdns.org'; // Seu domínio DuckDNS
const TARGET_API = 'api.pekora.zip';
const TARGET_WWW = 'www.pekora.zip';

// Log detalhado para Debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// --- 1. Rotas de Configuração do Cliente (Essencial para o Join) ---
app.get(['/clientsettingscdn/*', '/v1/client-version/*'], (req, res) => {
  res.json({
    clientVersionUpload: '1234567890',
    bootstrapConfig: {
      baseUrl: `https://${BRIDGE_DOMAIN}`,
      baseUrlWss: `wss://${BRIDGE_DOMAIN}`,
    }
  });
});

// --- 2. Rotas de Join (Onde o jogo começa) ---
app.get(['/game/get-join-script', '/game/get-join-script-fromjobid'], (req, res) => {
  res.json({
    joinScriptUrl: '',
    prefix: 'pekora-player',
    // Apontando a autenticação para o nosso bridge para manter a sessão
    retroArgs: `--authenticationUrl https://${BRIDGE_DOMAIN}/Login/Negotiate.ashx`
  });
});

// --- 3. Mock de Dados Sociais/Economia (Para evitar erros de UI) ---
app.get('/apisite/users/v1/users/authenticated', (req, res) => {
  res.json({ id: 11216, name: 'cyprus', displayName: 'cyprus', isStaff: false });
});

app.get('/apisite/economy/v1/users/:userId/currency', (req, res) => {
  res.json({ robux: 2197, tickets: 499 });
});

app.get('/locale/*', (req, res) => {
  res.json({ localeId: 'pt-BR', name: 'Português', nativeName: 'Português', isRecommended: true });
});

// --- 4. O PROXY TRANSPARENTE (Resolve o Loading Eterno) ---
// Esta rota captura TUDO que não foi definido acima e busca no servidor original
app.all('*', async (req, res) => {
  // Determinar se vamos para api. ou www. (api. é o padrão recomendado)
  const targetHost = req.originalUrl.startsWith('/apisite') || req.originalUrl.startsWith('/v1') ? TARGET_API : TARGET_API;
  const targetUrl = `https://${targetHost}${req.originalUrl}`;

  console.log(`>>> PROXYING TO: ${targetUrl}`);

  try {
    const response = await axios({
      method: req.method,
      url: targetUrl,
      headers: {
        ...req.headers,
        'host': targetHost, // Sobrescrever o host para o destino
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        'accept-encoding': 'identity', // Evitar compressão que pode quebrar o repasse
      },
      data: req.body,
      responseType: 'arraybuffer', // Crucial para Assets (Mapas, Sons, Imagens)
      validateStatus: () => true, // Não travar em erros 404/500, apenas repassar
    });

    // Repassar os cabeçalhos de resposta (Content-Type é o mais importante aqui)
    Object.keys(response.headers).forEach(header => {
      res.set(header, response.headers[header]);
    });

    res.status(response.status).send(response.data);
  } catch (error) {
    console.error(`!!! PROXY ERROR on ${req.originalUrl}:`, error.message);
    res.status(502).json({ error: 'Proxy Failed', details: error.message });
  }
});

// Porta 10000 como padrão conforme seu teste de sucesso no Termux
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`=========================================`);
  console.log(`PEKORA BRIDGE RODANDO NA PORTA ${PORT}`);
  console.log(`DOMÍNIO: ${BRIDGE_DOMAIN}`);
  console.log(`ALVO: ${TARGET_API}`);
  console.log(`=========================================`);
});
