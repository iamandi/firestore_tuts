const addReferral = async function(db, userId, referred, bonus) {
  const referralsRef = db.collection("referrals");
  await referralsRef.doc(userId);
};

module.exports = addReferral;
