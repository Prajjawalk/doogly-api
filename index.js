require('dotenv').config(); // Load environment variables from .env file
const express = require('express')
const cors = require('cors'); // Import the cors package
const app = express()
const bodyParser = require('body-parser');

app.use(bodyParser.json()); // Parse JSON bodies
app.use(cors()); // Enable CORS for all routes
const port = 8080
const {
  clusterApiUrl,
  Connection,
} = require("@solana/web3.js");

// Middleware to log request and response details
const logRequestResponse = async (req, res, next) => {
  // Log request details
  const requestDetails = {
    method: req.method,
    url: req.originalUrl,
    headers: req.headers,
    body: req.body,
    timestamp: new Date().toISOString(),
  };

  // Log the request details to a file or console
  console.log('Request:', JSON.stringify(requestDetails, null, 2));

  // Capture the original send method
  const originalSend = res.send.bind(res);

  // Override the send method to capture the response
  res.send = async (body) => {
    // Log response details
    const responseDetails = {
      status: res.statusCode,
      headers: res.getHeaders(),
      body: body,
    };

    // Log the response details to a file or console
    console.log('Response:', JSON.stringify(responseDetails, null, 2));

    // Call the original send method
    return originalSend(body);
  };

  next();
};

// Post request to Squid router /route api
app.post('/route', logRequestResponse, async (req, res) => {
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
  resp["x-request-id"] = result.headers.get('x-request-id');
  res.json(resp);
})

app.post('/deposit', logRequestResponse, async (req, res) => {
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
    const errorResp = resp;
    return res.status(result.status).json({ error: errorResp.message || 'Error occurred' });
  }
  
  resp["x-request-id"] = result.headers.get('x-request-id');
  res.json(resp);
})
app.get('/status', logRequestResponse, async (req, res) => {
  const {transactionId, requestId, fromChainId, toChainId, bridgeType} = req.query;
  const result = await fetch(
    `https://apiplus.squidrouter.com/v2/status?transactionId=${transactionId}&requestId=${requestId}&fromChainId=${fromChainId}&toChainId=${toChainId}&bridgeType=${bridgeType}`,
    {
      headers: {
        "Content-Type": "application/json",
        "x-integrator-id": process.env.DOOGLY_SRID,
      }
    }
  );

  const resp = await result.json();
  if (!result.ok) { // Check if the response status is not OK
    return res.status(result.status).json({ error: resp.message || 'Error occurred' });
  }
  
  resp["x-request-id"] = result.headers.get('x-request-id');
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
    const errorResp = resp;
    return res.status(result.status).json({ error: errorResp.message || 'Error occurred' });
  }
  
  res.json(resp);
})

app.get('/blockhash', logRequestResponse, async (req, res) => {
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