import express from 'express';
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/test', (req,res) => {
  res.json({
    value: "this is a test, better test, improved"
  });
})

//module.exports = router;
export = router;
