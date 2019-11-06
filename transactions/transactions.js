const addTransaction = async function() {
  const from = {
    id: "1sJ80CaoJASEzE4FlVuU",
    email: "test@test.com",
    address: "1AefFjNbrRFMQGJ8SA5Pyyzv47Z6sntHuQ"
  };
  const to = {
    id: "2MKbkE3ijBwQJpXRGok6",
    email: "test@test.com",
    address: "1AefFjNbrRFMQGJ8SA5Pyyzv47Z6sntHuQ"
  };
  const amount = 1.233;
  const token = "BTC";
  const txHash =
    "0xda2f9813b74b8f6f49da0972170f083565b27b84734017b53e4b3558f279da49";
  const transaction = {
    date: FieldValue.serverTimestamp(),
    from,
    to,
    amount,
    token,
    txHash
  };
  const txDocRef = transactionsRef.doc(txHash);

  await txDocRef.set(transaction);
};

const getTransactionWithHash = async function() {
  const txs = await transactionsRef
    .doc("0xda2f9813b74b8f6f49da0972170f083565b27b84734017b53e4b3558f279da49")
    .get();
  console.log(txs.id, "=>", txs.data());

  const fromRef = userRef.doc(txs.data().from).get();
  const toRef = userRef.doc(txs.data().to).get();

  const usr = await Promise.all([fromRef, toRef]);
  usr.forEach(d => {
    console.log(d.data().email);
  });
};

module.exports = addTransaction;
module.exports = getTransactionWithHash;
