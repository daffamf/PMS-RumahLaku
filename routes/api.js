var express = require('express');
var path = require('path');
var router = express.Router();
const url = require('url');
let bcrypt = require('bcrypt');
const saltRounds = 10;
const fileUpload = require('express-fileupload');

router.use(fileUpload())

module.exports = function (pool) {

    // pool.query('SELECT * FROM iklan', (err, rows) => {
    //     console.log(rows.rows)
    // })
    router.get('/coordinate', (req, res) => {
        var sql = "SELECT coordinate FROM iklan";
        pool.query(sql, (err, result) => {
            if (err) {
                res.send('Gagal')
            } else {
                res.json({
                    data: result.rows
                })
            }
        })
    })

    router.get('/:page', function (req, res, next) {
        const search = req.query.search
        pool.query('SELECT lokasi FROM iklan', (err, result_lok) => {
            const result = result_lok.rows
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
        const search = req.query.search
        pool.query('SELECT lokasi FROM iklan WHERE isjual = false', (err, lok_sewa) => {
            const result_sewa = lok_sewa.rows
            console.log(result_sewa)
            let lokasi_sewa = []
            let isLok_sewa = false
            result_sewa.forEach(item => {
                if (search && item.lokasi.toLowerCase().includes(search.toLowerCase())) {
                    lokasi_sewa.push(item.lokasi)
                    isLok_sewa = true
                }
            });

            const per_page = 3;
            const page = req.params.page || 1;
            const queryObject = url.parse(req.url, true).search;
            let params_sewa = [];
            if (search && Number(search)) {
                params_sewa.push(`harga = '${search}'`)
            }
            if (search && Number(search)) {
                params_sewa.push(`harga = '${search}'`)
            }
            if (search && Number(search)) {
                params_sewa.push(`id = '${search}'`)
            }
            if (search && isLok_sewa) {
                if (lokasi_sewa.length > 0) {
                    let locs = ''
                    for (let i = 0; i < lokasi_sewa.length; i++) {
                        locs += ` lokasi = '${lokasi_sewa[i]}' ${i == lokasi_sewa.length - 1 ? "" : "OR"}`
                    }
                    params_sewa.push(`${locs}`)
                } else {
                    params_sewa.push(lokasi_sewa)
                }

            }
            var sql = `SELECT * FROM iklan WHERE isJual = false `;
            if (params_sewa.length > 0) {
                sql += ` WHERE `;
                for (let i = 0; i < params_sewa.length; i++) {
                    sql += `${params_sewa[i]}`;
                    if (params_sewa.length != i + 1) {
                        sql += ` OR `;
                    }
                }
            }
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
    })

    router.get('/:page/kategori=jual', function (req, res, next) {
        const search = req.query.search
        pool.query('SELECT lokasi FROM iklan WHERE isjual = true', (err, lok_jual) => {
            const result_jual = lok_jual.rows
            let lokasi_jual = []
            let isLok_jual = false
            result_jual.forEach(item => {
                if (search && item.lokasi.toLowerCase().includes(search.toLowerCase())) {
                    lokasi_jual.push(item.lokasi)
                    isLok_jual = true
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
            if (search && isLok_jual) {
                if (lokasi_jual.length > 0) {
                    let locs = ''
                    for (let i = 0; i < lokasi_jual.length; i++) {
                        locs += ` lokasi = '${lokasi_jual[i]}' ${i == lokasi_jual.length - 1 ? "" : "OR"}`
                    }
                    params.push(`${locs}`)
                } else {
                    params.push(lokasi_jual)
                }

            }
            if (search) {
                params.push(`foto = '${search}'`)
            }
            var sql = `SELECT * FROM iklan WHERE isJual = true `;
            if (params.length > 0) {
                sql += ` WHERE `;
                for (let i = 0; i < params.length; i++) {
                    sql += `${params[i]}`;
                    if (params.length != i + 1) {
                        sql += ` OR `;
                    }
                }
            }
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
    })


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

    router.get('/compare/:id', (req, res) => {
        var { id } = req.params;
        let rep = id.split('+').join(',')
        var sql = `SELECT * FROM iklan WHERE id IN (${rep})`;
        pool.query(sql, (err, result) => {
            if (err) {
                res.send('Gagal memuat data iklan')
            } else {
                res.json(result.rows)
            }
        })
    })

    router.get('/detail/:id', (req, res) => {
        var { id } = req.params;
        var sql = `SELECT i.*, u.username, u.no_tlp FROM iklan as i LEFT JOIN users as u ON i.id_users = u.id WHERE i.id = ${id}`;
        pool.query(sql, (err, result) => {
            if (err) {
                res.send('Gagal memuat data iklan')
            } else {
                res.json({
                    data: result.rows[0],
                })

            }
        })
    })

    router.post('/upload', function (req, res) {
        var { alamat, harga, isNego, luasTanah, koordinat, desc, id_users, kmrmandi, kamar, kategori, judul } = req.body;
        console.log(alamat)
        function makeid(length) {
            var result = '';
            var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            var charactersLength = characters.length;
            for (var i = 0; i < length; i++) {
                result += characters.charAt(Math.floor(Math.random() * charactersLength));
            }
            return result;
        }

        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = today.getFullYear();

        today = mm + '_' + yyyy;

        let __dirname = '/home/rubicamp/Batch24/pms/public/images/upload/'

        if (!req.files || Object.keys(req.files).length === 0) {
            return res.send("Gagal")
        }
        var filename = []
        let sizeFiles = Object.keys(req.files.sampleFile).length;
        console.log(sizeFiles)
        if (sizeFiles.length == 'undefined') {
            sampleFile = req.files.sampleFile;
            filename.push(today + '_' + makeid(10) + 1 + '.jpg');
            uploadPath = __dirname + filename
            // Use the mv() method to place the file somewhere on your server
            sampleFile.mv(uploadPath, function (err) {
                if (err)
                    return res.status(500).send(err);
            })
            var sql1 = `INSERT INTO iklan (lokasi, coordinate,jml_kamar, isnego,foto,harga,isjual,  id_users,luastanah, deskripsi,created_date, kmr_mandi,judul) VALUES ('${alamat}', '${koordinat}', ${kamar}, ${isNego == 'on' ? true : false},'${filename}', ${harga}, ${kategori == 'jual' ? true : false}, ${Number(id_users)}, ${luasTanah}, '${desc}', current_timestamp, ${kmrmandi},'${judul}')`
            pool.query(sql1, (err, result) => {
                if (err) {
                    console.log(err)
                } else {
                    res.redirect('/')
                }
            })
        } else {
            for (let i = 0; i < sizeFiles; i++) {
                // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
                let foto = req.files.sampleFile[i];
                filename.push(today + '_' + makeid(10) + i + '.jpg');
                // Use the mv() method to place the file somewhere on your server
                foto.mv(path.join(__dirname + filename[i]), function (err) {
                    if (err) return err
                })
            }
            const filenameRen = filename.join(',');
            var sql2 = `INSERT INTO iklan (lokasi, coordinate,jml_kamar, isnego,foto,harga,isjual,  id_users,luastanah, deskripsi,created_date, kmr_mandi,judul) VALUES ('${alamat}', '${koordinat}', ${kamar}, ${isNego == 'on' ? true : false},'${filenameRen}', ${harga}, ${kategori == 'jual' ? true : false}, ${Number(id_users)}, ${luasTanah}, '${desc}', current_timestamp, ${kmrmandi},'${judul}')`
            pool.query(sql2, (err, result) => {
                if (err) {
                    console.log(err)
                } else {
                    res.redirect('/')
                }
            })
        }

    });

    router.post('/signup', (req, res) => {
        var { username, no_tlp, email, password, repas } = req.body;
        
        var sql = `SELECT * FROM users WHERE email = '${email}'`;
        pool.query(sql, (err, result) => {
            if (err) {
                res.json({ msg: 'Gagal' });
            } else {
                if (result.rows.length > 0) {
                    res.json({
                        data: result.rows.length,
                        msg: 'emailexist'
                    });
                } else {
                    if (password !== repas) {
                        res.json({
                            data: result.rows.length,
                            msg: 'password not match'
                        })
                    } else {
                        bcrypt.hash(password, saltRounds, function (err, hash) {
                            if (err) {
                                res.send('Gagal ngehash')
                            }
                            var sql_insert = `INSERT INTO users (username,no_tlp, email, password, created_date) VALUES ('${username}', '${no_tlp}', '${email}', '${hash}', current_timestamp)`;
                            pool.query(sql_insert, (err, result) => {
                                if (err) {
                                    res.json({
                                        msg: 'insertfailed'
                                    })
                                } else {
                                    res.json({
                                        msg: 'success'
                                    });
                                }
                            })
                        });
                    }
                }
            }
        })
    });


    return router;
}
