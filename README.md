# FiveM Banking System

A modern, optimized **ESX banking system for FiveM** with full UI integration and society account support.

![License](https://img.shields.io/badge/license-GPLv3-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)

## ✨ Features

* 💳 **Full Banking System** – Deposit, withdraw, and transfer money
* 🏦 **Society Accounts** – Supports ESX shared job accounts (esx_society)
* 📊 **Transaction Logging** – All actions stored in database
* 🎨 **Modern UI** – Clean, responsive interface (NUI fully integrated)
* 🔔 **ox_lib Notifications** – Clean in-game alerts
* 🏧 **ATM Support** – Access banking via world ATMs
* ⚙️ **Configurable System** – Easily adjust settings via config
* 🧠 **Optimized & Secure** – Full server-side validation, no exploits

## 📦 Dependencies

* [es_extended](https://github.com/esx-framework/esx_core)
* [ox_lib](https://github.com/overextended/ox_lib)
* [oxmysql](https://github.com/overextended/oxmysql)
* [esx_society](https://github.com/esx-framework/esx_society)

## 🛠 Installation

1. Download the latest release
2. Extract it into your `resources` folder
3. Rename the folder to your desired resource name
4. Add the resource to your `server.cfg`:

```cfg
ensure your-resource-name
```

5. Configure `config.lua` to your liking
6. Restart your server

> Database tables are created automatically on first start.

## ⚙️ Configuration

### Basic Setup

Edit `config.lua`:

```lua
Config = {}

Config.Debug = false

Config.EnableDirtyMoney = true

Config.ATMModels = {
    `prop_atm_01`,
    `prop_atm_02`,
    `prop_atm_03`,
    `prop_fleeca_atm`
}

Config.ATMLocations = {
    vector3(150.0, -1040.0, 29.0),
    vector3(-1212.0, -330.0, 37.0)
}
```

## 💳 Core Features

### Banking Actions

* Deposit money into bank
* Withdraw money from bank
* Transfer money to other players

### Society Accounts

* Supports **ESX society accounts**
* Shared job balances (boss compatible)
* Toggleable in config if needed

## 🏧 ATM System

* Interact with ATM props or configured locations
* Opens full banking UI
* Works alongside `/bank` command

## 🖥 UI Integration

* Fully connected **NUI (`web` folder)**
* Real-time updates:

  * Balance changes
  * Transactions
* Smooth communication:

  * client.lua ⇄ NUI ⇄ server.lua

## ⌨️ Commands

### Player Commands

* `/bank` – Open the banking UI

## 💸 Transactions

All transactions are logged, including:

* Deposits
* Withdrawals
* Transfers

## 🗄 Database

Example tables created automatically:

```sql
CREATE TABLE IF NOT EXISTS bank_accounts (
    identifier VARCHAR(60) PRIMARY KEY,
    balance INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS bank_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    identifier VARCHAR(60),
    type VARCHAR(20),
    amount INT,
    target VARCHAR(60),
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔌 Exports

```lua
exports['your-resource-name']:GetBalance(source)
exports['your-resource-name']:AddMoney(source, amount)
exports['your-resource-name']:RemoveMoney(source, amount)
```

## 🧩 Support

* Open an issue on GitHub for bugs or suggestions
* Please check existing issues before creating a new one

## 📄 License

This project is licensed under the **GPL License**.

## ❤️ Credits

* Built with **ox_lib**
* Database powered by **oxmysql**
* Compatible with **ESX Framework**
* Society support via **esx_society**

## 📷 Screenshots

<img width="1218" height="794" alt="image" src="https://github.com/user-attachments/assets/af7c2402-2f80-4364-ba36-691f6cba0429" />
