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
    const { name, email, password, password_confirm } = req.body;
    const result = await pool
      .promise()
      .query(`SELECT * FROM users WHERE email = ?`, [email]);
    const user = result[0];
    if (user.length > 0) {
      res.send({ status: "failed", message: "Email already exit" });
    } else {
      if (name && email && password && password_confirm) {
        if (password === password_confirm) {
          try {
            const salt = await bcrypt.genSalt(10);
            const hashPassword = await bcrypt.hash(password, salt);

            pool.promise().query("INSERT INTO users SET ?", {
              name: name,
              email: email,
              password: hashPassword,
            });

            const [rows, fields] = await pool
              .promise()
              .query("SELECT * FROM users WHERE email = ?", [email]);
            //  const saved_user =  await pool.promise().query('SELECT * FROM users WHERE email = ?', [email]);
            const saved_user = rows[0];
            console.log(saved_user.id);
            // generate JWT token
            const secret = process.env.JWT_SECRET_KEY;
            const token = jwt.sign({ userID: saved_user.id }, secret, {
              expiresIn: "5d",
            });
            console.log(token);
            res.send({
              status: "success",
              message: "Registration success",
              token: token,
            });
          } catch (error) {
            console.log(error);
          }
        } else {
          res.send({
            status: "failed",
            message: "password and password_confirm doesnot match",
          });
        }
      } else {
        res.send({ status: "failed", message: "All fields are required" });
      }
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
              message: "Email or password doesnot match",
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
    const { name, email } = req.body;
    console.log(req.body);
    if (name && email) {
      await pool
        .promise()
        .query("UPDATE users SET  name = ?, email = ? WHERE id = ?", [
          name,
          email,
          req.body.id,
        ]);
      console.log(req.users);
      res.send({
        status: "success",
        message: "User Details Changed Succesfully",
      });
    } else {
      res.send({ status: "failed", message: "All fields are required" });
    }
  };

  static changeUserProfilePhoto = async (req, res) => {
    const { filename } = req.file;
    const id = req.body.userId;
    pool.query(
      "UPDATE users SET userProfilePhoto = ? WHERE id = ?",
      [filename, id],
      function (error) {
        if (error) throw error;
        res.send("Profile photo updated successfully");
      }
    );
  };

  static loggedUser = async (req, res) => {
    res.send({ user: req.user });
  };

  // static deleteUserById = async (req, res) => {
  //   const id = req.params.id;
  //   const sql = `DELETE FROM users WHERE id = ${id}`;
  //   pool.query(
  //     "SELECT * FROM users WHERE id = ?",
  //     [id],
  //     function (error, results, fields) {
  //       if (error) {
  //         console.error(error);
  //         res.status(500).send({ error: "Internal Server Error" });
  //       }
  //       if (results.length < 1) {
  //         res.status(404).send({ error: "No user found with the given id" });
  //       } else {
  //         pool.query(sql, function (error) {
  //           if (error) {
  //             console.error(error);
  //             res.status(500).send({ error: "Internal Server Error" });
  //           } else {
  //             res.send("User Deleted Successfully");
  //           }
  //         });
  //       }
  //     }
  //   );
  // };
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
    pool.query("SELECT * FROM users WHERE isDeleted='false'", function (error, results, fields) {
      if (error) throw error;
      res.send(results);
    });
  };
}
module.exports = UserController;
