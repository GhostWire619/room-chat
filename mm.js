import webpush from "web-push";

// Generate VAPID keys
const vapidKeys = webpush.generateVAPIDKeys();

// Output the keys
console.log("Public Key:", vapidKeys.publicKey);
console.log("Private Key:", vapidKeys.privateKey);
