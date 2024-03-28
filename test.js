const request = require('supertest');

const app = require('./app.js');

const chai = require('chai');

const expect = chai.expect;

 

describe('Health Check Endpoint', function() {

    it('Return 200 OK when the database is connected.', async function() {

        const response = await request(app).get('/healthz');

        expect(response.status).to.equal(200);

     

    });

 

 

});


 

 

