const { song_url_v1, song_detail, song_download_url } = require("NeteaseCloudMusicApi");

const cookie = "MUSIC_A_T=1486229059031; Max-Age=2147483647; Expires=Thu, 17 Apr 2092 22:17:18 GMT; Path=/openapi/clientlog;;MUSIC_A_T=1486229059031; Max-Age=2147483647; Expires=Thu, 17 Apr 2092 22:17:18 GMT; Path=/wapi/feedback;;MUSIC_R_T=1486229189929; Max-Age=2147483647; Expires=Thu, 17 Apr 2092 22:17:18 GMT; Path=/eapi/feedback;;MUSIC_R_T=1486229189929; Max-Age=2147483647; Expires=Thu, 17 Apr 2092 22:17:18 GMT; Path=/wapi/clientlog;;MUSIC_R_T=1486229189929; Max-Age=2147483647; Expires=Thu, 17 Apr 2092 22:17:18 GMT; Path=/eapi/clientlog;;MUSIC_R_T=1486229189929; Max-Age=2147483647; Expires=Thu, 17 Apr 2092 22:17:18 GMT; Path=/neapi/feedback;;MUSIC_A_T=1486229059031; Max-Age=2147483647; Expires=Thu, 17 Apr 2092 22:17:18 GMT; Path=/eapi/feedback;;MUSIC_SNS=; Max-Age=0; Expires=Sat, 30 Mar 2024 19:03:11 GMT; Path=/;MUSIC_R_T=1486229189929; Max-Age=2147483647; Expires=Thu, 17 Apr 2092 22:17:18 GMT; Path=/neapi/clientlog;;MUSIC_R_T=1486229189929; Max-Age=2147483647; Expires=Thu, 17 Apr 2092 22:17:18 GMT; Path=/openapi/clientlog;;MUSIC_A_T=1486229059031; Max-Age=2147483647; Expires=Thu, 17 Apr 2092 22:17:18 GMT; Path=/wapi/clientlog;;__csrf=ae973825dd4d00464a04473b08b6836e; Max-Age=1296010; Expires=Sun, 14 Apr 2024 19:03:21 GMT; Path=/;;MUSIC_A_T=1486229059031; Max-Age=2147483647; Expires=Thu, 17 Apr 2092 22:17:18 GMT; Path=/api/clientlog;;MUSIC_U=00B47CF277A8FE26EF00EC4B05C9D4D06CAB52AE45BE026D66C444356D34EB58D7F6F34569914B640EE69C68191129417BD451083A8C560CB8157E6EF4984C5976CDBF9C7E049C8CE37FDC06F7F5EE50E6DCF132966B3E9C332D0DE80FD0194B1A541EFF159AE9164CEC0B067ADEBF7CA15F86107463E582D8D90DF4382CE88E7086F0258826E974CFA89788DB1951EA726186BB0F94BDA14C9E470DC5979AE3800E078D8EF7341DA38D67D61B6FD1BCDBC0B6253E5B4604B471F1A4CDFC1C18FC2746259DC985B462165A6C1E49DBFABAD745BEB32D45037B0D4DC70AAF2C2A471962AE4C021A0416DC65A4C05442E7DF23E6FA1BFEB9E94835932EA0C8D8206CF5D27C3F93E7391BA2E5D84FBC9E3D8F7655BBA7A64CD833E7D163D19C0279374C0E24E4D77653587F7E3DEF5C0C1BABBE84A522D116DA0BD7D6C915830C4EC16BC5F11FDFC3F67BEC9DDF2B53BA867F; Max-Age=15552000; Expires=Thu, 26 Sep 2024 19:03:11 GMT; Path=/;;MUSIC_R_T=1486229189929; Max-Age=2147483647; Expires=Thu, 17 Apr 2092 22:17:18 GMT; Path=/wapi/feedback;;MUSIC_R_T=1486229189929; Max-Age=2147483647; Expires=Thu, 17 Apr 2092 22:17:18 GMT; Path=/weapi/clientlog;;MUSIC_R_T=1486229189929; Max-Age=2147483647; Expires=Thu, 17 Apr 2092 22:17:18 GMT; Path=/api/feedback;;MUSIC_A_T=1486229059031; Max-Age=2147483647; Expires=Thu, 17 Apr 2092 22:17:18 GMT; Path=/weapi/feedback;;MUSIC_R_T=1486229189929; Max-Age=2147483647; Expires=Thu, 17 Apr 2092 22:17:18 GMT; Path=/weapi/feedback;;MUSIC_A_T=1486229059031; Max-Age=2147483647; Expires=Thu, 17 Apr 2092 22:17:18 GMT; Path=/neapi/clientlog;;MUSIC_A_T=1486229059031; Max-Age=2147483647; Expires=Thu, 17 Apr 2092 22:17:18 GMT; Path=/weapi/clientlog;;MUSIC_A_T=1486229059031; Max-Age=2147483647; Expires=Thu, 17 Apr 2092 22:17:18 GMT; Path=/api/feedback;;MUSIC_A_T=1486229059031; Max-Age=2147483647; Expires=Thu, 17 Apr 2092 22:17:18 GMT; Path=/eapi/clientlog;;NMTID=00Osi-29Zm54hz9_EgRuVBTBZisxosAAAGOkL6OMA; Max-Age=315360000; Expires=Tue, 28 Mar 2034 19:03:11 GMT; Path=/;;MUSIC_A_T=1486229059031; Max-Age=2147483647; Expires=Thu, 17 Apr 2092 22:17:18 GMT; Path=/neapi/feedback;;MUSIC_R_T=1486229189929; Max-Age=2147483647; Expires=Thu, 17 Apr 2092 22:17:18 GMT; Path=/api/clientlog;";
(async () => {
    // const g = await song_url_v1({
    //     id: 2080178500,
    //     level: "jymaster",
    //     cookie,
    //     realIP: '211.161.244.70'
    // });
    // console.log(g.body.data);

    const g = await song_url_v1({
        id: "2672193934",
        level: "lossless",
        cookie,
        realIP: '211.161.244.70'
    });
    const b1 = await song_detail({
        ids: "2672193934,2672334020",
        //cookie,
        realIP: '211.161.244.70'
    })

    const b2 = await song_download_url({
        id: "2672193934",
        cookie,
        realIP: '211.161.244.70'
    })

    console.log(g.body.data);
    //console.log(b1.body);
    //console.log(b2.body);


})()