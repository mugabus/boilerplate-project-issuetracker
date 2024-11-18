const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

  let testId; // Store an _id for testing updates and deletes

  // Test to create an issue with every field
  test('Create an issue with every field: POST request to /api/issues/{project}', function(done) {
    chai.request(server)
      .post('/api/issues/test')
      .send({
        issue_title: 'Test Title',
        issue_text: 'Test text for issue',
        created_by: 'Tester',
        assigned_to: 'Test Assignee',
        status_text: 'In Progress'
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.issue_title, 'Test Title');
        assert.equal(res.body.issue_text, 'Test text for issue');
        assert.equal(res.body.created_by, 'Tester');
        assert.equal(res.body.assigned_to, 'Test Assignee');
        assert.equal(res.body.status_text, 'In Progress');
        assert.property(res.body, 'created_on');
        assert.property(res.body, 'updated_on');
        assert.property(res.body, '_id');
        assert.property(res.body, 'open');
        testId = res.body._id; // Save _id for later tests
        done();
      });
  });

  // Test to create an issue with only required fields
  test('Create an issue with only required fields: POST request to /api/issues/{project}', function(done) {
    chai.request(server)
      .post('/api/issues/test')
      .send({
        issue_title: 'Required Fields Test',
        issue_text: 'Test with only required fields',
        created_by: 'Tester'
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.issue_title, 'Required Fields Test');
        assert.equal(res.body.issue_text, 'Test with only required fields');
        assert.equal(res.body.created_by, 'Tester');
        assert.equal(res.body.assigned_to, '');
        assert.equal(res.body.status_text, '');
        assert.property(res.body, 'created_on');
        assert.property(res.body, 'updated_on');
        assert.property(res.body, '_id');
        assert.property(res.body, 'open');
        done();
      });
  });

  // Test to create an issue with missing required fields
  test('Create an issue with missing required fields: POST request to /api/issues/{project}', function(done) {
    chai.request(server)
      .post('/api/issues/test')
      .send({
        issue_title: 'Test Title'
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'required field(s) missing');
        done();
      });
  });

  // Test to view issues on a project
  test('View issues on a project: GET request to /api/issues/{project}', function(done) {
    chai.request(server)
      .get('/api/issues/test')
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        done();
      });
  });

  // Test to view issues on a project with one filter
  test('View issues on a project with one filter: GET request to /api/issues/{project}', function(done) {
    chai.request(server)
      .get('/api/issues/test')
      .query({ created_by: 'Tester' })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        res.body.forEach(issue => {
          assert.equal(issue.created_by, 'Tester');
        });
        done();
      });
  });

  // Test to view issues on a project with multiple filters
  test('View issues on a project with multiple filters: GET request to /api/issues/{project}', function(done) {
    chai.request(server)
      .get('/api/issues/test')
      .query({ created_by: 'Tester', open: true })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        res.body.forEach(issue => {
          assert.equal(issue.created_by, 'Tester');
          assert.equal(issue.open, true);
        });
        done();
      });
  });

  // Test to update one field on an issue
  test('Update one field on an issue: PUT request to /api/issues/{project}', function(done) {
    chai.request(server)
      .put('/api/issues/test')
      .send({
        _id: testId,
        issue_title: 'Updated Title'
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.result, 'successfully updated');
        assert.equal(res.body._id, testId);
        done();
      });
  });

  // Test to update multiple fields on an issue
  test('Update multiple fields on an issue: PUT request to /api/issues/{project}', function(done) {
    chai.request(server)
      .put('/api/issues/test')
      .send({
        _id: testId,
        issue_title: 'Updated Title Again',
        status_text: 'Updated Status'
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.result, 'successfully updated');
        assert.equal(res.body._id, testId);
        done();
      });
  });

  // Test to update an issue with missing _id
  test('Update an issue with missing _id: PUT request to /api/issues/{project}', function(done) {
    chai.request(server)
      .put('/api/issues/test')
      .send({
        issue_title: 'Missing _id'
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'missing _id');
        done();
      });
  });

  // Test to update an issue with no fields to update
  test('Update an issue with no fields to update: PUT request to /api/issues/{project}', function(done) {
    chai.request(server)
      .put('/api/issues/test')
      .send({ _id: testId })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'no update field(s) sent');
        assert.equal(res.body._id, testId);
        done();
      });
  });

  // Test to update an issue with an invalid _id
  test('Update an issue with an invalid _id: PUT request to /api/issues/{project}', function(done) {
    chai.request(server)
      .put('/api/issues/test')
      .send({
        _id: 'invalid_id',
        issue_title: 'Invalid ID Update'
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'could not update');
        assert.equal(res.body._id, 'invalid_id');
        done();
      });
  });

  // Test to delete an issue
  test('Delete an issue: DELETE request to /api/issues/{project}', function(done) {
    chai.request(server)
      .delete('/api/issues/test')
      .send({ _id: testId })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.result, 'successfully deleted');
        assert.equal(res.body._id, testId);
        done();
      });
  });

  // Test to delete an issue with an invalid _id
  test('Delete an issue with an invalid _id: DELETE request to /api/issues/{project}', function(done) {
    chai.request(server)
      .delete('/api/issues/test')
      .send({ _id: 'invalid_id' })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'could not delete');
        assert.equal(res.body._id, 'invalid_id');
        done();
      });
  });

  // Test to delete an issue with missing _id
  test('Delete an issue with missing _id: DELETE request to /api/issues/{project}', function(done) {
    chai.request(server)
      .delete('/api/issues/test')
      .send({})
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'missing _id');
        done();
      });
  });
});
