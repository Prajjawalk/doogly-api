require('dotenv').config(); // Load environment variables from .env file
const express = require('express')
const cors = require('cors'); // Import the cors package
const app = express()
app.use(express.json());
app.use(cors()); // Enable CORS for all routes
const port = 8080
const {
  clusterApiUrl,
  Connection,
} = require("@solana/web3.js");

// Post request to Squid router /route api
app.post('/route', async (req, res) => {
  const result = await fetch("https://apiplus.squidrouter.com/v2/route", {
    method: 'POST',
    body: JSON.stringify(req.body),
    headers: {
      "Content-Type": "application/json",
      "x-integrator-id": process.env.DOOGLY_SRID,
    }
  });

  if (!result.ok) { // Check if the response status is not OK
    const errorResp = await result.json();
    return res.status(result.status).json({ error: errorResp.message || 'Error occurred' });
  }

  const resp = await result.json();
  console.log(resp);
  res.setHeader("x-request-id", result.headers.get('x-request-id'));
  res.json(resp);
})

app.post('/deposit', async (req, res) => {
  const result = await fetch("https://apiplus.squidrouter.com/v2/deposit-address", {
    method: "POST",
    body: JSON.stringify(req.body),
    headers: {
      "Content-Type": "application/json",
      "x-integrator-id": process.env.DOOGLY_SRID,
    }
  })

  const resp = await result.json();
  if (!result.ok) { // Check if the response status is not OK
    const errorResp = await result.json();
    return res.status(result.status).json({ error: errorResp.message || 'Error occurred' });
  }
  
  res.setHeader("x-request-id", result.headers.get('x-request-id'));
  res.json(resp);
})

app.get('/status', async (req, res) => {
  const { transactionId, fromChainId, toChainId, requestId, bridgeType } = req.query; // Extract parameters from the request query
  const result = await fetch(
    "https://apiplus.squidrouter.com/v2/status",
    {
      params: {
        transactionId: transactionId,
        fromChainId: fromChainId,
        toChainId: toChainId,
        requestid: requestId,
        bridgeType: bridgeType,
      },
      headers: {
        "Content-Type": "application/json",
        "x-integrator-id": process.env.DOOGLY_SRID,
      }
    }
  );

  const resp = await result.json();
  if (!result.ok) { // Check if the response status is not OK
    const errorResp = await result.json();
    return res.status(result.status).json({ error: errorResp.message || 'Error occurred' });
  }
  
  res.setHeader("x-request-id", result.headers.get('x-request-id'));
  res.json(resp);
})

app.get('/info', async (req, res) => {
  const result = await fetch("https://apiplus.squidrouter.com/v2/sdk-info", {
    headers: {
      "Content-Type": "application/json",
      "x-integrator-id": process.env.DOOGLY_SRID,
    }
  });
  const resp = await result.json();
  if (!result.ok) { // Check if the response status is not OK
    const errorResp = await result.json();
    return res.status(result.status).json({ error: errorResp.message || 'Error occurred' });
  }
  
  res.json(resp);
})

app.get('/blockhash', async (req, res) => {
  const connection = new Connection(
    clusterApiUrl("mainnet-beta"),
    "confirmed"
  );

  const latestBlockHash = await connection.getLatestBlockhash();

  res.json(latestBlockHash);
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})