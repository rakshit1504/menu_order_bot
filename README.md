
# WhatsApp Catalog Ordering Bot

A Node.js + Express backend using the WhatsApp Cloud API. This server listens for incoming WhatsApp messages, sends a product catalog, receives customer orders via WhatsApp cart, and responds with an itemized order summary and total amount.



## Features

- Sends catalog template when user types `menu`
- Accepts WhatsApp cart-based orders
- Calculates total cost and sends receipt message
- Handles fallback responses for invalid input




## WhatsApp Interaction Flow

1. User sends the word `menu`
2. Bot replies with catalog template
3. User adds items to cart and places order
4. Bot receives order message and responds with:
   - Order summary
   - Item list with quantities and prices
   - Total amount

All other inputs will trigger a fallback message suggesting the user to type `menu`.

---
## Screenshots

### User Interaction

**Catalog request:**

![menu request](screenshots/menu_sent.png)

**Items added to cart:**

![cart](screenshots/cart_created.png)

**Order summary received:**

![summary](screenshots/order_summary.png)

### Server Logs

![logs](screenshots/server_logs.png)


## Demo

All screenshots and a working demo video are available here:

[Google Drive Demo Folder](https://drive.google.com/drive/folder/YOUR_FOLDER_ID)

Replace the link with your actual Drive folder.

---





