const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const multer = require("multer");

dotenv.config();
const mysql = require("mysql2");
const pool = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
});

class UserController {
  static userRegistration = async (req, res) => {
    try {
      const { name, email, password, password_confirm } = req.body;
      const result = await pool
        .promise()
        .query(`SELECT * FROM users WHERE email = ?`, [email]);
      const user = result[0];
      if (user.length > 0) {
        return res
          .status(400)
          .json({ status: "failed", message: "Email already exists" });
      }
      if (!name || !email || !password || !password_confirm) {
        return res
          .status(400)
          .json({ status: "failed", message: "All fields are required" });
      }
      if (password !== password_confirm) {
        return res
          .status(400)
          .json({ status: "failed", message: "Passwords do not match" });
      }

      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(password, salt);
      const insertResult = await pool
        .promise()
        .query("INSERT INTO users SET ?", {
          name: name,
          email: email,
          password: hashPassword,
        });
      const saved_user_id = insertResult[0].insertId;
      // generate JWT token
      const secret = process.env.JWT_SECRET_KEY;
      const token = jwt.sign({ userID: saved_user_id }, secret, {
        expiresIn: "5d",
      });
      res.json({
        status: "success",
        message: "Registration success",
        token: token,
      });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ status: "failed", message: "Internal server error" });
    }
  };

  static userLogin = async (req, res) => {
    try {
      const { email, password } = req.body;
      if (email && password) {
        const [rows, fields] = await pool
          .promise()
          .query("SELECT * FROM users WHERE email = ?", [email]);
        const user = rows[0];
        if (user !== null) {
          const isMatch = await bcrypt.compare(password, user.password);
          if (user.email === email && isMatch) {
            //generate JWT token
            const secret = process.env.JWT_SECRET_KEY;
            const token = jwt.sign({ userID: user.id }, secret, {
              expiresIn: "5d",
            });
            res.send({
              status: "success",
              message: "Login successfully",
              token: token,
              user: user,
            });
          } else {
            res.send({
              status: "failed",
              message: isMatch ? "Email is incorrect" : "Password is incorrect",
            });
          }
        } else {
          res.send({
            status: "failed",
            message: "Your are not a Registered User",
          });
        }
      } else {
        res.send({ status: "failed", message: "All fields are required" });
      }
    } catch (error) {
      console.log(error);
      res.send({ status: "failed", message: "Invalid Credentials" });
    }
  };

  static changeUserPassword = async (req, res) => {
    const { password, password_confirm } = req.body;
    console.log(req.body);
    if (password && password_confirm) {
      if (password !== password_confirm) {
        res.send({
          status: "failed",
          message: "Password and Password-confirm doesnot match",
        });
      } else {
        const salt = await bcrypt.genSalt(10);
        const newHashPassword = await bcrypt.hash(password, salt);
        await pool
          .promise()
          .query("UPDATE users SET password = ? WHERE id = ?", [
            newHashPassword,
            req.body.id,
          ]);
        console.log(req.users);
        res.send({
          status: "success",
          message: "Password Changed Succesfully",
        });
      }
    } else {
      res.send({ status: "failed", message: "All fields are required" });
    }
  };

  static changeUserDetails = async (req, res) => {
    const { name, email, id } = req.body;
    console.log(name, email, id);
    console.log(req.body);
    if (name || email || id) {
      const query =
        "UPDATE users SET " +
        (name ? "name = ?, " : "") +
        (email ? "email = ? " : "") +
        "WHERE id = ?";
      const values = [name, email, id].filter((value) => value !== undefined);
      await pool.promise().query(query, values);
      console.log(req.users);
      res.send({
        status: "success",
        message: "User Details Changed Successfully",
      });
    } else {
      res.send({ status: "failed", message: "At least one field is required" });
    }
  };
  static changeUserProfilePhoto = async (req, res) => {
    const userProfilePhoto = req.file.filename;
    const id = req.params.id;
    pool.query(
      "UPDATE users SET userProfilePhoto = ? WHERE id = ?",
      [userProfilePhoto, id],
      function (error) {
        if (error) throw error;
        res.send("Profile photo updated successfully");
      }
    );
  };

  static loggedUser = async (req, res) => {
    res.send({ user: req.user });
  };

  static deleteUserById = async (req, res) => {
    const id = req.params.id;
    const sql = `UPDATE users SET isDeleted='true' WHERE id = ${id}`;
    pool.query(
      "SELECT * FROM users WHERE id = ?",
      [id],
      function (error, results, fields) {
        if (error) {
          console.error(error);
          res.status(500).send({ error: "Internal Server Error" });
        }
        if (results.length < 1) {
          res.status(404).send({ error: "No user found with the given id" });
        } else {
          pool.query(sql, function (error) {
            if (error) {
              console.error(error);
              res.status(500).send({ error: "Internal Server Error" });
            } else {
              res.send("User Deleted Successfully (soft delete)");
            }
          });
        }
      }
    );
  };
  static loadAllUsers = async (req, res) => {
    pool.query(
      "SELECT * FROM users WHERE isDeleted='false'",
      function (error, results, fields) {
        if (error) throw error;
        res.send(results);
      }
    );
  };

  static getSingleUser = async (req, res) => {
    const id = req.params.id;
    pool.query(
      "SELECT * FROM users WHERE isDeleted='false' AND id = ?",
      [id],
      function (error, results, fields) {
        if (error) throw error;
        res.send(results);
      }
    );
  };

  static updateUser = async (req, res) => {
    const id = req.params.id;
    const { name, email, password, role } = req.body;
    console.log(req);
    const { filename } = req.file;
    const salt = await bcrypt.genSalt(10);
    const newHashPassword = await bcrypt.hash(password, salt);
    pool.query(
      "UPDATE users SET name=?, email=?,password=?, userProfilePhoto=?,role=? WHERE id = ?",
      [name, email, newHashPassword, filename, role, id],
      function (error, results, fields) {
        if (error) throw error;
        res.send("user updated in the database");
      }
    );
  };
}
module.exports = UserController;
