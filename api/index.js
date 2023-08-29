import express from "express";
import jwt from "jsonwebtoken";

const app = express();

app.use(express.json());

const users = [
  {
    id: "1",
    username: "john",
    password: "John123!",
    isAdmin: true,
  },
  {
    id: "2",
    username: "jane",
    password: "Jane123!",
    isAdmin: false,
  },
];

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  const user = users.find((u) => {
    return u.username === username && u.password === password;
  });

  if (!user) {
    res.status(400).json({
      message: "no user found",
    });
  }

  // Generate and access token
  const accessToken = jwt.sign(
    { id: user.id, isAdmin: user.isAdmin },
    "mysecretkey",
    { expiresIn: "20s" }
  );
  res.json({
    username: user.username,
    isAdmin: user.isAdmin,
    accessToken,
  });
});

const verify = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.json({ message: "You are not authenticated/logged in!" });
  }

  const token = authHeader.split(" ")[1];
  jwt.verify(token, "mysecretkey", (err, user) => {
    if (err) {
      return res.json({ message: "Token not valid" });
    }
    req.user = user;
    next();
  });
};

app.delete("/api/users/:userId", verify, (req, res) => {
  if (req.user.id === req.params.userId || req.user.isAdmin) {
    res.json({ message: "User is deleted!" });
  }
  res.json({ message: "you are not allowed to delete this user!]" });
});

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
