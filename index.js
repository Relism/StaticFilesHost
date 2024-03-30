const express = require('express');
const puppeteer = require('puppeteer');

const app = express();

app.get('/search', async (req, res) => {
  try {
    const query = req.query.query;
    const url = `https://www.lidl.de/q/search?q=${query}`;
    
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });
    
    const productList = await page.evaluate(() => {
      const results = [];
      const products = document.querySelectorAll('#s-results li[id^="product_"]');
      
      products.forEach((product) => {
        const productId = product.getAttribute('id');
        const productName = product.querySelector('h2[data-qa-label="product-grid-box-title"]').textContent.trim();
        const productPrice = product.querySelector('.m-price__price--small').textContent.trim();
        
        results.push({
          id: productId,
          name: productName,
          price: productPrice,
        });
      });
      
      return results;
    });
    
    await browser.close();
    
    res.json(productList);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});