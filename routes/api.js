var express = require('express');
var router = express.Router();
const url = require('url');
const crypto = require("crypto");
const upload = require('express-fileupload');
const FormData = require('form-data')
const path = require('path')
let bcrypt = require('bcrypt');
const saltRounds = 10;

module.exports = function (pool) {

    // pool.query('SELECT * FROM iklan', (err, rows) => {
    //     console.log(rows.rows)
    // })

    router.get('/:page', function (req, res, next) {
        const search = req.query.search

        pool.query('SELECT lokasi FROM iklan', (err, data) => {
            const result = data.rows
            let lokasi = []
            let isLok = false
            result.forEach(item => {
                if (search && item.lokasi.toLowerCase().includes(search.toLowerCase())) {
                    lokasi.push(item.lokasi)
                    isLok = true
                }
            });
            const per_page = 3;
            const page = req.params.page || 1;
            const queryObject = url.parse(req.url, true).search;
            let params = [];
            if (search && Number(search)) {
                params.push(`harga = '${search}'`)
            }
            if (search && Number(search)) {
                params.push(`harga = '${search}'`)
            }
            if (search && Number(search)) {
                params.push(`id = '${search}'`)
            }
            if (search && isLok) {
                if (lokasi.length > 0) {
                    let locs = ''
                    for (let i = 0; i < lokasi.length; i++) {
                        locs += ` lokasi = '${lokasi[i]}' ${i == lokasi.length - 1 ? "" : "OR"}`
                    }
                    params.push(`${locs}`)
                } else {
                    params.push(lokasi)
                }

            }
            if (search) {
                params.push(`foto = '${search}'`)
            }
            var sql = `SELECT * FROM iklan`;
            if (params.length > 0) {
                sql += ` WHERE `;
                for (let i = 0; i < params.length; i++) {
                    sql += `${params[i]}`;
                    if (params.length != i + 1) {
                        sql += ` OR `;
                    }
                }
            }
            // const sql = 'SELECT * FROM iklan ORDER BY id ASC';
            pool.query(sql, (err, rows) => {
                if (err) { res.status(400).json({ "error": err.message }); return; }
                sql += ` ORDER BY id DESC LIMIT 3 OFFSET ${(page - 1) * per_page} `;
                pool.query(sql, (err, data) => {
                    if (err) { res.status(400).json({ "error": err.message }); return; }
                    // res.json(rowsFilt.rows);
                    res.status(200).json({
                        data: data.rows,
                        current: page,
                        filter: queryObject,
                        next_page: parseInt(page) + 1,
                        previous_page: parseInt(page) - 1,
                        pages: Math.ceil(rows.rows.length / per_page)
                    });
                });
            })
        });
    })
    router.get('/:page/kategori=sewa', function (req, res, next) {
        const per_page = 3;
        const page = req.params.page || 1;
        const queryObject = url.parse(req.url, true).search;
        let sql = `SELECT * FROM iklan WHERE isJual = false `
        pool.query(sql, (err, data) => {
            if (err) return err
            sql += `ORDER BY id ASC LIMIT 3 OFFSET ${(page - 1) * per_page} `
            pool.query(sql, (err, rows) => {
                if (err) { res.status(400).json({ "error": err.message }); return; }
                // res.json(rowsFilt.rows);
                res.status(200).json({
                    data: rows.rows,
                    current: page,
                    filter: queryObject,
                    next_page: parseInt(page) + 1,
                    previous_page: parseInt(page) - 1,
                    pages: Math.ceil(data.rows.length / per_page)
                });
            });
        })
    });

    router.get('/:page/kategori=jual', function (req, res, next) {
        const per_page = 3;
        const page = req.params.page || 1;
        const queryObject = url.parse(req.url, true).search;
        let sql = `SELECT * FROM iklan WHERE isjual = true `
        pool.query(sql, (err, data) => {
            if (err) return err
            sql += `ORDER BY id ASC LIMIT 3 OFFSET ${(page - 1) * per_page} `
            pool.query(sql, (err, rows) => {
                if (err) { res.status(400).json({ "error": err.message }); return; }
                if (err) { res.status(400).json({ "error": err.message }); return; }
                // res.json(rowsFilt.rows);
                res.status(200).json({
                    data: rows.rows,
                    current: page,
                    filter: queryObject,
                    next_page: parseInt(page) + 1,
                    previous_page: parseInt(page) - 1,
                    pages: Math.ceil(data.rows.length / per_page)
                });
            });
        })
    })

    router.post('/signup', (req, res) => {
        var { username, no_tlp, email, password } = req.body;
        bcrypt.hash(password, saltRounds, function (err, hash) {
            if (err) return res.send('Hashing Gagal')
            var sql_insert = `INSERT INTO users (username,no_tlp, email, password) VALUES ('${username}','${no_tlp}', '${email}', '${hash}')`;
            pool.query(sql_insert, (err, result) => {
                console.log(sql_insert)
                if (err) {
                    console.log(err)
                    res.status(201).json({
                        msg: 'insertfailed'
                    })
                } else {
                    console.log('success')
                    res.status(201).json({
                        msg: 'success'
                    });
                }
            })

        });
    });
    router.post('/signin', (req, res) => {
        var { email, password } = req.body;
        var sql = `SELECT * FROM users WHERE email = '${email}'`;
        pool.query(sql, (err, result) => {
            if (result.rows.length != 0) {
                pool.query(sql, (err, result) => {
                    bcrypt.compare(password, result.rows[0].password, function (err, result2) {
                        console.log(result2)
                        if (result2) {
                            console.log('berhasil')
                            let user = result.rows[0];
                            req.session.user = user;
                            req.session.loggedIn = true;
                            res.json({
                                msg: 'logged_in',
                                session: req.session.user
                            })
                        } else {
                            console.log('gagal')
                            res.json({
                                msg: 'not_match'
                            })
                        }
                    });
                })
            } else {
                res.send('gagal')
            }
        })
    })

    // router.post('/signin', (req, res) => {
    //     var { email, password } = req.body;
    //     var sql = `SELECT * FROM users WHERE email = '${email}'`
    //     pool.query(sql, (err, result) => {
    //         if (result.rows.length != 0) {
    //             var sql2 = `SELECT * FROM users WHERE email = '${email}'`
    //             pool.query(sql2, (err, result) => {
    //                 bcrypt.compare(password, result.rows[0].password_hash, function (err, result2) {
    //                     if (result2) {
    //                         const user = result.rows[0];
    //                         req.session.user = user;
    //                         req.session.loggedIn = true;
    //                         res.json({
    //                             msg: 'logged_in',
    //                             session: req.session.user
    //                         })
    //                     } else {
    //                         res.json({
    //                             msg: 'not_match'
    //                         })
    //                     }
    //                 });
    //             })
    //         } else {
    //             res.json({
    //                 msg: 'not_match'
    //             })
    //         }
    //     })
    // })

    // router.get('/profil/:id', (req, res) => {
    //     const { id } = req.params;
    //     console.log(id)
    //     var sql = `SELECT * FROM member WHERE id = ${id}`;
    //     pool.query(sql, (err, result) => {
    //         if (err) {
    //             res.json({
    //                 msg: err
    //             });
    //         } else {
    //             res.json(result.rows);
    //         }
    //     })
    // })

    // router.put('/profil/:id', (req, res) => {
    //     var { id } = req.params;
    //     var { nama_lengkap, jenis_kelamin, no_telp, tgl_lahir, alamat, email } = req.body;

    //     var sql = `UPDATE member SET nama_lengkap = '${nama_lengkap}', jenis_kelamin = '${jenis_kelamin}', no_telp = '${no_telp}', tgl_lahir = '${tgl_lahir}', alamat = '${alamat}', email = '${email}' WHERE id = ${id}`;

    //     pool.query(sql, (err, result) => {
    //         if (err) {
    //             res.send('Gagal');
    //         }
    //         res.json({
    //             msg: 'Berhasil update Data'
    //         })
    //     })
    // })

    // router.get('/iklan', (req, res) => {
    //     const per_page = 3;
    //     const page = req.params.page || 1;
    //     var sql_all = `SELECT * FROM iklan ORDER BY created_date DESC`;
    //     pool.query(sql_all, (err, result_all) => {
    //         if (err) { res.status(400).json({ "error": err.message }); return; }
    //         var sql = `SELECT * FROM iklan ORDER BY created_date DESC LIMIT 3`;
    //         pool.query(sql, (err, result) => {
    //             if (err) {
    //                 res.send('Gagal memuat data')
    //             } else {
    //                 res.json({
    //                     data: result.rows,
    //                     current: page,
    //                     pages: Math.ceil(result_all.rows.length / per_page),
    //                     next_page: parseInt(page) + 1,
    //                     previous_page: parseInt(page) - 1
    //                 })
    //             }
    //         })
    //     })
    // })

    // router.get('/iklan/:page/:harga/:kategori', (req, res) => {
    //     const per_page = 3;
    //     const page = req.params.page || 1;
    //     const harga = req.params.harga;
    //     const kategori = req.params.kategori;

    //     var sql_all = `SELECT * FROM iklan ${kategori !== 'def' ? 'WHERE kategori = ' + kategori : ''} ORDER BY ${harga !== 'def' ? 'harga' : 'created_date'} ${harga !== 'def' ? harga : 'DESC'}`;
    //     pool.query(sql_all, (err, result_all) => {
    //         if (err) { res.status(400).json({ "error": err.message }); return; }
    //         var sql = `SELECT * FROM iklan ${kategori !== 'def' ? 'WHERE kategori = ' + kategori : ''} ORDER BY ${harga !== 'def' ? 'harga' : 'created_date'} ${harga !== 'def' ? harga : 'DESC'} LIMIT 3 OFFSET ${(page - 1) * per_page}`;
    //         console.log(sql)
    //         pool.query(sql, (err, result) => {
    //             if (err) {
    //                 res.send('Gagal memuat data')
    //             } else {
    //                 res.json({
    //                     data: result.rows,
    //                     current: page,
    //                     pages: Math.ceil(result_all.rows.length / per_page),
    //                     next_page: parseInt(page) + 1,
    //                     previous_page: parseInt(page) - 1
    //                 })
    //             }
    //         })
    //     })
    // })

    // router.post('/iklan', (req, res) => {
    //     var { alamat, harga, ukuran, coordinate, deskripsi, id_member, kategori, kamar_mandi, kamar_tidur, sertifikat, lantai } = req.body;

    //     function makeid(length) {
    //         var result = '';
    //         var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    //         var charactersLength = characters.length;
    //         for (var i = 0; i < length; i++) {
    //             result += characters.charAt(Math.floor(Math.random() * charactersLength));
    //         }
    //         return result;
    //     }
    //     var today = new Date();
    //     var dd = String(today.getDate()).padStart(2, '0');
    //     var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    //     var yyyy = today.getFullYear();

    //     today = mm + '_' + yyyy;

    //     if (!req.files || Object.keys(req.files).length === 0) {
    //         return res.status(400).send('No files were uploaded.');
    //     }
    //     var filename = []
    //     let sizeFiles = Object.keys(req.files.file).length;
    //     for (let i = 0; i < sizeFiles; i++) {
    //         // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    //         let foto = req.files.file[i];
    //         filename.push(today + '_' + makeid(10) + i + '.jpg');
    //         // Use the mv() method to place the file somewhere on your server
    //         foto.mv(path.join(__dirname, '..', 'public', 'images', 'uploads', filename[i]), function (err) {
    //             if (err) return res.status(500).send(err);
    //         });
    //     }

    //     const filenameRen = filename.join(',');

    //     var sql = `INSERT INTO iklan (alamat, harga, ukuran, coordinate, deskripsi, gambar, id_member, status, kategori, created_date, kamar_mandi, kamar_tidur, sertifikat, lantai) VALUES ('${alamat}', ${harga}, ${ukuran}, '${coordinate}', '${deskripsi}', '${filenameRen}', ${id_member}, 0, ${kategori}, current_timestamp, ${kamar_mandi}, ${kamar_tidur}, '${sertifikat}', '${lantai}')`
    //     pool.query(sql, (err, result) => {
    //         if (err) {
    //             res.send('Gagal')
    //         } else {
    //             res.json({
    //                 msg: 'success'
    //             })
    //         }
    //     })
    // })

    // router.put('/changepp/:id', (req, res) => {
    //     var { id } = req.params;

    //     function makeid(length) {
    //         var result = '';
    //         var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    //         var charactersLength = characters.length;
    //         for (var i = 0; i < length; i++) {
    //             result += characters.charAt(Math.floor(Math.random() * charactersLength));
    //         }
    //         return result;
    //     }
    //     var today = new Date();
    //     var dd = String(today.getDate()).padStart(2, '0');
    //     var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    //     var yyyy = today.getFullYear();

    //     today = mm + '_' + yyyy;

    //     if (!req.files || Object.keys(req.files).length === 0) {
    //         return res.status(400).send('No files were uploaded.');
    //     }

    //     // // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    //     let foto = req.files.file;
    //     let filename = today + '_' + makeid(10) + '0' + '.jpg';

    //     // // Use the mv() method to place the file somewhere on your server
    //     foto.mv(path.join(__dirname, '..', 'public', 'images', 'uploads', 'users', filename), function (err) {
    //         if (err) return res.status(500).send(err);
    //     });

    //     console.log(filename)

    //     var sql = `UPDATE member SET gambar = '${filename}' WHERE id = ${id}`;
    //     console.log(sql)
    //     pool.query(sql, (err, result) => {
    //         if (err) {
    //             res.send('Gagal')
    //         } else {
    //             res.json({
    //                 msg: 'success'
    //             })
    //         }
    //     })
    // })

    // router.post('/cekoldpass/:id', (req, res) => {
    //     var { id } = req.params;
    //     var { password_hash } = req.body;

    //     var sql = `SELECT password_hash FROM member WHERE id = ${id}`;
    //     console.log(sql)
    //     pool.query(sql, (err, result) => {
    //         if (err) {
    //             res.send('Query failed')
    //         } else {
    //             console.log()
    //             bcrypt.compare(password_hash, result.rows[0].password_hash, function (err, hasil) {
    //                 // result == true
    //                 if (hasil) {
    //                     res.json({
    //                         msg: 'true'
    //                     })
    //                 } else {
    //                     res.json({
    //                         msg: 'false'
    //                     })
    //                 }
    //             });
    //         }
    //     })
    // })

    // router.get('/compare/:id', (req, res) => {
    //     var { id } = req.params;
    //     let rep = id.split('+').join(',')
    //     var sql = `SELECT * FROM iklan WHERE id_iklan IN (${rep})`;
    //     pool.query(sql, (err, result) => {
    //         if (err) {
    //             res.send('Gagal memuat data iklan')
    //         } else {
    //             res.json(result.rows)
    //         }
    //     })
    // })

    // router.get('/properties-details/:id', (req, res) => {
    //     var { id } = req.params;
    //     var sql = `SELECT i.*, m.nama_lengkap, m.no_telp FROM iklan as i LEFT JOIN member as m ON i.id_member = m.id WHERE i.id_iklan = ${id}`;
    //     pool.query(sql, (err, result) => {
    //         if (err) {
    //             res.send('Gagal memuat data iklan')
    //         } else {
    //             res.json(result.rows)
    //         }
    //     })
    // })

    // router.put('/changepassword/:id', (req, res) => {
    //     var { id } = req.params;
    //     var { password } = req.body;

    //     let myKey = crypto.createCipher("aes-128-cbc", "mypassword");
    //     let myStr = myKey.update(password, "utf8", "hex");
    //     myStr += myKey.final("hex");

    //     const hashPass = myStr;
    //     var sql = `SELECT password_hash FROM member WHERE id = ${id}`;
    //     pool.query(sql, (err, result) => {
    //         if (result.rows.password_hash === hashPass) {
    //             var sql_update = `UPDATE member SET password_hash = '${hashPass}' WHERE id = ${id}`;
    //             pool.query(sql_update, (err, result) => {
    //                 if (err) res.send('Gagal');
    //                 res.json({
    //                     msg: 'Berhasil update Password'
    //                 })
    //             })
    //         } else {
    //             res.json({
    //                 msg: 'Password lama Salah.'
    //             })
    //         }
    //     })

    // })

    // router.get('/coordinate', (req, res) => {
    //     var sql = "SELECT coordinate FROM iklan";
    //     pool.query(sql, (err, result) => {
    //         if (err) {
    //             res.send('Gagal')
    //         } else {
    //             res.json({
    //                 data: result.rows
    //             })
    //         }
    //     })
    // })

    // router.get('/logout', (req, res) => {
    //     req.session.destroy(function (err) {
    //         res.json({
    //             msg: 'success'
    //         })
    //     })
    // })

    // router.post('/signup', (req, res) => {
    //     var { nama_lengkap, jenis_kelamin, no_telp, tgl_lahir, alamat, email, password_member } = req.body;

    //     var sql = `SELECT * FROM member WHERE email = '${email}'`;
    //     pool.query(sql, (err, result) => {
    //         if (err) {
    //             res.send('Gagal');
    //         } else {
    //             if (result.rows.length > 0) {
    //                 res.json({
    //                     data: result.rows.length,
    //                     msg: 'emailexist'
    //                 });
    //             } else {
    //                 bcrypt.hash(password_member, saltRounds, function (err, hash) {
    //                     if (err) {
    //                         res.send('Gagal ngehash')
    //                     }
    //                     var sql_insert = `INSERT INTO member (nama_lengkap, jenis_kelamin, tgl_lahir, alamat, no_telp, email, password_hash, date_created) VALUES ('${nama_lengkap}', '${jenis_kelamin}', '${tgl_lahir}', '${alamat}', '${no_telp}', '${email}', '${hash}', current_timestamp)`;
    //                     pool.query(sql_insert, (err, result) => {
    //                         if (err) {
    //                             res.json({
    //                                 msg: 'insertfailed'
    //                             })
    //                         } else {
    //                             res.json({
    //                                 msg: 'success'
    //                             });
    //                         }
    //                     })
    //                 });
    //             }
    //         }
    //     })
    // });

    return router;
}