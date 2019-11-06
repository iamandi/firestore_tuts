/* exports.updateUnimoneyBalance = functions.firestore
  .document("/referrals/{docId}")
  .onCreate((snap, context) => {
    const { referee, referred, } = snap.data();
    console.log(context.params);

    const userId = context.params.userId;
    console.log(`userId: ${context.params.userId}`);

    const restRef = unimoneyRef.doc(userId);

    return db.runTransaction(transaction => {
      return transaction.get(restRef).then(restDoc => {
        // Compute new number of ratings
        var balance = restDoc.data().balance + newValue.bonus;

        // Update restaurant info
        return transaction.update(restRef, {
          balance
        });
      });
    });
  }); */

/* exports.addWallet = functions.firestore
  .document("/users/{userId}")
  .onCreate((snap, context) => {
    const newValue = snap.data();

    const userId = context.params.userId;
    console.log(`userId: ${context.params.userId}`);

    const wallet = {
      bitcoin: { balance: 0, publicAddress: btcWallet.address },
      ethereum: { balance: 0, publicAddress: ethWallet.address },
      donpia: { balance: 0, publicAddress: ethWallet.address },
      userId
    };

    const docRef = walletRef.doc(userId);

    return docRef.set(wallet);
  }); 

exports.addWalletPrivate = functions.firestore
  .document("/users/{userId}")
  .onCreate((snap, context) => {
    const userId = context.params.userId;

    const walletPrivate = {
      bitcoin: { privateKey: btcWallet.privateKey },
      ethereum: { privateKey: ethWallet.privateKey },
      donpia: { privateKey: ethWallet.privateKey },
      userId
    };

    const docRef = walletPrivRef.doc(userId);

    return docRef.set(walletPrivate);
  }); */
