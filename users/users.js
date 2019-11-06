const addDocument = function(docRef) {
  docRef.set({
    firstName: "Ada",
    lastName: "Lovelace"
  });
};

const overwriteDocument = function(jsonBourneRef) {
  jsonBourneRef.set({
    firstName: "Jason",
    lastName: "Ultimatum"
  });
};

const updateDocument = function(jsonBourneRef) {
  jsonBourneRef.update({
    lastName: "Bourne"
  });
};

const updateTimestamp = function(jsonBourneRef) {
  jsonBourneRef.update({
    timestamp: FieldValue.serverTimestamp()
  });
};

const deleteUserComplexQuery = function(userRef) {
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
};

const allUsers = async function(userRef) {
  const allUsers = await userRef.get();
  allUsers.forEach(doc => {
    console.log(doc.id, "=>", doc.data());
  });
};

module.exports = deleteUserComplexQuery;
module.exports = allUsers;
module.exports = overwriteDocument;
module.exports = updateDocument;
module.exports = updateTimestamp;
