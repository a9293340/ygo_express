const express = require("express");
const router = express.Router();

const { MongooseCRUD } = require("../config/MongoDb/Api");

router.get("/list", (req, res, next) => {
  MongooseCRUD("R", "admin", {}, {}, {}).then((arr, err) => {
    if (err) {
      res.status(404);
      res.json({ status: "failed", data: [] });
    } else {
      res.status(200);
      res.json({ status: "success", data: arr });
    }
  });
});

router.post("/add", (req, res) => {
  MongooseCRUD("C", "admin", req.body).then((arr, err) => {
    if (err) {
      res.status(404);
      res.json({ status: "failed", data: [] });
    } else {
      res.status(201);
      res.json({ status: "success", data: [] });
    }
  });
});

module.exports = router;
