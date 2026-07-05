const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('KORONE API TA VIVO PORRAAA!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API Bridge rodando na bazinga (port) ${PORT}`));
