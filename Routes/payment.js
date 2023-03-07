const express = require("express");
const requestp = require('request-promise');
const mysql = require("mysql2");
const checkUserAuth = require("../middlewares/auth-middleware");
const router = express.Router();
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
});

router.post('/khalti/payment',checkUserAuth, function(req, res) {
  const id= req.user.id;
  const KHALTI_VERIFY = 'https://khalti.com/api/v2/payment/verify/';
  const { token, amount } = req.body;
  console.log(token);
  console.log("amount:",amount)

  if (!token || !amount) {
    return res.status(400).json({
      error: 'Token and amount are required',
      status: 'failed',
    });
  }

  const options = {
    method: 'POST',
    uri: KHALTI_VERIFY,
    body: {
      'token': token,
      'amount': amount
    },
    headers: {
      'Authorization': `Key ${process.env.SECRET_KEY}`,
      'Content-Type': 'application/json'
    },
    json: true
  };

  requestp(options)
    .then((result) => {
      pool.query(`UPDATE users SET account_type='premium' WHERE id=${id}`, (error, results) => {
        if (error) {
          console.error(error);
          return res.status(500).json({
            error: error.message,
            status: 'failed',
          });
        }
        console.log('charged', result);
        res.json({
          data: result,
          status: "success"
        });
      });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({
        error: error.response.data,
        status: 'failed',
      });
    });
});

module.exports = router;
