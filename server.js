const express = require('express');
const mongoose = require('mongoose');
const devuser = require('./devusermodel');
const app = express();
const jwt = require('jsonwebtoken');
const middleware = require('./middleware');
const reviewModel = require('./reviewmodel');
const cors = require('cors');


mongoose.connect('mongodb+srv://maheshasiram:Mahesh%401234@cluster0.8jqu5.mongodb.net/?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(
        () => console.log("db connected..!")
    )
    .catch(err => console.log("...err", err))

app.use(express.json());
app.use(cors({origin: '*'}));

app.get('/', (req, res) => {
    return res.send('Hello world...!')
});

app.post('/register', async (req, res) => {
    try {
        const { fullname, email, skill, password, confirmpassword } = req.body;
        const exists = await devuser.findOne({ email })

        if (exists) {
            return res.status(400).send('user Already registered')
        }
        if (password != confirmpassword) {
            return res.status(403).send('password doesnot match')
        }
        let newUser = new devuser({
            fullname, email, skill, password, confirmpassword
        })
        newUser.save();
        return res.status(200).send('user registered successfully ')
    }
    catch (err) {
        console.log("err", err);
        return res.status(500).send('server error');
    }


})

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        let exist = await devuser.findOne({ email })

        if (!exist) {
            return res.status(400).send('user not exists')
        }

        if (exist.password != password) {
            return res.status(400).send('invalid credentials')
        }

        let payload = {
            user: {
                id: exist.id
            }
        }

        jwt.sign(payload, 'jwtsecreat', { expiresIn: 3600000 }, (err, token) => {
            if (err) throw err;
            return res.json({ token });
        })
    }

    catch (err) {
        console.log("err", err);
        return res.status(500).send('server error');
    }
})

app.get('/allprofiles', middleware, async (req, res) => {
    try {
        let allProfiles = await devuser.find();
        return res.json(allProfiles);
    }
    catch (err) {
        console.log("err", err);
        return res.status(500).send('server error');
    }
});

app.get('/myprofile', middleware, async (req, res) => {
    try {
        let myProfile = await devuser.findById(req.user.id)
        return res.json(myProfile);
    }
    catch (err) {
        console.log("err", err);
        return res.status(500).send('server error');
    }
});

app.post('/addreview', middleware, async (req, res) => {
    try {
       const { taskworker, rating} = req.body;
       const exists = await devuser.findById(req.user.id);
      const newReview = new reviewModel({
        taskprovider: exists.fullname,
        taskworker, rating
      })

      newReview.save();
      return res.status(200).send('Review updated successfully');
    }
    catch (err) {
        console.log("err", err);
        return res.status(500).send('server error');
    }
});

app.get('/myreview', middleware, async (req, res) => {
    try {
        let allreview = await reviewModel.find();
        let myreview = allreview.filter(review=> review.taskworker.toString() === req.user.id.toString());
       
       return res.status(200).json(myreview);
    }
    catch (err) {
        console.log("err", err);
        return res.status(500).send('server error');
    }
});



app.listen(5000, () => console.log("server-running..."));