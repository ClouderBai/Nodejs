var typeorm = require("typeorm");
const { i_ads_cust_algnmnt } = require("./model/i_ads_cust_algnmnt_tier_vw")

typeorm
  .createConnection({
    type: "postgres",
    host: "192.168.100.46",
    port: 5432,
    username: "postgres",
    password: "Win2008",
    database: "cmds",
    schema: 'cmd_owner',
    synchronize: true,
    entities: [
        require("./entity/i_ads_cust_algnmnt_tier_vw"), 
    ]
  })
  .then(function(connection) {
    // var postRepository = connection.getRepository(i_ads_cust_algnmnt);
    return connection.createQueryRunner().query(`
        select * from i_ads_cust_algnmnt
    `)
    return postRepository.find()
  })
  .then(function(allPosts) {
    console.log("All posts: ", allPosts);
    return 
})
  .catch(function(error) {
    console.log("Error: ", error);
  });