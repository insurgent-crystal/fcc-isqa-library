var chaiHttp = require('chai-http')
var chai     = require('chai')
var assert   = chai.assert
var server   = require('../server')

chai.use(chaiHttp)

suite('Functional Tests', () => {

  /*
  * ----[EXAMPLE TEST]----
  * Each test should completely test the response of the API end-point including response status code!
  */
  test('#example Test GET /api/books', done => {
    chai.request(server)
      .get('/api/books')
      .end((err, res) => {
        assert.equal(res.status, 200)
        assert.isArray(res.body, 'response should be an array')
        assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount')
        assert.property(res.body[0], 'title', 'Books in array should contain title')
        assert.property(res.body[0], '_id', 'Books in array should contain _id')
      
        done()
      })
  })
  /*
  * ----[END of EXAMPLE TEST]----
  */

  suite('Routing tests', () => {


    suite('POST /api/books with title => create book object/expect book object', () => {
      
      test('Test POST /api/books with title', done => {
        chai.request(server)
          .post('/api/books')
          .send({
            title: '__TEST'
          })
          .end((err, res) => {
            assert.equal(res.status, 200)
            assert.equal(res.body.title, '__TEST')

            done()
          })
      })
      
      test('Test POST /api/books with no title given', done => {
        chai.request(server)
          .post('/api/books')
          .send({
            random: 'shit'
          })
          .end((err, res) => {
            assert.equal(res.status, 200)
            assert.equal(res.text, 'title not present')

            done()
          })
      })
      
    })


    suite('GET /api/books => array of books', () => {
      
      test('Test GET /api/books', done => {
        chai.request(server)
          .get('/api/books')
          .end((err, res) => {
            assert.equal(res.status, 200)
            assert.isArray(res.body)
            assert.property(res.body[0], 'commentcount')
            assert.property(res.body[0], 'title')
            assert.property(res.body[0], '_id')

            done()
          })
      })
      
    })


    suite('GET /api/books/[id] => book object with [id]', () => {
      
      test('Test GET /api/books/[id] with id not in db',  done => {
        chai.request(server)
          .get('/api/books/randomshit')
          .end((err, res) => {
            assert.equal(res.status, 200)
            assert.equal(res.text, 'no book exists')

            done()
          })
      })
      
      test('Test GET /api/books/[id] with valid id in db',  done => {
        chai.request(server)
          .post('/api/books')
          .send({
            title: '__TEST'
          })
          .end((err, res) => {
            const ID = res.body._id
            
            chai.request(server)
              .get('/api/books/' + ID)
              .end((err, res) => {
                assert.equal(res.status, 200)
                assert.equal(res.body._id, ID)
                assert.equal(res.body.title, '__TEST')

                done()
              })
          })
      })
      
    })


    suite('POST /api/books/[id] => add comment/expect book object with id', () => {
      
      test('Test POST /api/books/[id] with comment', done => {
        chai.request(server)
          .post('/api/books')
          .send({
            title: '__TEST'
          })
          .end((err, res) => {
            const ID = res.body._id
            
            chai.request(server)
              .post('/api/books/' + ID)
              .send({
                comment: 'TESTCOMM'
              })
              .end((err, res) => {
                assert.equal(res.status, 200)
                assert.equal(res.body.comments[0], 'TESTCOMM')

                done()
              })
          })
      })
      
    })

  })

})
