  
const express = require('express');
const router = express.Router();
const multer = require('multer');
const auth = require("../middleware/auth");
const { Video } = require("../models/Video");
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}_${file.originalname}`)
    }
    // fileFilter: (req, file, cb) => {
    //     const ext = path.extname(file.originalname)
    //     if (ext !== '.mp4') {
    //         return cb(res.status(400).end('only jpg, png, mp4 is allowed'), false);
    //     }
    //     cb(null, true)
    // }
})

var upload = multer({ storage: storage }).any();

router.post("/upload",auth,(req, res) => {

    upload(req, res, err => {
        if (err) {
            console.log(err);
            return res.json({ success: false, err })
        }
        const info = {
            writer:req.user.id,
            filePath:`http://localhost:${process.env.PORT}/${req.files[0].path}`
        }
        const video = new Video(info);
        video.save((err,video) => {
            if(err){
                return res.status(400).json({err})
            }
            console.log(video);
            return res.json(video);
        });
    })

});


router.get("/getVideos", (req, res) => {

    Video.find()
        .populate('writer')
        .exec((err, videos) => {
            if(err) return res.status(400).send(err);
            res.status(200).json({ success: true, videos })
        })

});



router.get("/getUserVideos", auth,(req, res) => {

    Video.find({ writer : req.user.id })
    .select("-writer")
    .exec((err, videos) => {
        if(err) return res.status(400).send(err);
        console.log(videos);
        var arr=[];
        videos.forEach((video) => {
            arr.push(video.filePath);
        });
        res.status(200).json({ videos : arr })
    })
});


module.exports = router;