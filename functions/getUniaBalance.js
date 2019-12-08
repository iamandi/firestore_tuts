const functions = require("firebase-functions");
const admin = require("./express-server/config/firebaseService");
const db = admin.firestore();

module.exports = functions.https.onCall(async (data, context) => {
  // Checking that the user is authenticated.
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "The function must be called " + "while authenticated."
    );
  }

  const uid = context.auth.uid;
  const referralInfoDocRef = db
    .collection(`${uid}_referrals`)
    .doc("referralInfo");

  try {
    const doc = await referralInfoDocRef.get();
    if (!doc.exists) throw new functions.https.HttpsError("404: No such doc");

    const { balance } = doc.data();

    return { balance };
  } catch (ex) {
    throw new functions.https.HttpsError("unknown error", ex.message, ex);
  }
});
