// src/iap/mockIAP.js
let purchaseListeners = [];
let errorListeners = [];

export const initConnection = async () => {
  console.log("✅ Mock IAP initialized");
  return true;
};

export const getProducts = async (productIds) => {
  console.log("✅ Mock getProducts called:", productIds);
  return productIds.map(id => ({
    productId: id,
    title: "Test Product",
    description: "This is a mock product",
    localizedPrice: "$0.99",
  }));
};

export const requestPurchase = async (productId) => {
  console.log("✅ Mock purchase requested:", productId);
  
  const purchase = {
    productId,
    transactionReceipt: "mock-receipt",
  };

  // Trigger success listener
  purchaseListeners.forEach(listener => listener(purchase));

  return purchase;
};

export const finishTransaction = async (purchase) => {
  console.log("✅ Mock finishTransaction:", purchase);
  return true;
};

export const purchaseUpdatedListener = (callback) => {
  purchaseListeners.push(callback);
  return { remove: () => { purchaseListeners = purchaseListeners.filter(l => l !== callback); } };
};

export const purchaseErrorListener = (callback) => {
  errorListeners.push(callback);
  return { remove: () => { errorListeners = errorListeners.filter(l => l !== callback); } };
};

export const endConnection = async () => {
  console.log("✅ Mock IAP connection ended");
  purchaseListeners = [];
  errorListeners = [];
};
