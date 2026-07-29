const playlistService = require('../services/PlaylistService');
const { createAppError } = require('../utils/AppError');
const knex = require('../config/database');

exports.globalSearch = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { q, type, limit = 50, offset = 0 } = req.query;

    if (!q || q.trim() === '') {
      return res.json({ success: true, results: [], total: 0 });
    }

    const searchTerm = `%${q.trim()}%`;

    let query = knex('channels')
      .join('playlists', 'channels.playlist_id', '=', 'playlists.id')
      .where('playlists.user_id', userId)
      .andWhere(builder => {
        builder.where('channels.name', 'ILIKE', searchTerm)
               .orWhere('channels.category_name', 'ILIKE', searchTerm);
      })
      .select(
        'channels.id as channel_id',
        'channels.name as channel_name',
        'channels.logo_url',
        'channels.stream_url',
        'channels.category_name',
        'channels.stream_type',
        'playlists.id as playlist_id',
        'playlists.name as playlist_name'
      );

    if (type) {
      query = query.andWhere('channels.stream_type', type);
    }

    const results = await query.limit(limit).offset(offset);

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    next(error);
  }
};
/**
 * GET /api/playlists
 */
async function listPlaylists(req, res, next) {
  try {
    const playlists = await playlistService.list(req.userId);
    res.json(playlists);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/playlists
 */
async function createPlaylist(req, res, next) {
  try {
    const { name } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0 || name.length > 255) {
      throw createAppError('VALIDATION_ERROR', 'name alanı zorunludur');
    }

    const playlist = await playlistService.create(req.userId, { name: name.trim() });
    res.status(201).json(playlist);
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/playlists/:id
 */
async function updatePlaylist(req, res, next) {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0 || name.length > 255) {
      throw createAppError('VALIDATION_ERROR', 'name alanı zorunludur');
    }

    const playlist = await playlistService.update(req.userId, id, { name: name.trim() });
    res.json(playlist);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/playlists/:id
 */
async function deletePlaylist(req, res, next) {
  try {
    const { id } = req.params;
    await playlistService.delete(req.userId, id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

module.exports = { listPlaylists, createPlaylist, updatePlaylist, deletePlaylist };
