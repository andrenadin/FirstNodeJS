if (process.env.node_env === 'production') {
    module.exports = { mongoURI: 'mongodb://<anadin>:<hondahornet600>@ds111279.mlab.com:11279/cms-prod' }
} else {
    module.exports = { mongoURI: 'mongodb://localhost/cms' }
}