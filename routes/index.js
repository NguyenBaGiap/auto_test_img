const express = require('express');
const router = express.Router();

const fetch = require('node-fetch');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

/* GET home page. */
router.get('/', async function(req, res, next) {
  const url = 'https://ekyc.digital-id.vn/call/register_ekyc_front_back_face_video'

  const formData = new FormData()
  formData.append('image_card1','data_test/0834211851_F')
  formData.append('image_card2',file)
  formData.append('video_general',file)

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: formData
  })
  const result = response.json()

  console.log(result)



  res.render('index', { title: 'Express' });
});

module.exports = router;
