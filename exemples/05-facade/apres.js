class VideoCompressor {
  compress(file) {
    console.log(`🗜️  Compression de ${file.name}...`);
    return {
      ...file,
      compressed: true,
      size: file.size * 0.5
    };
  }
}

class ThumbnailGenerator {
  generate(video) {
    console.log(`🖼️  Génération de miniature pour ${video.name}...`);
    return {
      videoId: video.name,
      url: `thumbnails/${video.name}.jpg`
    };
  }
}

class CloudStorage {
  upload(file, path) {
    console.log(`☁️  Upload vers ${path}/${file.name}...`);
    return {
      url: `https://cdn.example.com/${path}/${file.name}`,
      uploadedAt: new Date()
    };
  }
}

class VideoDatabase {
  save(videoData) {
    console.log(`💾 Sauvegarde en BD: ${videoData.name}`);
    return {
      id: Math.random().toString(36).substr(2, 9),
      ...videoData,
      createdAt: new Date()
    };
  }
}

class NotificationService {
  notify(message) {
    console.log(`🔔 Notification: ${message}`);
  }
}

class CacheService {
  invalidate(key) {
    console.log(`🗑️  Cache invalidé: ${key}`);
  }

  set(key, value) {
    console.log(`💾 Cache mis à jour: ${key}`);
  }
}

class UploadLinkOnSocialNetworksService {
    upload(link) {
        // console.log(`🌐 Lien uploadé sur les réseaux sociaux: ${link}`);
    }
}

class VideoUploadFacade {
  constructor() {
    this.compressor = new VideoCompressor();
    this.thumbnailGenerator = new ThumbnailGenerator();
    this.storage = new CloudStorage();
    this.database = new VideoDatabase();
    this.notificationService = new NotificationService();
    this.cache = new CacheService();
    this.uploadLinkOnSocialNetworks = new UploadLinkOnSocialNetworksService();
  }

  async uploadVideo(file) {
    console.log(`\n🎬 Début de l'upload de ${file.name}\n`);
    
    try {
      const compressed = this.compressor.compress(file);
      
      const thumbnail = this.thumbnailGenerator.generate(compressed);
      
      const videoUrl = this.storage.upload(compressed, 'videos');
      const thumbnailUrl = this.storage.upload({ name: thumbnail.url }, 'thumbnails');
      
      const videoRecord = this.database.save({
        name: file.name,
        videoUrl: videoUrl.url,
        thumbnailUrl: thumbnailUrl.url,
        originalSize: file.size,
        compressedSize: compressed.size
      });
      
      this.cache.invalidate('videos/latest');
      this.cache.set(`video/${videoRecord.id}`, videoRecord);
      
      this.notificationService.notify(`Vidéo "${file.name}" uploadée avec succès!`);
      this.uploadLinkOnSocialNetworks.upload(videoUrl.url);

      console.log(`\n✅ Upload terminé! ID: ${videoRecord.id}\n`);
      
      return videoRecord;
    } catch (error) {
      console.error(`❌ Erreur lors de l'upload: ${error.message}`);
      throw error;
    }
  }
}

const uploadFacade = new VideoUploadFacade();

uploadFacade.uploadVideo({
  name: 'tutorial.mp4',
  size: 104857600
});

