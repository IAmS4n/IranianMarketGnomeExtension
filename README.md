# GNOME Extension: Fast check USD price and Cryptocurrency Prices

This GNOME extension is designed to work seamlessly with Wayland and has been tested on Ubuntu GNOME version 42.9.

## Prices

Currently, this extension provides three price data for the Iranian market:

- **USD to Toman:** This price is sourced from Bonbast website.
- **USDT to Toman:** This data is fetched from Bitpin's spot market.
- **BTC to USD:** The cryptocurrency price is obtained from Coinbase.

* Bonbast website is subject to access restrictions due to Iran's filtering system. This extension leverages the system proxy to circumvent these limitations.

## Installation

To install this extension, follow these simple steps:

```bash
chmod +x install.sh
./install.sh
```
* If the extention was not listed, a log out is needed. After that, you can enable the extension by following command:
```bash
gnome-extensions enable IranianMarkets@ehsan
```

## Development Testing

For development purposes, you can install and test the extension with the following commands:

```bash
chmod +x install_and_test.sh
./install_and_test.sh

```
