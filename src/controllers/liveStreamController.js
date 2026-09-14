import LiveStream from '../models/LiveStream.js';

const extractYouTubeId = (url) => {
  if (!url) return '9ThLarUCcas';
  const trimmed = url.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  const regExp = /^.*(?:youtu\.be\/|v\/|u\/\w\/|embed\/|live\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = trimmed.match(regExp);
  if (match && match[1] && match[1].length === 11) return match[1];
  return trimmed;
};

export const liveStreamController = {
  async get(req, res, next) {
    try {
      let stream = await LiveStream.findOne();
      if (!stream) {
        stream = await LiveStream.create({
          youtubeUrl: 'https://www.youtube.com/watch?v=9ThLarUCcas',
          videoId: '9ThLarUCcas',
          isLive: true,
          title: 'Mumbai Cha Raja Live',
          description: '',
          targetDate: '2025-08-27T08:00:00+05:30',
        });
      }
      res.json({
        success: true,
        data: stream,
      });
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const { youtubeUrl, videoId, isLive, title, description, targetDate } = req.body;
      const finalVideoId = videoId || extractYouTubeId(youtubeUrl);

      let stream = await LiveStream.findOne();
      if (stream) {
        await stream.update({
          youtubeUrl: youtubeUrl || stream.youtubeUrl,
          videoId: finalVideoId,
          isLive: isLive !== undefined ? isLive : stream.isLive,
          title: title !== undefined ? title : stream.title,
          description: description !== undefined ? description : stream.description,
          targetDate: targetDate !== undefined ? targetDate : stream.targetDate,
        });
      } else {
        stream = await LiveStream.create({
          youtubeUrl: youtubeUrl || 'https://www.youtube.com/watch?v=9ThLarUCcas',
          videoId: finalVideoId,
          isLive: isLive !== undefined ? isLive : true,
          title: title || 'Mumbai Cha Raja Live',
          description: description || '',
          targetDate: targetDate || '2025-08-27T08:00:00+05:30',
        });
      }

      res.json({
        success: true,
        data: stream,
        message: 'Live stream settings updated successfully',
      });
    } catch (error) {
      next(error);
    }
  },
};
