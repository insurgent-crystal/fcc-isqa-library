'use strict'

const expect      = require('chai').expect
const mongodb     = require('mongodb')
const MongoClient = require('mongodb').MongoClient
const ObjectId    = require('mongodb').ObjectID

const connection = MongoClient.connect(process.env.DATABASE, {useNewUrlParser: true})

const getID = stringID => {
  let id
  
  try {
    id = stringID ? new ObjectId(stringID) : 'invalid id'
  } 
  catch(error) {
    id = 'invalid id'
  }
  
  return id
}

module.exports = app => {

  app.route('/api/books')
    
    //Response will be array of book objects
    //JSON res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
    .get((req, res) => {      
      connection.then(client => {
        const db = client.db('library')
        
        db.collection('books')
          .find({})
          .toArray()
          .then(data => {
            return res.json(data.map(book => book = {
              _id          : book._id,
              title        : book.title,
              commentcount : book.commentcount
            }))
          })
          .catch(error => {
            console.log('Database error' + error)
            return res.type('text').send('could not find books')
          })
      })
      .catch(error => {
        console.log('Connection error: ' + error)
        return res.type('text').send('database connection error')
      })
    
    })
    
    //Adds new book
    //Response will contain new book object including atleast _id and title
    .post((req, res) => {      
      if (req.body.title) {
        
        connection.then(client => {
          const db = client.db('library')
          
          db.collection('books')
            .insertOne({
              title: req.body.title,
              commentcount: 0,
              comments: []
            })
            .then(data => {
              console.log('New book submitted: ' + data.ops[0].title + ' | ' + data.ops[0]._id)
              return res.json({
                _id   : data.ops[0]._id,
                title : data.ops[0].title
              })
            })
            .catch(error => {
              console.log('Database error' + error)
              return res.type('text').send('could not insert a book')
            })
          
        })
        .catch(error => {
          console.log('Connection error: ' + error)
          return res.type('text').send('database connection error')
        })
        
      } else {
        return res.type('text').send('title not present')
      }
    
    })
    
    //Basically drops database
    //If successful response will be 'complete delete successful'
    .delete((req, res) => {
      
      connection.then(client => {
        const db = client.db('library')
          
        db.collection('books')
          .deleteMany({})
          .then(() => {
            console.log('Database has been dropped')
            return res.type('text').send('complete delete successful')
          })
          .catch(error => {
            console.log('Database error' + error)
            return res.type('text').send('could not delete')
          })
          
      })
      .catch(error => {
        console.log('Connection error: ' + error)
        return res.type('text').send('database connection error')
      })
      
    })


  app.route('/api/books/:id')
    
    //Gets individial book
    //JSON res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
    .get((req, res) => {
      const id = getID(req.params.id)
      
      if (id !== 'invalid id') {
        
        connection.then(client => {
          const db = client.db('library')
          
          db.collection('books')
            .findOne({
              _id: id
            })
            .then(data => {
              return res.json({
                _id: data._id,
                title: data.title,
                comments: data.comments
              })
            })
            .catch(error => {
              console.log('Database error' + error)
              return res.type('text').send('could not find a book')
            })
          
        })
        .catch(error => {
          console.log('Connection error: ' + error)
          return res.type('text').send('database connection error')
        })
        
      } else {
        return res.type('text').send('no book exists')
      }
    })
    
    //Adds comment to book
    //JSON res format same as .get
    .post((req, res) => {
      
      if(!req.body.comment) {
        return res.type('text').send('Cannot add empty comment')
      }
      
      const id = getID(req.params.id)
      
      if (id !== 'invalid id') {
        
        connection.then(client => {
          const db = client.db('library')
          
          db.collection('books')
            .findOneAndUpdate({
              _id: id
            }, {
              $push: {comments: req.body.comment},
              $inc: {commentcount: 1}
            })
            .then(data => {
              console.log('New comment submitted: ' + req.body.comment + ' for ' + req.params.id)
              return res.json({
                _id: data.value._id,
                title: data.value.title,
                comments: data.value.comments.concat(req.body.comment)
              })
            })
            .catch(error => {
              console.log('Database error' + error)
              return res.type('text').send('could not add a comment')
            })
          
        })
        .catch(error => {
          console.log('Connection error: ' + error)
          return res.type('text').send('database connection error')
        })
        
      } else {
        return res.type('text').send('invalid id')
      }
    })
    
    //Deletes one book
    //if successful response will be 'delete successful'
    .delete((req, res) => {      
      const id = getID(req.params.id)
      
      if (id !== 'invalid id') {
        
        connection.then(client => {
          const db = client.db('library')
          
          db.collection('books')
            .findOneAndDelete({
              _id: id
            })
            .then(() => {
              console.log('Deleted: ' + req.params.id)
              return res.type('text').send('delete successful')
            })
            .catch(error => {
              console.log('Database error' + error)
              return res.type('text').send('could not delete a book')
            })
          
        })
        .catch(error => {
          console.log('Connection error: ' + error)
          return res.type('text').send('database connection error')
        })
        
      } else {
        return res.type('text').send('invalid id')
      }
    })
  
}
