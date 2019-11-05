const admin = require("firebase-admin");
const FieldValue = admin.firestore.FieldValue;

const serviceAccount = require("../firebase-service-account-creds/serviceAccount.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://reactcryptoserver.firebaseio.com"
});

const db = admin.firestore();
const userRef = db.collection("users");
const docRef = userRef.doc();
const jsonBourneRef = userRef.doc("ILjZHsOv1F6jHoBeOZIJ");

const transactionsRef = db.collection("transactions");

function addDocument() {
  docRef.set({
    firstName: "Ada",
    lastName: "Lovelace"
  });
}

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

function overwriteDocument() {
  jsonBourneRef.set({
    firstName: "Jason",
    lastName: "Ultimatum"
  });
}

function updateDocument() {
  jsonBourneRef.update({
    lastName: "Bourne"
  });
}

function updateTimestamp() {
  jsonBourneRef.update({
    timestamp: FieldValue.serverTimestamp()
  });
}

function deleteUserComplexQuery() {
  userRef
    .where("firstName", "==", "Ada")
    .where("lastName", "==", "Lovelace")
    .get()
    .then(snapshot => {
      // When there are no documents left, we are done
      if (snapshot.size == 0) {
        return 0;
      }

      // Delete documents in a batch
      let batch = db.batch();
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      return batch.commit().then(() => {
        return snapshot.size;
      });
    })
    .catch(err => {
      console.log("Error getting documents", err);
    });
}

function getAllUsers() {
  userRef
    .get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        console.log(doc.id, "=>", doc.data());
      });
    })
    .catch(err => {
      console.log("Error getting documents", err);
    });
}

const allUsers = async function() {
  const allUsers = await userRef.get();
  allUsers.forEach(doc => {
    console.log(doc.id, "=>", doc.data());
  });
};

//addDocument();
//overwriteDocument();
//deleteUserComplexQuery();
//allUsers();

//addTransaction();
//getTransactionWithHash();
