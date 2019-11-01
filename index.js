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

function addDocument() {
  docRef.set({
    firstName: "Ada",
    lastName: "Lovelace"
  });
}

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
//allUsers();

addDocument();
//overwriteDocument();
