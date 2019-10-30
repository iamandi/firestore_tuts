const admin = require("firebase-admin");
const FieldValue = admin.firestore.FieldValue;

const serviceAccount = require("../firebase-service-account-creds/reactcryptoserver-firebase-adminsdk-jj79o-ee515f5b33.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://reactcryptoserver.firebaseio.com"
});

let db = admin.firestore();

let docRef = db.collection("users").doc();

let setAda = docRef.set({
  firstName: "Ada",
  lastName: "Lovelace"
});

const jsonBourneRef = db.collection("users").doc("ILjZHsOv1F6jHoBeOZIJ");
jsonBourneRef.set({
  firstName: "Jason",
  lastName: "Ultimatum"
});

jsonBourneRef.update({
  lastName: "Bourne"
});

let updateTimestamp = jsonBourneRef.update({
  timestamp: FieldValue.serverTimestamp()
});

const snapshotSize = db
  .collection("users")
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
snapshotSize.then(res => console.log(res));

db.collection("users")
  .get()
  .then(snapshot => {
    snapshot.forEach(doc => {
      console.log(doc.id, "=>", doc.data());
    });
  })
  .catch(err => {
    console.log("Error getting documents", err);
  });

/* 
// For realtime updates
let observer = docRef.onSnapshot(
  docSnapshot => {
    console.log("Received doc snapshot: ", docSnapshot.data());
  },
  err => {
    console.log(`Encountered error: ${err}`);
  }
);

/////////
const authorId = "bob";
db.collection("books")
  .where("author", "==", authorId)
  .where("published", ">=", 1901)
  .get()
  .then(snapshot => {
    snapshot.forEach(doc => {
      console.log(doc.id, "=>", doc.data());
    });
  });
 */
