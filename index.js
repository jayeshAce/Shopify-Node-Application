/* Basic Requirements */

const express = require('express');
const fs = require('fs');
const Shopify = require('@shopify/shopify-api').Shopify;
const ApiVersion = require('@shopify/shopify-api').ApiVersion;
const cookieParser = require("cookie-parser");

const sessions = require('express-session');
const dbConn = require('./config/database');
const oneDay = 1000 * 60 * 60 * 24;
require('dotenv').config();
// var mainRouter = require('./routes/main');
const app = express();

// app.use('/main', mainRouter);
app.set('views', 'views');
app.set('view engine', 'ejs');
app.use(cookieParser());
app.use(function (req, res, next) {
    res.setHeader("frame-ancestors", "none");
    return next();
});
app.use(sessions({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized: true,
    cookie: { maxAge: oneDay },
    resave: false
}));

var session;
const { API_KEY, API_SECRET_KEY, SCOPES, HOST, HOST_SCHEME } = process.env;
Shopify.Context.initialize({
    API_KEY,
    API_SECRET_KEY,
    SCOPES: [SCOPES],
    HOST_NAME: HOST.replace(/https?:\/\//, ""),
    HOST_SCHEME,
    IS_EMBEDDED_APP: false,
    API_VERSION: ApiVersion.July22
});
const ACTIVE_SHOPIFY_SHOPS = {};

/* Basic Requirements */

app.get('/', async (http_request, http_response) => {
    console.log("000000000")
    session = http_request.session;
    console.log("session",session)

    if (http_request.query.shop == undefined) {
        var shop = http_request.cookies.shop;
    } else {
        var shop = http_request.query.shop;
    }
    console.log("shop",shop)

    session.appshop = shop;
    http_response.redirect('/auth/shopify');
});

app.get('/auth/shopify', async (http_request, http_response) => {
    console.log("11111111")

    var session_shop = http_request.session;
    console.log("session_shop",session_shop)

    var shop = session_shop.appshop;
    let authorizedRoute = await Shopify.Auth.beginAuth(
        http_request,
        http_response,
        shop,
        '/auth/shopify/callback',
        false,
    );
    console.log("authorizedRoute",authorizedRoute)

    return http_response.redirect(authorizedRoute);
});
app.get('/auth/shopify/callback', async (http_request, http_response) => {
    console.log("2222222")

    var session_shop = http_request.session;
    var shop = session_shop.appshop;
    console.log("auth/shopify/callback",shop)

    try {
        const client_session = await Shopify.Auth.validateAuthCallback(
            http_request,
            http_response,
            http_request.query);
        ACTIVE_SHOPIFY_SHOPS[shop] = client_session.scope;
    } catch (eek) {
        http_response.send(eek)
    }
    console.log("Doneeee")

    http_response.redirect('/save_to_db');
});


app.get('/save_to_db', async (http_request, http_response) => {
    console.log("3")
    var session_shop = http_request.session;
    console.log("session_shop",session_shop)

    const client_session = await Shopify.Utils.loadCurrentSession(http_request, http_response);
    console.log("client_session",client_session)

    var storename = domain = shop = client_session.shop;
    var access_token = client_session.accessToken;
    console.log("access_token",access_token)

    dbConn.query(
        {
            sql: 'SELECT * FROM `shop_info` WHERE `domain` = ?',
            values: [shop]
        }
        , (err, rows, fields) => {
            if(rows == 0){
                dbConn.query(
                {
                    sql: "INSERT INTO shop_info (domain, access_token) VALUES ('"+domain+"', '"+access_token+"')"
                }
                , (err, rows, fields) => {
                    if (err) throw err;
                })
            }
        })
    console.log("final save")
http_response.send("success here done")
    // http_response.redirect('dashboard');
});

app.get('/dashboard', async (http_request, http_response) => {
    console.log("4")
    
    var query = dbConn.query("SELECT * FROM shop_info", (err, results) => {
        console.log(results);
        // http_response.send("Successs")
        http_response.render('dashboard.ejs', {data : results });
    });
});
// app.get('/', async (http_request, http_response) => {
//     console.log("heree")
//     http_response.send("send response success")
// })
app.get('/database', async (http_request, http_response) => {
    console.log("databse")

    http_response.send("send response database")
})
app.listen(3000, () => console.log('Application is listening on port 3000.'));