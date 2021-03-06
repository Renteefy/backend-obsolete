const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const checkAuth = require("../middleware/check-auth");
const admin = require("firebase-admin");
const serviceAccount = require("../../../renteefy-notification-system-firebase-adminsdk-z3xwc-6e9407d43a.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const firestore = admin.firestore();

const Notification = require("../models/notification");
const User = require("../models/user");
// helper
const getUserObjfromUsername = async (username) => {
  const user = await User.findOne({ username });
  return user;
};

// Add a new notification
router.post("/", checkAuth, async (req, res, next) => {
  const userData = req.userData;
  const user = await getUserObjfromUsername(req.body.owner);
  //console.log(user.email);
  const token = await firestore.collection("users").doc(user.email).get();
  //console.log(token.data().token);
  const notification_options = {
    priority: "high",
    timeToLive: 60 * 60 * 24,
  };
  const message = {
    notification: {
      title: "We have a request for you! 🔔",
      body:
        userData.username + " is interested in your listing! Start chatting. ",
    },
  };
  const options = notification_options;

  const notification = new Notification({
    _id: mongoose.Types.ObjectId(),
    title: req.body.title,
    itemID: req.body.itemID,
    status: req.body.status,
    owner: req.body.owner,
    itemType: req.body.itemType,
    rentee: userData.username,
  });

  notification
    .save()
    .then((result) => {
      console.log(result);
      admin
        .messaging()
        .sendToDevice(token.data().token, message, options)
        .then((response) => {
          res.status(200).json({
            message: "POST in notification",
            id: result._id,
          });
        })
        .catch((error) => {
          console.log(error);
          res.status(500).json({
            error: err,
          });
        });
    })
    .catch((err) => {
      console.log(err);
    });
});

// Get all the notifications in the database
router.get("/", checkAuth, (req, res, next) => {
  Notification.find()
    .select("title status owner rentee itemID itemType")
    .exec()
    .then((docs) => {
      if (docs) {
        const response = {
          count: docs.length,
          notifications: docs.map((doc) => {
            return {
              notificationID: doc._id,
              title: doc.title,
              status: doc.status,
              owner: doc.owner,
              rentee: doc.rentee,
              itemID: doc.itemID,
              itemType: doc.itemType,
            };
          }),
        };
        res.status(200).json(response);
      } else {
        res.status(404).json({ message: "No Valid Entry Found" });
      }
    })
    .catch((err) => {
      console.log(err), res.status(500).json({ error: err });
    });
});

// Get the notification with notification ID
router.get("/notification/:notificationId", checkAuth, (req, res, next) => {
  const notificationId = req.params.notificationId;
  Notification.findById(notificationId)
    .select("title status owner rentee")
    .exec()
    .then((doc) => {
      if (doc) {
        const response = {
          notificationID: doc._id,
          title: doc.title,
          status: doc.status,
          owner: doc.owner,
          rentee: doc.rentee,
          itemID: doc.itemID,
          itemType: doc.itemType,
        };
        res.status(200).json(response);
      } else {
        res.status(404).json({ message: "No Valid Entry Found" });
      }
    })
    .catch((err) => {
      console.log(err), res.status(500).json({ error: err });
    });
});

// Get all the notifications where the owner is the logged in user
router.get("/user/", checkAuth, (req, res, next) => {
  const username = req.userData.username;
  Notification.find({ $or: [{ owner: username }, { rentee: username }] })
    .select("title status owner rentee itemID itemType")
    .exec()
    .then((docs) => {
      if (docs) {
        res.status(200).json(docs);
      } else {
        res.status(404).json({ message: "No Valid Entry Found" });
      }
    })
    .catch((err) => {
      console.log(err), res.status(500).json({ error: err });
    });
});

// Returns whether the user has already sent the request or not
router.get("/user/alreadySent/:assetTitle", checkAuth, (req, res, next) => {
  const username = req.userData.username;
  const assetTitle = req.params.assetTitle;
  Notification.find({ rentee: username, title: assetTitle })
    .select("title status owner rentee itemID")
    .exec()
    .then((docs) => {
      if (docs.length >= 1) {
        res.status(200).json(docs);
      } else {
        res.status(404).json({ message: "No Valid Entry Found" });
      }
    })
    .catch((err) => {
      console.log(err), res.status(500).json({ error: err });
    });
});

// Delete the notification whose notificationId is given
router.delete("/notification/:notificationId", checkAuth, (req, res, next) => {
  Notification.deleteOne({ _id: req.params.notificationId })
    .exec()
    .then((result) => {
      res.status(200).json({
        message: "Notification deleted",
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

// {
//     "changes":[
//         {
//             "propName": "status",
//             "value": "Request Raised"
//         }
//     ]
// }
router.patch(
  "/notification/:notificationId",
  checkAuth,
  async (req, res, next) => {
    const id = req.params.notificationId;
    const updateOps = {};
    console.log(req.body);
    const user = await getUserObjfromUsername(req.body.renteeUsername);
    //console.log(user);
    const token = await firestore.collection("users").doc(user.email).get();
    //console.log(token.data().token);
    const notification_options = {
      priority: "high",
      timeToLive: 60 * 60 * 24,
    };
    const message = {
      notification: {
        title: "We have a request for you! 🔔",
        body:
          req.userData.username +
          " has " +
          req.body.changes[0].value +
          " your request.",
      },
    };
    const options = notification_options;
    for (const ops of req.body.changes) {
      updateOps[ops.propName] = ops.value;
    }

    Notification.updateOne({ _id: id }, { $set: updateOps })
      .exec()
      .then((result) => {
        admin
          .messaging()
          .sendToDevice(token.data().token, message, options)
          .then((response) => {
            res.status(200).json(result);
          })
          .catch((error) => {
            console.log(error);
            res.status(500).json({
              error: err,
            });
          });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ error: err });
      });
  }
);
//get the count of notification for the logged in user
router.post("/user/count", checkAuth, (req, res, next) => {
  const username = req.userData.username;
  Notification.find({ $or: [{ owner: username }, { rentee: username }] })
    .select("title status owner rentee itemID itemType")
    .exec()
    .then((docs) => {
      if (docs) {
        res.status(200).json(docs.length);
      } else {
        res.status(404).json({ message: "No Valid Entry Found" });
      }
    })
    .catch((err) => {
      console.log(err), res.status(500).json({ error: err });
    });
});

module.exports = router;
