import {
  getMultipleFilesPath,
  getSingleFilePath,
} from '../../../shared/getFilePath';
import { Request } from 'express';

export const formatEventPayloadWithFiles = (req: Request) => {
  const image = getSingleFilePath(req.files, 'image');
  const avatarFiles = getMultipleFilesPath(req.files, 'avatar');
  const singleAvatar = getSingleFilePath(req.files, 'avatar');

  let data = req.body.data
    ? typeof req.body.data === 'string'
      ? JSON.parse(req.body.data)
      : req.body.data
    : req.body;

  // If data was wrapped in { body: ... } by validation middleware
  if (data?.body && typeof data.body === 'object') {
    data = data.body;
  }

  if (image) {
    data.image = image;
  }

  // Parse speakers array if passed as JSON string
  if (typeof data.speakers === 'string') {
    try {
      data.speakers = JSON.parse(data.speakers);
    } catch {
      // Keep as-is if parsing fails
    }
  }

  // Support single speaker object `speaker`
  if (!data.speakers && data.speaker) {
    let sp = data.speaker;
    if (typeof sp === 'string') {
      try {
        sp = JSON.parse(sp);
      } catch {}
    }
    data.speakers = [sp];
    delete data.speaker;
  }

  // Support root-level speaker fields (speakerName, speakerRole)
  if (!data.speakers && (data.speakerName || data.speakerRole)) {
    data.speakers = [
      {
        name: data.speakerName || '',
        role: data.speakerRole || '',
        avatar: '',
      },
    ];
    delete data.speakerName;
    delete data.speakerRole;
  }

  // Place uploaded avatar files inside speakerSchema
  if (avatarFiles && avatarFiles.length > 0) {
    if (!Array.isArray(data.speakers)) {
      data.speakers = [];
    }

    avatarFiles.forEach((avatarPath, idx) => {
      if (data.speakers[idx]) {
        data.speakers[idx].avatar = avatarPath;
      } else {
        data.speakers.push({
          name: 'Featured Speaker',
          role: 'Speaker',
          avatar: avatarPath,
        });
      }
    });
  } else if (singleAvatar) {
    if (Array.isArray(data.speakers) && data.speakers.length > 0) {
      data.speakers[0].avatar = singleAvatar;
    } else if (data.speakers && !Array.isArray(data.speakers)) {
      data.speakers = [{ ...data.speakers, avatar: singleAvatar }];
    } else {
      data.speakers = [
        {
          name: 'Featured Speaker',
          role: 'Speaker',
          avatar: singleAvatar,
        },
      ];
    }
  }

  // If data.avatar was provided at the root (e.g. image URL), associate with speakerSchema
  if (data.avatar) {
    if (Array.isArray(data.speakers) && data.speakers.length > 0) {
      if (!data.speakers[0].avatar) {
        data.speakers[0].avatar = data.avatar;
      }
    } else {
      data.speakers = [
        {
          name: 'Featured Speaker',
          role: 'Speaker',
          avatar: data.avatar,
        },
      ];
    }
    delete data.avatar; // Ensure avatar is never saved on Event root
  }

  return data;
};
