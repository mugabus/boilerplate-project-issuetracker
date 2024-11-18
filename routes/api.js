'use strict';

module.exports = function (app) {
  
  // Mock database object (this should be replaced with a real database)
  const database = {};

  // Helper function to save an issue to the database (mock implementation)
  function saveToDatabase(project, issue) {
    if (!database[project]) {
      database[project] = [];
    }
    database[project].push(issue);
  }

  // Helper function to get issues from the database with optional filters (mock implementation)
  function getIssuesFromDatabase(project, filters) {
    let issues = database[project] || [];
    if (filters) {
      issues = issues.filter(issue => {
        return Object.keys(filters).every(key => issue[key] == filters[key]);
      });
    }
    return issues;
  }

  // Helper function to update an issue in the database (mock implementation)
  function updateIssueInDatabase(project, _id, updates) {
    const issues = database[project] || [];
    const issueIndex = issues.findIndex(issue => issue._id === _id);
    if (issueIndex > -1) {
      const updatedIssue = {
        ...issues[issueIndex],
        ...updates,
        updated_on: new Date()
      };
      issues[issueIndex] = updatedIssue;
      return updatedIssue;
    }
    return null;
  }

  // Helper function to delete an issue from the database (mock implementation)
  function deleteIssueFromDatabase(project, _id) {
    const issues = database[project] || [];
    const issueIndex = issues.findIndex(issue => issue._id === _id);
    if (issueIndex > -1) {
      issues.splice(issueIndex, 1); // Remove the issue
      return true;
    }
    return false;
  }

  // POST request to create a new issue
  app.route('/api/issues/:project')
    .post(function (req, res) {
      const project = req.params.project;

      // Required fields
      const { issue_title, issue_text, created_by } = req.body;
      // Optional fields
      const assigned_to = req.body.assigned_to || "";
      const status_text = req.body.status_text || "";

      // Check for missing required fields
      if (!issue_title || !issue_text || !created_by) {
        return res.json({ error: 'required field(s) missing' });
      }

      // Construct the new issue object
      const newIssue = {
        _id: new Date().getTime().toString(), // Generate a mock unique ID
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text,
        created_on: new Date(),
        updated_on: new Date(),
        open: true
      };

      // Save to the database
      saveToDatabase(project, newIssue);

      // Return the newly created issue
      res.json(newIssue);
    })
    
    // GET request to retrieve issues with optional filters
    .get(function (req, res) {
      const project = req.params.project;
      const filters = req.query;

      // Fetch issues from the database based on the project name and filters
      const issues = getIssuesFromDatabase(project, filters);

      // Return the list of issues
      res.json(issues);
    })
    
    // PUT request to update an issue
    .put(function (req, res) {
      const project = req.params.project;
      const { _id, ...fieldsToUpdate } = req.body;

      // Check if _id is provided
      if (!_id) {
        return res.json({ error: 'missing _id' });
      }

      // Check if there's anything to update
      if (Object.keys(fieldsToUpdate).length === 0) {
        return res.json({ error: 'no update field(s) sent', '_id': _id });
      }

      // Find and update the issue in the database
      const issue = updateIssueInDatabase(project, _id, fieldsToUpdate);

      if (issue) {
        res.json({ result: 'successfully updated', _id });
      } else {
        res.json({ error: 'could not update', '_id': _id });
      }
    })
    
    // DELETE request to delete an issue
    .delete(function (req, res) {
      const project = req.params.project;
      const { _id } = req.body;

      // Check if _id is provided
      if (!_id) {
        return res.json({ error: 'missing _id' });
      }

      // Delete the issue from the database
      const deleted = deleteIssueFromDatabase(project, _id);

      if (deleted) {
        res.json({ result: 'successfully deleted', _id });
      } else {
        res.json({ error: 'could not delete', '_id': _id });
      }
    });
};
