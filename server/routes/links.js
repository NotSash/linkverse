/**
 * Links Routes — server/routes/links.js
 *
 * Protected routes for managing bio-links.
 * All routes require authentication (auth middleware).
 *
 * Route order matters — specific paths BEFORE parameterized paths.
 */

const express = require('express');
const router = express.Router();

const { auth } = require('../middleware/auth');
const { validate, addLinkValidation } = require('../middleware/validate');
const linkController = require('../controllers/linkController');

// GET /api/links — Get all links
router.get('/', auth, linkController.getLinks);

// POST /api/links — Add a new link (validated)
router.post('/', auth, validate(addLinkValidation), linkController.addLink);

// PUT /api/links/reorder — Reorder links (must be BEFORE /:id)
router.put('/reorder', auth, linkController.reorderLinks);

// PUT /api/links/:id/toggle — Toggle active/inactive (must be BEFORE /:id)
router.put('/:id/toggle', auth, linkController.toggleLink);

// PUT /api/links/:id — Update a link
router.put('/:id', auth, linkController.updateLink);

// DELETE /api/links/:id — Delete a link
router.delete('/:id', auth, linkController.deleteLink);

module.exports = router;