const { Customer, validate } = require("../models/customer");
const auth = require("../middleware/auth");
const express = require("express");
const router = express.Router();

// add customer
router.post("/", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let customer = new Customer({
    name: req.body.name,
    isGold: req.body.isGold,
    phone: req.body.phone
  });

  customer = await customer.save();
  res.send(customer);
});

/* 
// all genres
router.get("/", async (req, res) => {
    const customers = await Customer.find().sort('name');
    res.send(customers);
});

// edit customer
router.put("/:id", async (req, res) => {
    const { error } = validate(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    const customer = await Customer.findByIdAndUpdate(req.params.id, { 
        name: req.body.name,
        isGold: req.body.isGold,
        phone: req.body.phone
    }, 
    {
        new: true
    });

    if(!customer) return res.status(404).send('No ID found');

    res.send(customer);
});

// delete customer
router.delete("/:id", async (req, res) => {
    const customer = await Customer.findByIdAndRemove(req.params.id);

    if(!customer) return res.status(404).send('No ID found');
    res.send(customer);
});

// get one customer
router.get("/:id", async (req, res) => {
    const customer = await Customer.findById(req.params.id);

    if(!customer) return res.status(404).send('No ID found');
    res.send(customer);
});
 */

module.exports = router;
