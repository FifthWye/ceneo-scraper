async function getElText(selector, page) {
  let productNameEl = await page.$(selector);
  const name = await page.evaluate(el => el.textContent, productNameEl);
  return name.trim();
}

module.exports = {
  getElText: getElText
};
