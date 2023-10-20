// This extiention gather three sources of market price in one click

const GLib = imports.gi.GLib;
const Soup = imports.gi.Soup;
const Me = imports.misc.extensionUtils.getCurrentExtension();
const St = imports.gi.St;
const Main = imports.ui.main;
const Tweener = imports.tweener.tweener;
let text, button;

async function hidePrompt() {
  Main.uiGroup.remove_actor(text);
  text = null;
}

// Bonbast website have a defence mechanism against bots. this function extract the token that is for the defence!
async function _getBonbastToken() {
  let session = new Soup.Session();
  session.timeout = 10000;
  const message = Soup.Message.new('GET', "https://www.bonbast.com/");
  message.request_headers.append('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36');
  const result = await session.send_and_read_async(message, GLib.PRIORITY_DEFAULT, null);
  const pattern = /\$\.post\('\/json', {param: "([^"]+)"/;
  const match = result.get_data().toString().match(pattern);
  // const cookies = result.response_headers.get_all('Set-Cookie');
  return match[1];
}

// Returns price of USD in Toman. This function can easily extract more currency in toman.
async function getBonbastData() {
  // console.log("Call getBonbastData");
  try {
    const token = await _getBonbastToken();
    let session = new Soup.Session();
    session.timeout = 10000;
    const message = Soup.Message.new('POST', 'https://www.bonbast.com/json');
    message.request_headers.append('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36');
    message.request_headers.append('Referer', 'https://www.bonbast.com/');
    message.request_headers.append('Origin', 'https://www.bonbast.com');
    message.request_headers.append('Cookie', "st_bb=0;");

    const requestData = 'param=' + encodeURIComponent(token);
    message.set_request('application/x-www-form-urlencoded; charset=UTF-8', Soup.MemoryUse.COPY, requestData);

    await session.send_message(message);

    return JSON.parse(message.response_body.data.toString()).usd1;
  } catch (e) {
    return null;
  }
}

// Returns price of USDT in Toman. This function find the price based on the last spot trade in Bitpin website.
// Current method is not completly robust, and for better solution we need aggreagate several sources of price.
async function getUSDTPrice() {
  // console.log("Call getUSDTPrice");
  try {
    let session = new Soup.Session();
    session.timeout = 10000;
    const message = Soup.Message.new('GET', "https://api.bitpin.ir/v1/mth/matches/5/");
    const result = await session.send_and_read_async(message, GLib.PRIORITY_DEFAULT, null);
    const jsonData = JSON.parse(result.get_data().toString());

    const lastTrad = jsonData.reduce((max, row) => {
      if (row.time > max.time) {
        return { time: row.time, price: row.price };
      } else {
        return max;
      }
    }, { time: -Infinity, price: -Infinity });

    return lastTrad.price;
  } catch (e) {
    return null;
  }

}

// Returns price of BTC in USD.
async function getCryptoPrice(crypto) {
  try {
    // console.log("Call getBTCPrice");
    let session = new Soup.Session();
    session.timeout = 10000;
    const message = Soup.Message.new('GET', `https://api.coinbase.com/v2/prices/${crypto}-USD/spot`);
    const result = await session.send_and_read_async(message, GLib.PRIORITY_DEFAULT, null);
    const jsonData = JSON.parse(result.get_data().toString());
    return parseFloat(jsonData.data.amount).toFixed(2);
  } catch (e) {
    return null;
  }
}

async function main() {
  // let usdPrice = await getBonbastData();
  // console.log(usdPrice)
  // let usdtPrice = await getUSDTPrice();
  // console.log(usdtPrice)
  // let btcPrice = await getCryptoPrice("BTC");
  // console.log(btcPrice)
  // let res = `USD : ${usdPrice}T\nUSDT : ${usdtPrice}T\nBTC : \$${btcPrice}`;
  // showResult(res);

  Promise.all([getBonbastData(), getUSDTPrice(), getCryptoPrice("BTC"), getCryptoPrice("ETH"), getCryptoPrice("BNB")])
    .then((results) => {
      let [usdPrice, usdtPrice, btcPrice, ethPrice, bnbPrice] = results;
      if (!usdPrice) { usdPrice = " ? "; }
      if (!usdtPrice) { usdtPrice = " ? "; }
      if (!btcPrice) { btcPrice = " ? "; }
      if (!ethPrice) { ethPrice = " ? "; }
      if (!bnbPrice) { bnbPrice = " ? "; }
      let res = `USD : ${usdPrice}T\nUSDT : ${usdtPrice}T\nBTC : \$${btcPrice}\nETH : \$${ethPrice}\nBNB : \$${bnbPrice}`;
      // console.log(res);
      showResult(res);
    })
    .catch((error) => {
      console.error("An error occurred:", error);
    });

}

async function showResult(prices) {
  if (!text) {
    text = new St.Label({ style_class: 'price-label', text: prices });
    Main.uiGroup.add_actor(text);
  }

  text.opacity = 255;
  let monitor = Main.layoutManager.primaryMonitor;
  text.set_position(monitor.x + Math.floor(monitor.width / 2 - text.width / 2),
    monitor.y + Math.floor(monitor.height / 2 - text.height / 2));
  Tweener.addTween(text,
    {
      opacity: 0,
      time: 15,
      transition: 'linear',
      onComplete: hidePrompt
    });
}

function init() {
  button = new St.Bin({
    style_class: 'panel-button',
    reactive: true,
    can_focus: true,
    x_expand: true,
    y_expand: false,
    track_hover: true
  });

  let icon = new St.Icon({ style_class: 'btc' });
  button.set_child(icon);
  button.connect('button-press-event', main);
}


function enable() {
  Main.panel._rightBox.insert_child_at_index(button, 0);
}

function disable() {
  Main.panel._rightBox.remove_child(button);
}
