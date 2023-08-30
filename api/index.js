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

let refreshTokens = [];

const generateAccessToken = (user) => {
  // Generate and access token
  const accessToken = jwt.sign(
    { id: user.id, isAdmin: user.isAdmin },
    "mysecretkey",
    { expiresIn: "15m" }
  );

  return accessToken;
};

const generateRefreshToken = (user) => {
  // Generate and access token
  const accessToken = jwt.sign(
    { id: user.id, isAdmin: user.isAdmin },
    "myrefreshsecretkey",
    { expiresIn: "15m" }
  );

  return accessToken;
};

app.get("/", (req, res) => {
  res.json(refreshTokens);
});

app.post("/api/refresh", (req, res) => {
  // take the refresh token from the user
  const refreshToken = req.body.token;

  // send error if no token or token not valid
  if (!refreshToken)
    return res.json({ message: "You are not authenticated/logged in!" });

  if (!refreshTokens.includes(refreshToken)) {
    res.json({ message: "refresh token is not valid" });
  }

  jwt.verify(refreshToken, "myrefreshsecretkey", (err, user) => {
    err && console.log(err);

    refreshTokens = refreshTokens.filter((token) => token !== refreshToken);

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    refreshTokens.push(newRefreshToken);

    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  });

  // if everything is ok, create new access token, refresh token  and send to user
});

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

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  refreshTokens.push(refreshToken);
  res.json({
    username: user.username,
    isAdmin: user.isAdmin,
    accessToken,
    refreshToken,
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
